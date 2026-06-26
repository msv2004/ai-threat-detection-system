import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { X, ChevronRight, ChevronLeft, Shield, CheckCircle } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: 'Welcome to Aegis',
    description: 'Aegis is an AI-powered Security Operations Center. Let\'s walk through the core features to get you started.',
  },
  {
    title: 'Step 1: Upload Datasets',
    description: 'Navigate to the "Datasets" page to upload network capture CSV files. Aegis supports standard formats like CIC-IDS2017 to train models on real traffic behavior.',
  },
  {
    title: 'Step 2: Train AI Models',
    description: 'Go to the "Training" page, select an uploaded dataset, select your classifier (e.g. Random Forest), and configure the preprocessing rules to train custom detectors.',
  },
  {
    title: 'Step 3: Monitor & Detect Threats',
    description: 'On the "Dashboard", launch the live or offline packet capture session using your active trained models. Incoming anomalies will trigger WebSocket alerts.',
  },
  {
    title: 'Step 4: Analyze Alerts & Metrics',
    description: 'Inspect the "Threat Feed" to drill down into payload hashes, IP routes, and MITRE mapping. Toggle the "Analytics" tab to inspect performance curves and latency stats.',
  },
];

export default function Onboarding() {
  const { user } = useAuthStore();
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!user) return;
    const completed = localStorage.getItem(`onboarding_completed_${user.email}`);
    if (!completed) {
      setShowTour(true);
    }
  }, [user]);

  if (!showTour) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain && user) {
      localStorage.setItem(`onboarding_completed_${user.email}`, 'true');
    }
    setShowTour(false);
  };

  const handleSkip = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.email}`, 'true');
    }
    setShowTour(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-overlay">
      <div className="card-elevated w-full max-w-md bg-surface-2 border border-border-strong rounded-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-surface-1/50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent animate-pulse" />
            <span className="font-semibold text-text-primary text-sm">Platform Onboarding</span>
          </div>
          <button onClick={handleSkip} className="p-1 rounded-md hover:bg-surface-3 text-text-tertiary hover:text-text-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col justify-center min-h-[160px]">
          <h3 className="text-lg font-bold text-text-primary mb-3">
            {TOUR_STEPS[currentStep].title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {TOUR_STEPS[currentStep].description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="px-6 flex justify-center gap-1.5 mb-2">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep ? 'w-5 bg-accent' : 'w-1.5 bg-border-strong'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border-subtle bg-surface-1/50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors shadow-sm shadow-accent/25"
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                <>Finish <CheckCircle className="w-3.5 h-3.5" /></>
              ) : (
                <>Next <ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 border-t border-border-subtle pt-3">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-border-strong bg-surface-3 text-accent focus:ring-accent/25"
            />
            <label htmlFor="dontShowAgain" className="text-xs text-text-tertiary select-none cursor-pointer">
              Don't show this tour again on login
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
