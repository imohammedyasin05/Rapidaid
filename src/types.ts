export interface Incident {
  _id: string;
  reporterId: { _id: string; name: string } | string;
  location: { lat: number; lng: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'responding' | 'resolved';
  crashData?: { speed: number; impactForce: number };
  createdAt: string;
}
