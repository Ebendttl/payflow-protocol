"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import Button from './Button';

interface TourStep {
  title: string;
  content: string;
  target?: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export default function ProductTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const steps: TourStep[] = [
    {
      title: "Welcome to PayFlow! 👋",
      content: "Let's take a quick 1-minute tour of how to stream tokens and manage escrows on Stellar Soroban.",
      placement: "center"
    },
    {
      title: "The PayFlow Hub",
      content: "Clicking the PayFlow logo at any time will bring you back to this home landing page.",
      target: "#tour-logo",
      placement: "bottom"
    },
    {
      title: "Real-time Streams",
      content: "Go here to set up continuous, second-by-second token payments, claim accrued balances, or cancel active streams.",
      target: "#tour-nav-streams",
      placement: "bottom"
    },
    {
      title: "Milestone Escrows",
      content: "Create and govern secure escrow contracts. Funds are locked and disbursed incrementally as milestones are approved.",
      target: "#tour-nav-escrow",
      placement: "bottom"
    },
    {
      title: "Connect Your Wallet",
      content: "Connect your Freighter or LOBSTR wallet here to start authorizing on-chain stream actions.",
      target: "#tour-connect-btn, #tour-wallet-btn",
      placement: "bottom"
    },
    {
      title: "On-Chain Infrastructure",
      content: "All contracts run securely on the Stellar Testnet with fast settlement times and very low fees.",
      target: "#tour-stats",
      placement: "top"
    },
    {
      title: "You're All Set! 🎉",
      content: "You have completed the walk-through. You can launch this guide again at any time by clicking the floating help icon in the bottom corner.",
      placement: "center"
    }
  ];

  // Listen to manual start trigger
  useEffect(() => {
    const handleStartTour = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener('start-payflow-tour', handleStartTour);
    
    // Automatically trigger for first-time visitors after 1.5 seconds
    const hasSeenTour = localStorage.getItem('payflow-tour-completed');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('start-payflow-tour', handleStartTour);
    };
  }, []);

  // Update target element coordinates on step change, resize, or scroll
  useEffect(() => {
    if (!isOpen) {
      setCoords(null);
      return;
    }

    const step = steps[currentStep];
    const targetSelector = step.target;
    if (!targetSelector) {
      setCoords(null);
      return;
    }

    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) {
      setCoords(null);
      return;
    }

    const updateCoords = () => {
      const rect = targetEl.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    // Scroll target into view gently if needed
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wait a brief moment for scroll to complete before updating coords
    const timer = setTimeout(updateCoords, 300);

    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
    };
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('payflow-tour-completed', 'true');
  };

  // Determine tooltip style based on coordinates and placement
  const getCardStyle = (): React.CSSProperties => {
    if (!coords) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        width: 'min(90vw, 360px)',
      };
    }

    const padding = 16;
    let placement = steps[currentStep].placement;
    const cardWidth = 360;
    const cardHeight = 220; // Estimated height for boundary math

    // Get viewport width and height
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    let left = coords.left + coords.width / 2;
    let top = coords.top + coords.height + padding;
    let transform = 'translateX(-50%)';

    // Auto-adjust vertical placement if it overflows bottom
    if (placement === 'bottom' && top + cardHeight > vh - 16) {
      placement = 'top';
    } else if (placement === 'top' && coords.top - padding - cardHeight < 16) {
      placement = 'bottom';
    }

    if (placement === 'top') {
      top = coords.top - padding;
      transform = 'translate(-50%, -100%)';
    } else if (placement === 'bottom') {
      top = coords.top + coords.height + padding;
      transform = 'translateX(-50%)';
    } else if (placement === 'left') {
      top = coords.top + coords.height / 2;
      left = coords.left - padding;
      transform = 'translate(-100%, -50%)';
    } else if (placement === 'right') {
      top = coords.top + coords.height / 2;
      left = coords.left + coords.width + padding;
      transform = 'translateY(-50%)';
    }

    // Horizontal boundary safety
    const halfWidth = Math.min(vw * 0.9, cardWidth) / 2;
    const margin = 16;
    
    if (left - halfWidth < margin) {
      left = halfWidth + margin;
    } else if (left + halfWidth > vw - margin) {
      left = vw - halfWidth - margin;
    }

    // Vertical boundary safety
    if (placement === 'top' && top - cardHeight < margin) {
      top = cardHeight + margin;
    } else if (placement === 'bottom' && top + cardHeight > vh - margin) {
      top = vh - cardHeight - margin;
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      transform,
      zIndex: 10000,
      width: 'min(90vw, 360px)',
    };
  };

  return (
    <>
      {/* Floating Help / Start Tour Button */}
      <button
        onClick={() => {
          setCurrentStep(0);
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-dark-800 border border-white/10 text-primary-light hover:text-white shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:scale-105 active:scale-95 group"
        aria-label="Start product tour"
      >
        <HelpCircle size={22} className="group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute right-14 scale-0 group-hover:scale-100 origin-right transition-all duration-200 bg-dark-800 border border-white/5 text-xxs font-semibold uppercase tracking-wider text-white px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap">
          Product Tour
        </span>
      </button>

      {/* Tour Overlay & Modal Card */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Scrim / Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[9998] pointer-events-auto backdrop-blur-[1px]"
              onClick={handleClose}
            />

            {/* Glowing Focus Ring around active element */}
            {coords && (
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                style={{
                  position: 'fixed',
                  top: `${coords.top - 6}px`,
                  left: `${coords.left - 6}px`,
                  width: `${coords.width + 12}px`,
                  height: `${coords.height + 12}px`,
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
                className="rounded-xl border-2 border-primary shadow-[0_0_20px_rgba(13,148,136,0.3)] animate-pulse"
              />
            )}

            {/* Walkthrough Tooltip / Card */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={getCardStyle()}
              className="bg-dark-800 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-left max-w-sm"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="relative h-6 w-6 overflow-hidden rounded bg-dark-800 border border-white/5 flex items-center justify-center">
                    <Image
                      src="/icon.png"
                      alt="PayFlow Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">PayFlow Guide</span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-lg text-dark-500 hover:text-white transition"
                  aria-label="Skip tour"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {steps[currentStep].title}
                </h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  {steps[currentStep].content}
                </p>
              </div>

              {/* Progress & Actions */}
              <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/5">
                {/* Step Indicators / Dots */}
                <div className="flex gap-1.5">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentStep ? 'w-4 bg-primary shadow-sm shadow-primary/40' : 'w-1.5 bg-dark-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      onClick={handleBack}
                      variant="secondary"
                      className="px-2.5 py-1.5 text-xxs font-bold flex items-center gap-1 rounded-xl"
                    >
                      <ChevronLeft size={12} />
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    variant="primary"
                    className="px-3 py-1.5 text-xxs font-bold flex items-center gap-1 rounded-xl shadow-md shadow-primary/20"
                  >
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    {currentStep < steps.length - 1 && <ChevronRight size={12} />}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
