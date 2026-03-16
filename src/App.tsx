import React, { useState, useEffect, Component, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  LogIn, 
  UserPlus, 
  LogOut, 
  FileText, 
  Upload, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- API Service ---
const API_URL = '';

const api = {
  async post(endpoint: string, data: any, token?: string) {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async get(endpoint: string, token: string) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },
  async upload(endpoint: string, formData: FormData, token: string) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  }
};

// --- Components ---

const Navbar = ({ user, onLogout }: { user: any, onLogout: () => void }) => (
  <nav className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900">
      <div className="bg-zinc-900 text-white p-1.5 rounded-lg">
        <FileText size={20} />
      </div>
      ATS Matcher
    </Link>
    <div className="flex items-center gap-6">
      {user ? (
        <>
          <Link to="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link to="/history" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
            <HistoryIcon size={16} /> History
          </Link>
          <div className="h-4 w-px bg-zinc-200" />
          <span className="text-sm text-zinc-500">Hi, {user.username}</span>
          <button 
            onClick={onLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
            <LogIn size={16} /> Login
          </Link>
          <Link to="/register" className="bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
            Get Started
          </Link>
        </>
      )}
    </div>
  </nav>
);

const Login = ({ onLogin }: { onLogin: (token: string, username: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await api.post('/api/auth/login', { email, password });
    if (res.token) {
      onLogin(res.token, res.username);
      navigate('/dashboard');
    } else {
      setError(res.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl border border-zinc-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-zinc-900">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
          <input 
            type="email" 
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
          <input 
            type="password" 
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm flex items-center gap-1.5"><AlertCircle size={14} /> {error}</p>}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-zinc-900 text-white py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Login
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Don't have an account? <Link to="/register" className="text-zinc-900 font-medium">Register</Link>
      </p>
    </div>
  );
};

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await api.post('/api/auth/register', { username, email, password });
    if (res.message) {
      navigate('/login');
    } else {
      setError(res.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl border border-zinc-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-zinc-900">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Username</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
          <input 
            type="email" 
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
          <input 
            type="password" 
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm flex items-center gap-1.5"><AlertCircle size={14} /> {error}</p>}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-zinc-900 text-white py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Register
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account? <Link to="/login" className="text-zinc-900 font-medium">Login</Link>
      </p>
    </div>
  );
};

const Dashboard = ({ token }: { token: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobDescription) return;

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    const res = await api.upload('/api/match', formData, token);
    if (res.score) {
      setResult(res);
    } else {
      setError(res.error || 'Matching failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Resume Analyzer</h1>
        <p className="text-zinc-500 mt-2">Upload your resume and the job description to see how well you match.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <form onSubmit={handleMatch} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <label className="block text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <Upload size={18} className="text-zinc-400" /> Upload Resume (PDF)
              </label>
              <div className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                file ? "border-emerald-200 bg-emerald-50/30" : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50"
              )}>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  id="resume-upload"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700">{file.name}</span>
                      <span className="text-xs text-emerald-600/60">Click to change file</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={32} className="text-zinc-300" />
                      <span className="text-sm font-medium text-zinc-600">Drop your PDF here or click to browse</span>
                      <span className="text-xs text-zinc-400">Only PDF files are supported</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <label className="block text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-zinc-400" /> Job Description
              </label>
              <textarea 
                className="w-full h-48 px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all resize-none text-sm"
                placeholder="Paste the job requirements here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !file || !jobDescription}
              className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-lg shadow-zinc-900/10 flex justify-center items-center gap-3"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <LayoutDashboard size={20} />}
              Analyze Match
            </button>
            {error && <p className="text-red-600 text-sm flex items-center gap-1.5 justify-center"><AlertCircle size={16} /> {error}</p>}
          </form>
        </div>

        <div className="space-y-6">
          {result ? (
            <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm sticky top-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Match Score</h3>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle 
                      cx="64" cy="64" r="58" 
                      stroke="currentColor" strokeWidth="8" fill="transparent" 
                      className="text-zinc-100"
                    />
                    <circle 
                      cx="64" cy="64" r="58" 
                      stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * parseFloat(result.score)) / 100}
                      className={cn(
                        "transition-all duration-1000 ease-out",
                        parseFloat(result.score) > 70 ? "text-emerald-500" : 
                        parseFloat(result.score) > 40 ? "text-amber-500" : "text-red-500"
                      )}
                    />
                  </svg>
                  <span className="absolute text-3xl font-black text-zinc-900">{result.score}%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Extracted Content Snippet</h4>
                  <p className="text-sm text-zinc-600 italic line-clamp-4 leading-relaxed">
                    "...{result.resumeTextSnippet}..."
                  </p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <p className="text-sm text-emerald-800 font-medium">Analysis complete. Check your history for full details.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50/50 border-2 border-dashed border-zinc-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <FileText size={40} className="text-zinc-200" />
              </div>
              <h3 className="text-zinc-900 font-semibold">Ready for Analysis</h3>
              <p className="text-zinc-400 text-sm mt-2 max-w-[240px]">Fill in the details on the left to generate your match report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const History = ({ token }: { token: string }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await api.get('/api/history', token);
      if (Array.isArray(res)) setHistory(res);
      setLoading(false);
    };
    fetchHistory();
  }, [token]);

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <Loader2 size={40} className="animate-spin text-zinc-300" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto mt-12 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Match History</h1>
          <p className="text-zinc-500 mt-2">A record of all your previous resume analysis sessions.</p>
        </div>
        <div className="bg-zinc-100 px-4 py-2 rounded-full text-sm font-bold text-zinc-600">
          {history.length} Matches
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-20 text-center">
          <HistoryIcon size={48} className="mx-auto text-zinc-200 mb-4" />
          <h3 className="text-zinc-900 font-semibold">No history yet</h3>
          <p className="text-zinc-400 text-sm mt-2">Start analyzing resumes to see them listed here.</p>
          <Link to="/dashboard" className="inline-block mt-6 bg-zinc-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all flex items-center justify-between group">
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                    item.match_score > 70 ? "bg-emerald-100 text-emerald-700" : 
                    item.match_score > 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  )}>
                    {item.match_score > 70 ? 'Strong Match' : item.match_score > 40 ? 'Average Match' : 'Weak Match'}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 line-clamp-1 font-medium italic">
                  "{item.job_description}"
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-2xl font-black text-zinc-900">{item.match_score.toFixed(1)}%</div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Score</div>
                </div>
                <div className="h-10 w-px bg-zinc-100" />
                <div className="bg-zinc-50 p-2 rounded-lg group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <FileText size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Home = () => (
  <div className="max-w-4xl mx-auto mt-32 text-center px-6">
    <div className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-1.5 rounded-full text-xs font-bold text-zinc-600 mb-8 uppercase tracking-widest">
      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      AI-Powered Analysis
    </div>
    <h1 className="text-6xl font-black text-zinc-900 tracking-tight leading-[1.1] mb-6">
      Optimize Your Career with <span className="text-zinc-400">Precision.</span>
    </h1>
    <p className="text-xl text-zinc-500 mb-12 max-w-2xl mx-auto leading-relaxed">
      Our advanced ATS matching algorithm analyzes your resume against job descriptions using TF-IDF and Cosine Similarity to give you a competitive edge.
    </p>
    <div className="flex items-center justify-center gap-4">
      <Link to="/register" className="bg-zinc-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20">
        Get Started Free
      </Link>
      <Link to="/login" className="bg-white text-zinc-900 border border-zinc-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-50 transition-all">
        Sign In
      </Link>
    </div>
    
    <div className="mt-32 grid grid-cols-3 gap-8 text-left">
      <div className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
        <div className="bg-zinc-900 text-white w-10 h-10 rounded-xl flex items-center justify-center mb-4">
          <FileText size={20} />
        </div>
        <h3 className="font-bold text-zinc-900 mb-2">PDF Extraction</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">Seamlessly extract text from any PDF resume format with high accuracy.</p>
      </div>
      <div className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
        <div className="bg-zinc-900 text-white w-10 h-10 rounded-xl flex items-center justify-center mb-4">
          <LayoutDashboard size={20} />
        </div>
        <h3 className="font-bold text-zinc-900 mb-2">ML Matching</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">Utilizes TF-IDF vectorization to understand semantic relevance between texts.</p>
      </div>
      <div className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
        <div className="bg-zinc-900 text-white w-10 h-10 rounded-xl flex items-center justify-center mb-4">
          <HistoryIcon size={20} />
        </div>
        <h3 className="font-bold text-zinc-900 mb-2">Match History</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">Keep track of all your applications and scores in one centralized dashboard.</p>
      </div>
    </div>
  </div>
);

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Something went wrong</h2>
            <p className="text-zinc-500 text-sm mb-6">The application encountered an unexpected error.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-zinc-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (token && savedUsername) {
      setUser({ username: savedUsername });
    }
  }, [token]);

  const handleLogin = (token: string, username: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setToken(token);
    setUser({ username });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-900 selection:text-white">
          <Navbar user={user} onLogout={handleLogout} />
          <main className="pb-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/history" 
                element={token ? <History token={token} /> : <Navigate to="/login" />} 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
