"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import OtpVerificationForm from "./OtpVerificationForm";
import { useAuthStore } from "@/store/auth.store";

type AuthStep = "login" | "signup" | "otp";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: AuthStep;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialStep = "login",
}: AuthModalProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep);
  const [signupEmail, setSignupEmail] = useState("");
  const { clearError, error } = useAuthStore();

  // Update currentStep when initialStep changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
      clearError(); // Clear any previous errors when opening modal
    }
  }, [isOpen, initialStep, clearError]);

  const handleClose = () => {
    // Don't close the modal if there's an active error
    if (error) {
      return;
    }
    
    clearError();
    setCurrentStep(initialStep);
    setSignupEmail("");
    onClose();
  };

  const handleForceClose = () => {
    // Force close and clear everything (for manual close button)
    clearError();
    setCurrentStep(initialStep);
    setSignupEmail("");
    onClose();
  };

  const handleLoginSuccess = () => {
    handleClose();
  };

  const handleSignupSuccess = (email: string) => {
    setSignupEmail(email);
    setCurrentStep("otp");
  };

  const handleOtpSuccess = () => {
    // After successful OTP verification, user is automatically logged in
    // Close the modal and let the header show the authenticated state
    handleClose();
  };

  const handleResendOtp = async () => {
    try {
      // Use the dedicated resend OTP function
      const { resendOtp, clearError } = useAuthStore.getState();
      const result = await resendOtp(signupEmail);
      
      if (result.success) {
        console.log("OTP resent successfully");
        // Clear any previous errors
        clearError();
      } else {
        console.log("Failed to resend OTP:", result.error);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
    }
  };

  const handleSwitchToSignup = () => {
    clearError(); // Clear any login errors when switching to signup
    setCurrentStep("signup");
  };

  const handleSwitchToLogin = () => {
    clearError(); // Clear any signup errors when switching to login
    setCurrentStep("login");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "login":
        return (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onSwitchToSignup={handleSwitchToSignup}
            onSwitchToForgotPassword={() => {
              // Handle forgot password flow
              console.log("Forgot password clicked");
            }}
          />
        );
      case "signup":
        return (
          <SignupForm
            onSuccess={(email) => handleSignupSuccess(email)}
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      case "otp":
        return (
          <OtpVerificationForm
            email={signupEmail}
            onSuccess={handleOtpSuccess}
            onResendOtp={handleResendOtp}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} showBackdrop={false}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-auto relative">
        {/* Close button */}
        <button
          onClick={handleForceClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        
        {renderStep()}
      </div>
    </Modal>
  );
}
