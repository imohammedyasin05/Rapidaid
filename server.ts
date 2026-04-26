import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_actual_gemini_api_key_here') {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is not set or is placeholder. AI features will use fallback responses.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import API routes (we will create these next)
import authRoutes from './src/server/routes/auth.js';
import incidentRoutes from './src/server/routes/incidents.js';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Database Connection
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    if (mongoUri) {
      try {
        console.log('Attempting to connect to provided MONGODB_URI...');
        // Set a timeout for the connection attempt to fail faster if non-whitelisted
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected successfully to external MongoDB.');
      } catch (err) {
        console.error('External MongoDB connection failed. Falling back to Memory Server. Error:', (err as Error).message);
        mongoUri = null; // Reset to trigger memory server fallback
      }
    }

    if (!mongoUri) {
      console.log('Starting MongoDB Memory Server for local development...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`Connected to In-Memory MongoDB at ${mongoUri}`);
    }

    // Seed Demo Users if they don't exist
    const { User } = await import('./src/server/models/User.js');
    const bcrypt = await import('bcryptjs');
    const adminExists = await User.findOne({ email: 'admin.rapidaid@gmail.com' });
    if (!adminExists) {
      console.log('Seeding demo accounts...');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      await User.insertMany([
        { name: 'System Admin', email: 'admin.rapidaid@gmail.com', password: hashedPassword, role: 'admin' },
        { name: 'Demo Volunteer', email: 'volunteer.rapidaid@gmail.com', password: hashedPassword, role: 'volunteer' },
        { name: 'Demo User', email: 'user.rapidaid@gmail.com', password: hashedPassword, role: 'user' }
      ]);
      console.log('Demo accounts seeded successfully.');
    }
  } catch (error) {
    console.error('Critical database initialization error:', error);
  }

  // Socket.io for Real-Time Updates
  io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    
    socket.on('update_location', (data) => {
        // Broadcast location to all clients (for demo relative simplicity)
        // In production, we'd room-base this or filter
        io.emit('responder_location', {
            userId: data.userId,
            name: data.name,
            location: data.location,
            role: data.role
        });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Attach socket io to request so routes can broadcast
  app.use((req, res, next) => {
    // @ts-ignore
    req.io = io;
    next();
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/incidents', incidentRoutes);

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
