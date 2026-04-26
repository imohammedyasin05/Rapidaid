import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  status: { type: String, enum: ['pending', 'responding', 'resolved'], default: 'pending' },
  crashData: {
    speed: Number,
    impactForce: Number,
  },
  firstAidSteps: [{ type: String }],
  responders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

export const Incident = mongoose.model('Incident', incidentSchema);
