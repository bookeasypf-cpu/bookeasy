"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  tips?: string[];
}

interface OnboardingTutorialProps {
  storageKey: string;
  steps: OnboardingStep[];
  onComplete?: () => void;
  welcomeTitle: string;
  welcomeSubtitle: string;
}

export default function OnboardingTutorial({
  storageKey,
  steps,
  onComplete,
  welcomeTitle,
  welcomeSubtitle,
}: OnboardingTutorialProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1); // -1 = welcome screen
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      // Small delay for page to render first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  function handleClose() {
    localStorage.setItem(storageKey, "true");
    setVisible(false);
    onComplete?.();
  }

  function handleNext() {
    if (currentStep >= steps.length - 1) {
      handleClose();
      return;
    }
    setDirection(1);
    setCurrentStep((s) => s + 1);
  }

  function handlePrev() {
    setDirection(-1);
    setCurrentStep((s) => Math.max(-1, s - 1));
  }

  function handleSkip() {
    handleClose();
  }

  if (!visible) return null;

  const progress =
    currentStep >= 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
  const isWelcome = currentStep === -1;
  const isLast = currentStep === steps.length - 1;
  const step = currentStep >= 0 ? steps[currentStep] : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress bar */}
        {!isWelcome && (
          <div className="h-1 bg-gray-100">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0066FF] to-[#00B4D8]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {isWelcome ? (
            /* WELCOME SCREEN */
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 50 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 * direction }}
              transition={{ duration: 0.3 }}
              className="p-8 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#0066FF] to-[#00B4D8] flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#0C1B2A] mb-3">
                {welcomeTitle}
              </h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                {welcomeSubtitle}
              </p>

              {/* Step preview dots */}
              <div className="flex items-center justify-center gap-3 mb-8">
                {steps.map((s, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                      {s.icon}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium max-w-[60px] text-center leading-tight">
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white font-semibold text-base hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  Commencer le tutoriel
                </button>
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Passer le tutoriel
                </button>
              </div>
            </motion.div>
          ) : (
            /* STEP CONTENT */
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: 50 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 * direction }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {/* Step counter */}
              <div className="text-xs font-semibold text-[#0066FF] mb-4">
                Étape {currentStep + 1} / {steps.length}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF]/10 to-[#00B4D8]/10 flex items-center justify-center mb-5 text-[#0066FF]">
                {step!.icon}
              </div>

              {/* Title & description */}
              <h3 className="text-xl font-bold text-[#0C1B2A] mb-2">
                {step!.title}
              </h3>
              <p className="text-gray-500 leading-relaxed mb-5">
                {step!.description}
              </p>

              {/* Tips */}
              {step!.tips && step!.tips.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2.5">
                  {step!.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-600">{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Retour
                </button>

                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? "bg-[#0066FF] w-6"
                          : i < currentStep
                            ? "bg-[#0066FF]/30"
                            : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className={`flex items-center gap-1 text-sm font-semibold transition-all px-4 py-2 rounded-xl ${
                    isLast
                      ? "bg-gradient-to-r from-[#0066FF] to-[#00B4D8] text-white hover:shadow-md"
                      : "text-[#0066FF] hover:bg-[#0066FF]/5"
                  }`}
                >
                  {isLast ? "Terminé !" : "Suivant"}
                  {!isLast && <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
