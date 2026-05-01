import type { SVGProps } from 'react';
import {
  Plane as Airplane,
  Backpack,
  Calendar,
  Camera,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Compass,
  Eye,
  FileText,
  Globe,
  GripVertical,
  Heart,
  Hotel,
  Map,
  MapPin,
  Moon,
  Mountain,
  Navigation,
  Plus,
  RefreshCw,
  Search,
  Ship,
  SquarePen,
  SunMedium,
  Train,
  Trash2,
  Trees,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export const AirplaneIcon = ({ size = 24, ...props }: IconProps) => (
  <Airplane height={size} width={size} {...props} />
);
export const BackpackIcon = ({ size = 24, ...props }: IconProps) => (
  <Backpack height={size} width={size} {...props} />
);
export const CalendarIcon = ({ size = 24, ...props }: IconProps) => (
  <Calendar height={size} width={size} {...props} />
);
export const CameraIcon = ({ size = 24, ...props }: IconProps) => (
  <Camera height={size} width={size} {...props} />
);
export const CarIcon = ({ size = 24, ...props }: IconProps) => (
  <Car height={size} width={size} {...props} />
);
export const CheckIcon = ({ size = 24, ...props }: IconProps) => (
  <Check height={size} width={size} {...props} />
);
export const ChevronDownIcon = ({ size = 24, ...props }: IconProps) => (
  <ChevronDown height={size} width={size} {...props} />
);
export const ChevronLeftIcon = ({ size = 24, ...props }: IconProps) => (
  <ChevronLeft height={size} width={size} {...props} />
);
export const ChevronRightIcon = ({ size = 24, ...props }: IconProps) => (
  <ChevronRight height={size} width={size} {...props} />
);
export const ClipboardListIcon = ({ size = 24, ...props }: IconProps) => (
  <ClipboardList height={size} width={size} {...props} />
);
export const ClockIcon = ({ size = 24, ...props }: IconProps) => (
  <Clock3 height={size} width={size} {...props} />
);
export const CompassIcon = ({ size = 24, ...props }: IconProps) => (
  <Compass height={size} width={size} {...props} />
);
export const ExploreIcon = ({ size = 24, ...props }: IconProps) => (
  <Search height={size} width={size} {...props} />
);
export const SearchIcon = ({ size = 24, ...props }: IconProps) => (
  <Search height={size} width={size} {...props} />
);
export const EyeIcon = ({ size = 24, ...props }: IconProps) => (
  <Eye height={size} width={size} {...props} />
);
export const EditIcon = ({ size = 24, ...props }: IconProps) => (
  <SquarePen height={size} width={size} {...props} />
);
export const FileTextIcon = ({ size = 24, ...props }: IconProps) => (
  <FileText height={size} width={size} {...props} />
);
export const GlobeIcon = ({ size = 24, ...props }: IconProps) => (
  <Globe height={size} width={size} {...props} />
);
export const GripVerticalIcon = ({ size = 24, ...props }: IconProps) => (
  <GripVertical height={size} width={size} {...props} />
);
export const HeartIcon = ({ size = 24, ...props }: IconProps) => (
  <Heart height={size} width={size} {...props} />
);
export const HikingIcon = ({ size = 24, ...props }: IconProps) => (
  <Navigation height={size} width={size} {...props} />
);
export const HotelIcon = ({ size = 24, ...props }: IconProps) => (
  <Hotel height={size} width={size} {...props} />
);
export const ImageIcon = ({ size = 24, ...props }: IconProps) => (
  <Camera height={size} width={size} {...props} />
);
export const JourneyIcon = ({ size = 24, ...props }: IconProps) => (
  <MapPin height={size} width={size} {...props} />
);
export const CreateJourneyIcon = ({ size = 24, ...props }: IconProps) => (
  <MapPin height={size} width={size} {...props} />
);
export const MapIcon = ({ size = 24, ...props }: IconProps) => (
  <Map height={size} width={size} {...props} />
);
export const MapPinIcon = ({ size = 24, ...props }: IconProps) => (
  <MapPin height={size} width={size} {...props} />
);
export const MountainIcon = ({ size = 24, ...props }: IconProps) => (
  <Mountain height={size} width={size} {...props} />
);
export const MoonIcon = ({ size = 24, ...props }: IconProps) => (
  <Moon height={size} width={size} {...props} />
);
export const PinIcon = ({ size = 24, ...props }: IconProps) => (
  <MapPin height={size} width={size} {...props} />
);
export const PlusIcon = ({ size = 24, ...props }: IconProps) => (
  <Plus height={size} width={size} {...props} />
);
export const AddPostIcon = ({ size = 24, ...props }: IconProps) => (
  <Plus height={size} width={size} {...props} />
);
export const RefreshCwIcon = ({ size = 24, ...props }: IconProps) => (
  <RefreshCw height={size} width={size} {...props} />
);
export const ShipIcon = ({ size = 24, ...props }: IconProps) => (
  <Ship height={size} width={size} {...props} />
);
export const SunIcon = ({ size = 24, ...props }: IconProps) => (
  <SunMedium height={size} width={size} {...props} />
);
export const TreeIcon = ({ size = 24, ...props }: IconProps) => (
  <Trees height={size} width={size} {...props} />
);
export const TrashIcon = ({ size = 24, ...props }: IconProps) => (
  <Trash2 height={size} width={size} {...props} />
);
export const TrainIcon = ({ size = 24, ...props }: IconProps) => (
  <Train height={size} width={size} {...props} />
);
export const UtensilsIcon = ({ size = 24, ...props }: IconProps) => (
  <UtensilsCrossed height={size} width={size} {...props} />
);
export const UsersIcon = ({ size = 24, ...props }: IconProps) => (
  <Users height={size} width={size} {...props} />
);
export const XIcon = ({ size = 24, ...props }: IconProps) => (
  <X height={size} width={size} {...props} />
);

export const ChatBubbleIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7 8H17M7 12H13M21 11.5C21 15.6421 16.9706 19 12 19C11.3029 19 10.6242 18.9314 9.97271 18.8031L4 20L5.48716 16.2818C4.55857 14.9564 4 13.2874 4 11.5C4 7.35786 8.02944 4 13 4C17.9706 4 21 7.35786 21 11.5Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const HotAirBalloonIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 2C8.68629 2 6 4.68629 6 8C6 11.3137 8.68629 14 12 14C15.3137 14 18 11.3137 18 8C18 4.68629 15.3137 2 12 2Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M9 14L10 20H14L15 14M10 20H14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const GlobeIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="200" cy="200" fill="#EFF6FF" r="190" />
    <circle cx="200" cy="200" stroke="#BFDBFE" strokeWidth="8" r="130" />
    <path d="M70 200H330M200 70V330" stroke="#93C5FD" strokeWidth="6" />
    <ellipse cx="200" cy="200" rx="60" ry="130" stroke="#93C5FD" strokeWidth="6" />
    <ellipse cx="200" cy="200" rx="130" ry="60" stroke="#93C5FD" strokeWidth="6" />
  </svg>
);

export const MapRouteIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect fill="#F8FAFC" height="220" rx="16" width="320" />
    <path
      d="M38 168C75 82 120 82 160 130C195 172 241 172 282 62"
      stroke="#2563EB"
      strokeDasharray="8 8"
      strokeLinecap="round"
      strokeWidth="6"
    />
    <circle cx="38" cy="168" fill="#16A34A" r="10" />
    <circle cx="282" cy="62" fill="#DC2626" r="10" />
  </svg>
);

export const SocialNetworkIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect fill="#F8FAFC" height="200" rx="16" width="280" />
    <path d="M50 40L140 100L230 40M50 160L140 100L230 160" stroke="#94A3B8" strokeWidth="3" />
    <circle cx="50" cy="40" fill="#0EA5E9" r="12" />
    <circle cx="140" cy="100" fill="#22C55E" r="12" />
    <circle cx="230" cy="40" fill="#6366F1" r="12" />
    <circle cx="50" cy="160" fill="#F59E0B" r="12" />
    <circle cx="230" cy="160" fill="#EF4444" r="12" />
  </svg>
);

export const SpinnerIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
    <path d="M22 12A10 10 0 0 1 12 22" stroke="currentColor" strokeWidth="4" />
  </svg>
);
