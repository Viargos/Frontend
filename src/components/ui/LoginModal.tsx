"use client";

import { useState } from "react";
import Modal from "./Modal";
import InputField from "./InputField";
import Checkbox from "./Checkbox";
import SocialButton from "./SocialButton";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleNextClick = () => {
    // Handle login logic here
    console.log("Login with email:", email);
  };

  const handleSocialLogin = (provider: string) => {
    // Handle social login logic here
    console.log(`Login with ${provider}`);
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic here
    console.log("Forgot password clicked");
  };

  const handleSignUp = () => {
    // Handle sign up logic here
    console.log("Sign up clicked");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[408px]">
      <div className="flex flex-col items-center gap-8 p-6 w-full">
        {/* Header */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex flex-col items-center gap-3 w-full">
            <h1
              className="text-center font-inter text-[30px] font-bold leading-[38px]"
              style={{ color: "#181D27" }}
            >
              Login your account
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Email Input */}
          <InputField
            label="Email"
            placeholder="Enter your email"
            hintText="This is a hint text to help user."
            type="email"
            value={email}
            onChange={setEmail}
          />

          {/* Row with checkbox and forgot password */}
          <div className="flex justify-between items-center w-full">
            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onChange={setRememberMe}
            />
            <button
              onClick={handleForgotPassword}
              className="text-blue-600 font-manrope text-sm font-semibold leading-5 hover:text-blue-700 transition-colors"
              style={{ color: "#001A6E" }}
            >
              Forgot password
            </button>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextClick}
            className="flex px-4.5 py-2.5 justify-center items-center gap-2 w-full rounded-lg border border-blue-600 bg-blue-600 shadow-button hover:bg-blue-700 transition-colors"
            style={{
              backgroundColor: "#001A6E",
              borderColor: "#001A6E",
            }}
          >
            <span className="text-white font-manrope text-base font-semibold leading-6">
              Next
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 w-full">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-gray-500 text-center font-manrope text-sm leading-5">
              OR
            </span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex flex-col justify-center items-center gap-4 w-full">
            <SocialButton
              provider="google"
              onClick={() => handleSocialLogin("google")}
            >
              Sign up with Google
            </SocialButton>

            <SocialButton
              provider="facebook"
              onClick={() => handleSocialLogin("facebook")}
            >
              Sign up with Facebook
            </SocialButton>

            <SocialButton
              provider="apple"
              onClick={() => handleSocialLogin("apple")}
            >
              Sign up with Apple
            </SocialButton>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center items-center gap-1 w-full">
          <span className="text-gray-600 font-manrope text-sm leading-5">
            Don't have an account?
          </span>
          <button
            onClick={handleSignUp}
            className="text-blue-600 font-manrope text-sm font-semibold leading-5 hover:text-blue-700 transition-colors"
            style={{ color: "#001A6E" }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </Modal>
  );
}
