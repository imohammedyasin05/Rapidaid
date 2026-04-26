import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'volunteer', 'admin'], default: 'user' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  emergencyContacts: [{
    name: String,
    phone: String,
    relation: String
  }],
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
