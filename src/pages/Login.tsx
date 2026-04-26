import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin.rapidaid@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Only @gmail.com accounts are allowed.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-[var(--color-geo-bg)] relative overflow-hidden">
      <div className="w-full max-w-md bg-[var(--color-geo-surface)] p-8 rounded shadow-2xl border border-[var(--color-geo-border)] relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[var(--color-geo-red)] text-white rounded-md flex items-center justify-center mx-auto mb-4 text-2xl font-bold">RA</div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to RapidAid</h2>
          <p className="text-sm text-[var(--color-geo-muted)] mt-2">
            Or <Link to="/register" className="text-[var(--color-geo-text)] underline font-medium hover:text-white">create an account</Link>
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-[rgba(248,81,73,0.1)] text-[var(--color-geo-red)] border border-[rgba(248,81,73,0.3)] rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-geo-muted)] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-[var(--color-geo-muted)]" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                className="w-full pl-10 pr-3 py-2 bg-[var(--color-geo-surface-bright)] border border-[var(--color-geo-border)] text-white rounded focus:ring-1 focus:ring-[var(--color-geo-red)] focus:border-[var(--color-geo-red)] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-geo-muted)] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-[var(--color-geo-muted)]" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} 
                className="w-full pl-10 pr-3 py-2 bg-[var(--color-geo-surface-bright)] border border-[var(--color-geo-border)] text-white rounded focus:ring-1 focus:ring-[var(--color-geo-red)] focus:border-[var(--color-geo-red)] outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loading} 
            className="w-full bg-[var(--color-geo-surface-bright)] hover:bg-[var(--color-geo-red)] border border-[var(--color-geo-border)] text-white py-3 rounded font-bold uppercase text-sm tracking-wider flex items-center justify-center gap-2 transition-all">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Log in'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--color-geo-border)] text-xs text-[var(--color-geo-muted)] text-center">
          <p className="font-bold mb-2 uppercase tracking-wide">Demo Accounts (Pass: admin123):</p>
          <p>Admin: admin.rapidaid@gmail.com</p>
          <p>Volunteer: volunteer.rapidaid@gmail.com</p>
          <p>User: user.rapidaid@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
