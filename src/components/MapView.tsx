import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Incident } from '../types';

// Fix Leaflet's default icon path issues with standard Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for different severity levels
const createIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  low: createIcon('green'),
  medium: createIcon('gold'),
  high: createIcon('orange'),
  critical: createIcon('red'),
  user: createIcon('blue')
};

interface MapViewProps {
  incidents: Incident[];
  userLocation: { lat: number; lng: number } | null;
  responders?: Array<{userId: string; name: string; location: {lat: number; lng: number}}>;
}

// Component to recenter map when user location is found
function RecenterAutomatically({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

export default function MapView({ incidents, userLocation, responders = [] }: MapViewProps) {
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center by default
  const center = userLocation || defaultCenter;

  return (
    <div className="h-full w-full rounded overflow-hidden shadow-2xl relative z-10">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={userLocation ? 13 : 5} 
        style={{ height: '100%', width: '100%', background: '#0a0b10' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={icons.user}>
              <Popup>
                <div className="font-sans font-bold text-gray-900">Your Location</div>
              </Popup>
            </Marker>
            <RecenterAutomatically lat={userLocation.lat} lng={userLocation.lng} />
          </>
        )}

        {/* Live Responders */}
        {responders.map((res) => (
          <Marker 
            key={res.userId} 
            position={[res.location.lat, res.location.lng]} 
            icon={icons.user}
          >
            <Popup>
               <div className="font-sans">
                 <h4 className="font-bold text-gray-900 border-b pb-1 mb-1">Responder</h4>
                 <p className="text-sm text-gray-700">{res.name}</p>
                 <p className="text-[10px] uppercase font-bold text-green-600 mt-1">Live Tracking Active</p>
               </div>
            </Popup>
          </Marker>
        ))}

        {incidents.filter(i => i.status !== 'resolved').map((incident) => (
          <Marker 
            key={incident._id} 
            position={[incident.location.lat, incident.location.lng]}
            icon={icons[incident.severity]}
          >
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold border-b pb-1 mb-2 capitalize text-gray-900">{incident.severity} Severity Incident</h3>
                <div className="text-sm space-y-1 text-gray-700">
                  <p><span className="font-semibold cursor-default">Status:</span> <span className="capitalize">{incident.status}</span></p>
                  <p><span className="font-semibold cursor-default">Time:</span> {new Date(incident.createdAt).toLocaleTimeString()}</p>
                  {incident.crashData && (
                    <>
                      <p><span className="font-semibold cursor-default">Est. Speed:</span> {incident.crashData.speed} km/h</p>
                      <p><span className="font-semibold cursor-default">Impact Force:</span> {incident.crashData.impactForce} G</p>
                    </>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
