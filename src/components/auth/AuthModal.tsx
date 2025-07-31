"use client";

import { useState } from "react";
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
  const { clearError } = useAuthStore();

  const handleClose = () => {
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
    handleClose();
  };

  const handleResendOtp = async () => {
    // This would typically call the signup API again to resend OTP
    // For now, we'll just show a message
    console.log("Resending OTP to:", signupEmail);
  };

  const renderStep = () => {
    switch (currentStep) {
      case "login":
        return (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onSwitchToSignup={() => setCurrentStep("signup")}
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
            onSwitchToLogin={() => setCurrentStep("login")}
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
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-auto">
        {renderStep()}
      </div>
    </Modal>
  );
}
