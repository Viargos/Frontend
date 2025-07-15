import JourneyIcon from "./icons/JourneyIcon";
import ImagePlusIcon from "./icons/ImagePlusIcon";
import MapIcon from "./icons/MapIcon";

interface ActionButtonProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

function ActionButton({
  children,
  icon,
  variant = "secondary",
  onClick,
}: ActionButtonProps) {
  const baseClasses =
    "flex items-center rounded-md shadow-sm transition-colors";

  const variantClasses = {
    primary: "bg-primary-blue text-white",
    secondary: "bg-transparent text-gray-400",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      <div className="flex px-5 py-2.5 items-center gap-2">
        <span className="w-6 h-6">{icon}</span>
        <span className="font-manrope text-[15px] font-bold leading-normal tracking-wide">
          {children}
        </span>
      </div>
    </button>
  );
}

export default function ProfileActions() {
  return (
    <div className="flex items-center w-full">
      <ActionButton
        variant="primary"
        icon={<JourneyIcon className="text-white" />}
      >
        Journey
      </ActionButton>

      <ActionButton
        variant="secondary"
        icon={<ImagePlusIcon className="text-gray-400" />}
      >
        Post
      </ActionButton>

      <ActionButton
        variant="secondary"
        icon={<MapIcon className="text-gray-400" />}
      >
        Map
      </ActionButton>
    </div>
  );
}
