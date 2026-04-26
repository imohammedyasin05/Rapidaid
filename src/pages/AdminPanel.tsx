import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getApiUrl } from '../lib/api';
import { Incident } from '../types';
import { BarChart3, Activity, Users, ShieldCheck, CheckCircle, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';

const COLORS = ['#3fb950', '#d29922', '#f85149', '#9b1c1c'];

export default function AdminPanel() {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [incRes, anaRes] = await Promise.all([
                fetch(getApiUrl('/api/incidents'), { headers: { Authorization: `Bearer ${token}` } }),
                fetch(getApiUrl('/api/incidents/analytics'), { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setIncidents(await incRes.json());
            setAnalytics(await anaRes.json());
        } catch (err) {
            console.error(err);
        }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_incident', (incident: Incident) => {
      setIncidents(prev => [incident, ...prev]);
    });
    socket.on('incident_updated', (updatedIncident: Incident) => {
      setIncidents(prev => prev.map(inc => inc._id === updatedIncident._id ? updatedIncident : inc));
    });
    return () => {
      socket.off('new_incident');
      socket.off('incident_updated');
    };
  }, [socket]);

  const markResolved = async (id: string) => {
    try {
      await fetch(`/api/incidents/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const total = incidents.length;
  const active = incidents.filter(i => i.status !== 'resolved').length;
  const critical = incidents.filter(i => i.severity === 'critical').length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 border-b border-[var(--color-geo-border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Admin Control Center</h1>
        <p className="text-[var(--color-geo-muted)] mt-1">System-wide overview of all reported emergency events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Incidents', value: total, icon: <BarChart3 className="text-blue-500" /> },
          { title: 'Active Response', value: active, icon: <Activity className="text-[var(--color-geo-orange)]" /> },
          { title: 'Critical Events', value: critical, icon: <ShieldCheck className="text-[var(--color-geo-red)]" /> },
          { title: 'Resolved', value: resolved, icon: <CheckCircle className="text-[var(--color-geo-green)]" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--color-geo-surface)] p-6 rounded border border-[var(--color-geo-border)] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-geo-muted)]">{stat.title}</p>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className="p-3 bg-[var(--color-geo-surface-bright)] rounded text-[var(--color-geo-text)] border border-[var(--color-geo-border)]">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Severity Distribution */}
            <div className="bg-[var(--color-geo-surface)] p-6 rounded border border-[var(--color-geo-border)]">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-6">
                    <PieChartIcon className="w-4 h-4 text-[var(--color-geo-red)]" /> Severity Breakdown
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={analytics.severityStats}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {analytics.severityStats.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                                itemStyle={{ color: '#c9d1d9' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Hourly Trends */}
            <div className="bg-[var(--color-geo-surface)] p-6 rounded border border-[var(--color-geo-border)]">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-6">
                    <TrendingUp className="w-4 h-4 text-[var(--color-geo-red)]" /> 24h Incident Frequency
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.trends}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f85149" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f85149" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                                dataKey="hour" 
                                stroke="#8b949e" 
                                fontSize={10} 
                                axisLine={false} 
                                tickLine={false} 
                            />
                            <YAxis 
                                stroke="#8b949e" 
                                fontSize={10} 
                                axisLine={false} 
                                tickLine={false} 
                            />
                            <Tooltip 
                                contentStyle={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                                itemStyle={{ color: '#f85149' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#f85149" 
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      <div className="bg-[var(--color-geo-surface)] rounded border border-[var(--color-geo-border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-geo-border)]">
          <h2 className="font-semibold text-white">Incident Event Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--color-geo-muted)] uppercase tracking-wider bg-[var(--color-geo-surface-bright)] border-b border-[var(--color-geo-border)]">
              <tr>
                <th className="px-6 py-4 font-medium">ID / Reporter</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Time reported</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-geo-border)]">
              {incidents.map((incident) => (
                <tr key={incident._id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-[var(--color-geo-muted)]">
                    <div className="font-bold text-[var(--color-geo-text)] truncate w-32">{Math.random().toString(36).substring(2,8).toUpperCase()}</div>
                    {(incident.reporterId as any)?.name || 'Unknown User'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      incident.severity === 'critical' ? 'bg-[rgba(248,81,73,0.2)] text-[var(--color-geo-red)] border border-[var(--color-geo-red)]' :
                      incident.severity === 'high' ? 'bg-[rgba(248,81,73,0.1)] text-[var(--color-geo-red)]' :
                      incident.severity === 'medium' ? 'bg-[rgba(210,153,34,0.2)] text-[var(--color-geo-orange)]' :
                      'bg-[rgba(63,185,80,0.2)] text-[var(--color-geo-green)]'
                    }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-[var(--color-geo-text)]">
                    {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-geo-muted)] whitespace-nowrap">
                    {new Date(incident.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize font-semibold text-[var(--color-geo-text)] bg-[var(--color-geo-surface-bright)] border border-[var(--color-geo-border)] px-2 py-1 rounded text-[10px] uppercase tracking-wider">
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {incident.status !== 'resolved' && (
                      <button 
                        onClick={() => markResolved(incident._id)}
                        className="text-xs font-semibold bg-[var(--color-geo-surface-bright)] border border-[var(--color-geo-border)] text-white hover:bg-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded transition"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No incidents recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
