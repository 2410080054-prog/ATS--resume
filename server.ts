import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse.js";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("ats.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-ats-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    job_description TEXT,
    match_score REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const upload = multer({ storage: multer.memoryStorage() });

// --- Helper Functions ---

function tokenize(text: string) {
  return text.toLowerCase().match(/\w+/g) || [];
}

function calculateCosineSimilarity(text1: string, text2: string) {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  const allTokens = new Set([...tokens1, ...tokens2]);
  const vector1: Record<string, number> = {};
  const vector2: Record<string, number> = {};

  allTokens.forEach(token => {
    vector1[token] = tokens1.filter(t => t === token).length;
    vector2[token] = tokens2.filter(t => t === token).length;
  });

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  allTokens.forEach(token => {
    dotProduct += vector1[token] * vector2[token];
    magnitude1 += vector1[token] ** 2;
    magnitude2 += vector2[token] ** 2;
  });

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return (dotProduct / (magnitude1 * magnitude2)) * 100;
}

// --- Middleware ---

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    stmt.run(username, email, hashedPassword);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30m' });
    res.json({ token, username: user.username });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// --- ATS Routes ---

app.post("/api/match", authenticateToken, upload.single('resume'), async (req: any, res) => {
  const { jobDescription } = req.body;
  const file = req.file;

  if (!file || !jobDescription) {
    return res.status(400).json({ error: "Missing resume or job description" });
  }

  try {
    const data = await pdf(file.buffer);
    const resumeText = data.text;
    const score = calculateCosineSimilarity(resumeText, jobDescription);

    const stmt = db.prepare("INSERT INTO matches (user_id, job_description, match_score) VALUES (?, ?, ?)");
    stmt.run(req.user.id, jobDescription, score);

    res.json({ score: score.toFixed(2), resumeTextSnippet: resumeText.substring(0, 200) });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process resume: " + error.message });
  }
});

app.get("/api/history", authenticateToken, (req: any, res) => {
  const history = db.prepare("SELECT * FROM matches WHERE user_id = ? ORDER BY timestamp DESC").all(req.user.id);
  res.json(history);
});

// --- Vite Integration ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
