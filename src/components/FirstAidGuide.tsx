import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldPlus, CheckCircle2, AlertTriangle, Stethoscope } from 'lucide-react';

interface FirstAidGuideProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
  steps?: string[];
  onClose: () => void;
}

const guides = {
  critical: [
    { text: "Check breathing and pulse immediately.", icon: <Stethoscope className="w-5 h-5" /> },
    { text: "If bleeding is severe, apply firm pressure with clean cloth.", icon: <AlertTriangle className="w-5 h-5" /> },
    { text: "Do not move the victim unless there is danger of fire or explosion.", icon: <ShieldPlus className="w-5 h-5" /> },
    { text: "Keep the airway clear. Tilt head slightly if no neck injury suspected.", icon: <CheckCircle2 className="w-5 h-5" /> }
  ],
  high: [
    { text: "Call out to the victim to check for consciousness.", icon: <Stethoscope className="w-5 h-5" /> },
    { text: "Apply pressure to any visible wounds.", icon: <AlertTriangle className="w-5 h-5" /> },
    { text: "Keep the victim warm and comfortable.", icon: <CheckCircle2 className="w-5 h-5" /> },
    { text: "Loosen any tight clothing around the neck or chest.", icon: <ShieldPlus className="w-5 h-5" /> }
  ],
  medium: [
    { text: "Encourage the victim to sit still.", icon: <CheckCircle2 className="w-5 h-5" /> },
    { text: "Clean small scrapes if a first aid kit is available.", icon: <ShieldPlus className="w-5 h-5" /> },
    { text: "Monitor for signs of shock or dizziness.", icon: <Stethoscope className="w-5 h-5" /> }
  ],
  low: [
    { text: "Reassure the victim.", icon: <CheckCircle2 className="w-5 h-5" /> },
    { text: "Check for any minor aches or pains.", icon: <Stethoscope className="w-5 h-5" /> }
  ]
};

export default function FirstAidGuide({ severity, steps, onClose }: FirstAidGuideProps) {
  const guideSteps = steps ? steps.map((text, idx) => ({
    text,
    icon: idx === 0 ? <Stethoscope className="w-5 h-5" /> :
           idx === 1 ? <AlertTriangle className="w-5 h-5" /> :
           idx === 2 ? <ShieldPlus className="w-5 h-5" /> :
           <CheckCircle2 className="w-5 h-5" />
  })) : (guides[severity] || guides.low);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[var(--color-geo-surface)] border border-[var(--color-geo-border)] rounded overflow-hidden shadow-2xl"
    >
      <div className="bg-[rgba(248,81,73,0.1)] p-4 border-b border-[var(--color-geo-border)] flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
          <Stethoscope className="text-[var(--color-geo-red)] w-4 h-4" /> 
          AI First Aid Assistance
        </h3>
        <button onClick={onClose} className="text-[var(--color-geo-muted)] hover:text-white">&times;</button>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="bg-[rgba(210,153,34,0.1)] p-3 rounded border border-[var(--color-geo-orange)]/30 mb-4">
          <p className="text-[var(--color-geo-orange)] text-xs font-bold uppercase mb-1">Severity: {severity}</p>
          <p className="text-white text-sm font-semibold">
          {steps ? 'AI-generated first aid instructions:' : 'Immediate actions for bystanders:'}
        </p>
        </div>

        <div className="space-y-3">
          {guideSteps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-3 items-start"
            >
              <div className="bg-[var(--color-geo-surface-bright)] p-1.5 rounded text-[var(--color-geo-red)]">
                {step.icon}
              </div>
              <p className="text-[var(--color-geo-text)] text-sm leading-relaxed">{step.text}</p>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-4 py-2 bg-[var(--color-geo-surface-bright)] text-white text-xs font-bold uppercase tracking-widest rounded border border-[var(--color-geo-border)] hover:bg-[var(--color-geo-red)] transition-colors"
        >
          I've Completed These Steps
        </button>
      </div>
    </motion.div>
  );
}
