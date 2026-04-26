import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getApiUrl } from '../lib/api';
import { Incident } from '../types';
import { MapPin, Navigation, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function VolunteerPanel() {
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    // Check if responding to any
    const resp = incidents.some(i => i.status === 'responding' && i.responders.includes(user?.id as any));
    setIsResponding(resp);
  }, [incidents, user]);

  useEffect(() => {
     if (!isResponding || !socket || !user) return;

     const interval = setInterval(() => {
         if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition((pos) => {
                 socket.emit('update_location', {
                     userId: user.id,
                     name: user.name,
                     role: user.role,
                     location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
                 });
             });
         }
     }, 3000); // Update every 3 seconds

     return () => clearInterval(interval);
  }, [isResponding, socket, user]);

  useEffect(() => {
    fetch(getApiUrl('/api/incidents'), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setIncidents(data))
      .catch(err => console.error("Could not fetch incidents", err));
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

  const acceptIncident = async (id: string) => {
    try {
      await fetch(getApiUrl(`/api/incidents/${id}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'responding' })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const activeRequests = incidents.filter(i => i.status !== 'resolved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-[var(--color-geo-border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Volunteer Response Panel</h1>
        <p className="text-[var(--color-geo-muted)] mt-1">Review and accept nearby emergency assistance requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeRequests.length === 0 ? (
          <div className="col-span-full py-12 bg-[#161b22] rounded border border-dashed border-[var(--color-geo-border)] text-center text-gray-500">
            <CheckCircle className="mx-auto h-8 w-8 text-[var(--color-geo-green)] mb-2" />
            <p>No active emergency requests in your area.</p>
            <p className="text-sm mt-1">We will notify you when someone needs help.</p>
          </div>
        ) : (
          activeRequests.map(incident => (
            <div key={incident._id} className="bg-[var(--color-geo-surface)] rounded border border-[var(--color-geo-border)] overflow-hidden flex flex-col">
              <div className="p-5 border-b border-[var(--color-geo-border)] flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-1 rounded",
                    incident.severity === 'critical' ? 'bg-[rgba(248,81,73,0.2)] text-[var(--color-geo-red)] border border-[var(--color-geo-red)]' :
                    incident.severity === 'high' ? 'bg-[rgba(248,81,73,0.1)] text-[var(--color-geo-red)]' :
                    incident.severity === 'medium' ? 'bg-[rgba(210,153,34,0.2)] text-[var(--color-geo-orange)]' :
                    'bg-[rgba(63,185,80,0.2)] text-[var(--color-geo-green)]'
                  )}>
                    {incident.severity} Priority
                  </span>
                  <div className="text-xs text-[var(--color-geo-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2 text-sm text-[var(--color-geo-text)] items-start">
                    <MapPin className="w-4 h-4 text-[var(--color-geo-red)] shrink-0 mt-0.5" />
                    <span>
                      Lat: {incident.location.lat.toFixed(4)}<br />
                      Lng: {incident.location.lng.toFixed(4)}
                    </span>
                  </div>
                  
                  {incident.crashData && (
                    <div className="bg-[var(--color-geo-surface-bright)] rounded p-3 text-sm border border-[var(--color-geo-border)] mt-2">
                      <p><span className="font-semibold text-[var(--color-geo-muted)]">Force:</span> {incident.crashData.impactForce} G</p>
                      <p><span className="font-semibold text-[var(--color-geo-muted)]">Est. Speed:</span> {incident.crashData.speed} km/h</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-[var(--color-geo-surface-bright)] flex gap-3">
                {incident.status === 'pending' ? (
                  <button
                    onClick={() => acceptIncident(incident._id)}
                    className="flex-1 bg-[var(--color-geo-red)] text-white font-semibold py-2 rounded hover:opacity-90 transition-opacity"
                  >
                    Accept & Respond
                  </button>
                ) : (
                  <div className="flex-1 text-center font-bold uppercase tracking-wider text-xs py-2.5 rounded bg-[rgba(63,185,80,0.1)] text-[var(--color-geo-green)] border border-[rgba(63,185,80,0.2)] flex justify-center items-center gap-2">
                    <Navigation className="w-4 h-4" /> Responding
                  </div>
                )}
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${incident.location.lat},${incident.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[var(--color-geo-surface)] border border-[var(--color-geo-border)] rounded text-white font-semibold hover:bg-[var(--color-geo-surface-bright)] transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> Map
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
