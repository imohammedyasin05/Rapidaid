import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('../../models/Incident.js', () => {
  const mockIncident = {
    save: vi.fn().mockResolvedValue(true),
    toObject: () => ({ _id: 'mock-id', severity: 'high', firstAidSteps: ['Step 1'] })
  };
  return {
    Incident: vi.fn().mockImplementation(() => mockIncident)
  };
});

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          severity: 'high',
          firstAidSteps: ['Check breathing', 'Apply pressure', 'Keep still', 'Call emergency']
        })
      })
    }
  }))
}));

vi.mock('../../models/User.js', () => ({
  User: {
    findOne: vi.fn().mockResolvedValue(null),
    insertMany: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed-pw') }
}));

// Create test app
const createTestApp = async () => {
  const app = express();
  app.use(express.json());
  
  // Mock socket.io
  const mockIo = {
    emit: vi.fn(),
    on: vi.fn()
  };
  app.use((req: any, res, next) => {
    req.io = mockIo;
    next();
  });

  // Mock auth middleware
  app.use((req: any, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      req.user = { userId: 'mock-user-id', role: 'user' };
    }
    next();
  });

  const incidentRoutes = (await import('../incidents.js')).default;
  app.use('/api/incidents', incidentRoutes);
  
  return app;
};

describe('Incident Routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    app = await createTestApp();
  });

  describe('POST /api/incidents/simulate', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/incidents/simulate')
        .send({ speed: 60, impactForce: 50, lat: 28.6, lng: 77.2 });
      
      expect(res.status).toBe(401);
    });

    it('should return 201 with valid auth token', async () => {
      const token = jwt.sign({ userId: 'mock-id' }, 'test-secret');
      const res = await request(app)
        .post('/api/incidents/simulate')
        .set('Authorization', `Bearer ${token}`)
        .send({ speed: 60, impactForce: 50, lat: 28.6, lng: 77.2 });
      
      expect(res.status).toBe(201);
      expect(res.body.severity).toBeDefined();
      expect(res.body.firstAidSteps).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/incidents/sos', () => {
    it('should return 201 with valid auth token', async () => {
      const token = jwt.sign({ userId: 'mock-id' }, 'test-secret');
      const res = await request(app)
        .post('/api/incidents/sos')
        .set('Authorization', `Bearer ${token}`)
        .send({ lat: 28.6, lng: 77.2 });
      
      expect(res.status).toBe(201);
      expect(res.body.severity).toBeDefined();
    });
  });
});
