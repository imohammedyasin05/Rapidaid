import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getApiUrl } from '../lib/api';
import { Incident } from '../types';
import MapView from '../components/MapView';
import FirstAidGuide from '../components/FirstAidGuide';
import { AlertCircle, Car, ShieldAlert, Loader2, Navigation, Activity, Zap, PhoneCall } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSOSLoading, setIsSOSLoading] = useState(false);
  const [notification, setNotification] = useState<Incident | null>(null);
  const [showFirstAid, setShowFirstAid] = useState<{severity: any, steps?: string[]} | null>(null);
  const [responders, setResponders] = useState<any[]>([]);

  // Fetch initial incidents and location
  useEffect(() => {
    fetch(getApiUrl('/api/incidents'), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setIncidents(data))
      .catch(err => console.error("Could not fetch incidents", err));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Location error:", error);
          // Fallback to a default location (e.g., Delhi, India)
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  }, [token]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('new_incident', (incident: Incident) => {
      setIncidents(prev => [incident, ...prev]);
      // Show notification if it's high or critical
      if (['high', 'critical'].includes(incident.severity) && user?.role !== 'user') {
        setNotification(incident);
        setTimeout(() => setNotification(null), 5000);
      }
    });

    socket.on('incident_updated', (updatedIncident: Incident) => {
      setIncidents(prev => prev.map(inc => inc._id === updatedIncident._id ? updatedIncident : inc));
    });

    socket.on('responder_location', (data) => {
        setResponders(prev => {
            const exists = prev.find(r => r.userId === data.userId);
            if (exists) {
                return prev.map(r => r.userId === data.userId ? data : r);
            }
            return [...prev, data];
        });
    });

    return () => {
      socket.off('new_incident');
      socket.off('incident_updated');
      socket.off('responder_location');
    };
  }, [socket, user]);

  const triggerSOS = async () => {
    if (!userLocation) return alert("Waiting for location...");
    setIsSOSLoading(true);
    try {
        const res = await fetch(getApiUrl('/api/incidents/sos'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ lat: userLocation.lat, lng: userLocation.lng })
        });
        const data = await res.json();
        if (res.ok) {
            setShowFirstAid({ severity: 'critical', steps: data.firstAidSteps });
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsSOSLoading(false);
    }
  };

  const simulateCrash = async () => {
    if (!userLocation) return alert("Waiting for location data...");
    
    setIsSimulating(true);
    
    const offsetLat = (Math.random() - 0.5) * 0.01;
    const offsetLng = (Math.random() - 0.5) * 0.01;
    
    const speed = Math.floor(Math.random() * 80) + 20; 
    const impactForce = Math.floor(Math.random() * 80) + 10; 
    
    try {
      const res = await fetch(getApiUrl('/api/incidents/simulate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          speed,
          impactForce,
          lat: userLocation.lat + offsetLat,
          lng: userLocation.lng + offsetLng
        })
      });
      const data = await res.json();
      if (res.ok) {
          setShowFirstAid({ severity: data.severity, steps: data.firstAidSteps });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to simulate crash");
    } finally {
      setIsSimulating(false);
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-geo-text)] flex items-center gap-2">
            <Activity className="text-[var(--color-geo-red)]" /> Live Operations Dashboard
          </h1>
          <p className="text-[var(--color-geo-muted)] text-sm mt-1">Monitoring realtime emergency events and active responders.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={triggerSOS}
            disabled={isSOSLoading || !userLocation}
            className="bg-white text-black px-5 py-2.5 rounded font-extrabold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            {isSOSLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Zap className="h-5 w-5 fill-current" />}
            EMERGENCY SOS
          </button>

          <button
            onClick={simulateCrash}
            disabled={isSimulating || !userLocation}
            className="bg-[var(--color-geo-red)] text-white px-5 py-2.5 rounded font-semibold flex items-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? <Loader2 className="animate-spin h-5 w-5" /> : <Car className="h-5 w-5" />}
            Simulate Crash
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Sidebar */}
        <div className="bg-[var(--color-geo-surface)] border border-[var(--color-geo-border)] flex flex-col overflow-hidden col-span-1 rounded">
          <h2 className="font-semibold text-[var(--color-geo-text)] border-b border-[var(--color-geo-border)] pb-3 mb-0 p-4 pb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[var(--color-geo-muted)]" /> Active Incidents ({activeIncidents.length})
          </h2>
          
          <div className="flex-1 overflow-y-auto">
            {activeIncidents.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-geo-muted)] text-sm">
                No active incidents reported.
              </div>
            ) : (
              activeIncidents.map(incident => (
                <div key={incident._id} className="p-4 border-b border-[var(--color-geo-border)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 rounded",
                      incident.severity === 'critical' ? 'bg-[rgba(248,81,73,0.2)] text-[var(--color-geo-red)] border border-[var(--color-geo-red)]' :
                      incident.severity === 'high' ? 'bg-[rgba(248,81,73,0.1)] text-[var(--color-geo-red)]' :
                      incident.severity === 'medium' ? 'bg-[rgba(210,153,34,0.2)] text-[var(--color-geo-orange)]' :
                      'bg-[rgba(63,185,80,0.2)] text-[var(--color-geo-green)]'
                    )}>
                      {incident.severity}
                    </span>
                    <span className="text-xs text-[var(--color-geo-muted)]">{new Date(incident.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-geo-text)] flex items-center gap-1.5 mt-2">
                    <Navigation className="h-3 w-3 text-[var(--color-geo-muted)]" />
                    {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                  </p>
                  <div className="mt-2 text-xs text-[var(--color-geo-muted)] flex justify-between items-center">
                    <span>Status: <span className="font-semibold text-white capitalize">{incident.status}</span></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-[#0d1117] rounded border border-[var(--color-geo-border)] col-span-1 lg:col-span-3 min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--color-geo-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-geo-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          {!userLocation && (
            <div className="absolute inset-0 z-[1000] bg-[#0d1117]/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[var(--color-geo-red)] h-8 w-8 mb-4" />
              <p className="text-[var(--color-geo-text)] font-semibold">Acquiring GPS location...</p>
              <p className="text-[var(--color-geo-muted)] text-sm mt-1">Please allow location permissions.</p>
            </div>
          )}
          <MapView incidents={incidents} userLocation={userLocation} responders={responders} />
          
          {/* AI Guide Overlay */}
          <AnimatePresence>
            {showFirstAid && (
               <div className="absolute top-4 right-4 z-[1001] w-80">
                <FirstAidGuide 
                   severity={showFirstAid.severity} 
                   steps={showFirstAid?.steps}
                   onClose={() => setShowFirstAid(null)} 
                />
               </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Real-time Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 max-w-sm bg-[var(--color-geo-surface)] border-l-4 border-[var(--color-geo-red)] shadow-2xl rounded p-4 z-50 flex gap-4"
          >
            <div className="bg-[rgba(248,81,73,0.1)] p-2 rounded h-fit text-[var(--color-geo-red)]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-white font-bold">New {notification.severity} severity incident!</h3>
              <p className="text-[var(--color-geo-text)] text-sm mt-1">
                A potential collision has been detected. AI estimates high risk of severe injury.
              </p>
              <div className="mt-2 text-xs text-[var(--color-geo-muted)]">
                {new Date(notification.createdAt).toLocaleTimeString()} • Auto-verified
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
