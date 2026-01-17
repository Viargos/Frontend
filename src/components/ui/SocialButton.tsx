import { ReactNode } from "react";
import { GoogleIcon, FacebookIcon, AppleIcon } from "@/components/icons";

interface SocialButtonProps {
  provider: "google" | "facebook" | "apple";
  children: ReactNode;
  onClick?: () => void;
}

const icons = {
  google: GoogleIcon,
  facebook: FacebookIcon,
  apple: AppleIcon,
};

export default function SocialButton({
  provider,
  children,
  onClick,
}: SocialButtonProps) {
  const IconComponent = icons[provider];

  return (
    <button
      onClick={onClick}
      className="flex px-4 py-2.5 justify-center items-center gap-3 w-full rounded-lg border border-gray-300 bg-white shadow-button hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <IconComponent />
      <span className="text-gray-700 font-manrope text-base font-semibold leading-6">
        {children}
      </span>
    </button>
  );
}
