import express from 'express';
import { Incident } from '../models/Incident.js';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// Middleware to protect routes (basic implementation)
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'a273e7e9ecb9b4313312d51eac43313911a7eb59bb05a2796f21ea5e55743fcc';
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Gemini AI crash analysis
async function analyzeCrashWithAI(speed: number, impactForce: number) {
  const prompt = `You are an emergency medical AI. Analyze this car crash:
- Speed: ${speed} km/h
- Impact Force: ${impactForce} G

Return a valid JSON object with exactly two fields:
1. "severity": must be one of "low", "medium", "high", "critical"
2. "firstAidSteps": array of exactly 4 clear, concise first aid instructions for bystanders

Example response:
{
  "severity": "high",
  "firstAidSteps": [
    "Check if the victim is conscious and breathing",
    "Apply firm pressure to any visible bleeding",
    "Keep the victim still and comfortable",
    "Call emergency services immediately"
  ]
}

Respond ONLY with the JSON object, no markdown, no code blocks, no extra text.`;

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = result.text.trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini API error:', error);
    let severity = 'low';
    if (speed > 80 || impactForce > 70) severity = 'critical';
    else if (speed > 50 || impactForce > 40) severity = 'high';
    else if (speed > 30 || impactForce > 20) severity = 'medium';
    return {
      severity,
      firstAidSteps: [
        "Check victim's breathing and consciousness",
        "Apply pressure to bleeding wounds",
        "Keep victim still and warm",
        "Call emergency services"
      ]
    };
  }
}

router.get('/', authenticate, async (req, res) => {
  try {
    const incidents = await Incident.find().populate('reporterId', 'name').sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

router.get('/analytics', authenticate, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const allIncidents = await Incident.find();
    
    // Severity Distribution
    const severityMap: any = { low: 0, medium: 0, high: 0, critical: 0 };
    allIncidents.forEach(inc => severityMap[inc.severity]++);
    const severityStats = Object.keys(severityMap).map(key => ({ name: key, value: severityMap[key] }));

    // Hourly Trends (Last 24 hours)
    const hourlyData: any = {};
    const now = new Date();
    for (let i = 0; i < 24; i++) {
        const hour = new Date(now.getTime() - i * 3600000).getHours();
        hourlyData[hour] = 0;
    }
    allIncidents.forEach(inc => {
        const hour = new Date(inc.createdAt).getHours();
        if (hourlyData[hour] !== undefined) hourlyData[hour]++;
    });
    const trends = Object.keys(hourlyData).sort((a,b) => parseInt(a)-parseInt(b)).map(hour => ({
        hour: `${hour}:00`,
        count: hourlyData[hour]
    }));

    // Response Times (in minutes)
    const responseTimes = allIncidents
        .filter(inc => inc.resolvedAt && inc.createdAt)
        .map(inc => {
            const diff = (inc.resolvedAt!.getTime() - inc.createdAt.getTime()) / 60000;
            return diff;
        });
    const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a,b) => a+b, 0) / responseTimes.length
        : 0;

    res.json({
        severityStats,
        trends,
        avgResponseTime: Math.round(avgResponseTime)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.post('/sos', authenticate, async (req: any, res: any) => {
  try {
    const { lat, lng } = req.body;
    const aiAnalysis = await analyzeCrashWithAI(0, 0);
    
    const incident = new Incident({
      reporterId: req.user.userId,
      location: { lat, lng },
      severity: aiAnalysis.severity,
      crashData: { speed: 0, impactForce: 0 },
      firstAidSteps: aiAnalysis.firstAidSteps,
      status: 'pending'
    });

    await incident.save();
    
    req.io.emit('new_incident', incident);
    req.io.emit('emergency_sos', {
        userId: req.user.userId,
        location: { lat, lng },
        incidentId: incident._id
    });

    res.status(201).json(incident);
  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({ error: 'SOS failed' });
  }
});

router.post('/simulate', authenticate, async (req: any, res: any) => {
  try {
    const { speed, impactForce, lat, lng } = req.body;
    const aiAnalysis = await analyzeCrashWithAI(speed, impactForce);

    const incident = new Incident({
      reporterId: req.user.userId,
      location: { lat, lng },
      severity: aiAnalysis.severity,
      crashData: { speed, impactForce },
      firstAidSteps: aiAnalysis.firstAidSteps
    });

    await incident.save();

    req.io.emit('new_incident', incident);

    res.status(201).json(incident);
  } catch (error) {
    console.error('Simulate crash error:', error);
    res.status(500).json({ error: 'Failed to simulate crash' });
  }
});

router.patch('/:id/status', authenticate, async (req: any, res: any) => {
    try {
      const { status } = req.body;
      const { id } = req.params;

      console.log(`[Backend] Updating incident ${id} to ${status}`);
      
      const incident = await Incident.findByIdAndUpdate(
          id,
          { 
              status, 
              resolvedAt: status === 'resolved' ? new Date() : undefined 
          },
          { new: true }
      );
      
      if (!incident) {
          return res.status(404).json({ error: 'Incident not found' });
      }
      
      if (status === 'responding' && req.user.role === 'volunteer') {
          if (!incident.responders.includes(req.user.userId)) {
             incident.responders.push(req.user.userId);
             await incident.save();
          }
      }
      
      // Emit status update
      req.io.emit('incident_updated', incident);
      res.json(incident);
    } catch (error) {
      console.error('[Backend] Status update failed:', error);
      res.status(500).json({ error: 'Failed to update' });
    }
});

export default router;
