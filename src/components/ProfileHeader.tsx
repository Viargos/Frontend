interface ProfileHeaderProps {
  backgroundImage: string;
  avatarImage: string;
  name: string;
}

export default function ProfileHeader({
  backgroundImage,
  avatarImage,
  name,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col justify-center items-start -gap-12 w-full rounded-md bg-white shadow-lg overflow-hidden">
      {/* Hero Background Image */}
      <img
        src={backgroundImage}
        alt="Profile background"
        className="h-[270px] w-full object-cover rounded-t-md"
      />

      {/* Avatar and Name Section */}
      <div className="flex h-42 px-6 items-end -mt-12 gap-20 w-full">
        <div className="flex flex-col justify-center items-center gap-2">
          {/* Avatar Container */}
          <div className="w-30 h-30 rounded-lg relative">
            {/* Background with gradient */}
            <div className="w-30 h-30 absolute left-0 top-0">
              <div className="w-30 h-30 rounded-lg bg-primary-purple absolute left-0 top-0" />
              <div className="w-24 h-24 rounded-lg bg-white bg-opacity-30 absolute left-3 top-3" />
            </div>
            {/* Avatar Image */}
            <img
              src={avatarImage}
              alt={name}
              className="w-30 h-30 rounded-lg absolute left-0 top-0 object-cover"
            />
          </div>

          {/* Name */}
          <h1 className="text-heading font-mulish text-[22px] font-bold leading-7">
            {name}
          </h1>
        </div>
      </div>
    </div>
  );
}
