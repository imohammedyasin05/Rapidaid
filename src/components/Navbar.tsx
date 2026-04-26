import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldAlert, LogOut, LayoutDashboard, Map as MapIcon, Users, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    if (!user) return [];
    
    const links = [
      { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> }
    ];

    if (user.role === 'admin') {
      links.push({ name: 'Admin Panel', path: '/admin', icon: <Settings size={18} /> });
    }
    if (user.role === 'volunteer') {
      links.push({ name: 'Volunteer Panel', path: '/volunteer', icon: <Users size={18} /> });
    }

    return links;
  };

  return (
    <nav className="bg-[var(--color-geo-surface)] border-b border-[var(--color-geo-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 text-white font-extrabold text-xl tracking-tight">
              <div className="w-8 h-8 bg-[var(--color-geo-red)] rounded-md flex items-center justify-center text-lg">RA</div>
              <span>RAPIDAID</span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4 items-center">
              {getLinks().map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "inline-flex items-center px-3 py-2 text-sm font-semibold rounded-md gap-2 transition-colors",
                    location.pathname === link.path 
                      ? "bg-[rgba(255,255,255,0.05)] text-white border border-[var(--color-geo-border)]" 
                      : "text-[var(--color-geo-muted)] hover:text-white"
                  )}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-[var(--color-geo-muted)]">Signed in as </span>
                  <span className="font-semibold text-[var(--color-geo-text)]">{user.name}</span>
                  <span className="ml-2 inline-flex items-center rounded bg-[var(--color-geo-surface-bright)] px-2 py-1 text-[10px] font-bold text-[var(--color-geo-text)] border border-[var(--color-geo-border)] uppercase tracking-widest">
                    {user.role}
                  </span>
                  {user.email === 'guest@rapidaid.demo' && (
                    <span className="ml-2 inline-flex items-center rounded bg-blue-900/30 px-2 py-1 text-[10px] font-bold text-blue-400 border border-blue-500/50 uppercase tracking-widest">
                      Guest Mode
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[var(--color-geo-muted)] hover:text-[var(--color-geo-text)] rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="text-[var(--color-geo-text)] hover:text-white px-3 py-2 rounded text-sm font-semibold">Log in</Link>
                <Link to="/register" className="bg-[var(--color-geo-red)] text-white hover:opacity-90 px-3 py-2 rounded text-sm font-semibold transition-opacity">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
