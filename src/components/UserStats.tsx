interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col justify-center items-start gap-2">
      <div className="text-black font-manrope text-[35px] font-extrabold leading-[120%]">
        {value}
      </div>
      <div className="text-black font-manrope text-xl font-normal leading-[120%]">
        {label}
      </div>
    </div>
  );
}

interface UserStatsProps {
  posts: string;
  journeys: string;
  followers: string;
  following: string;
}

export default function UserStats({
  posts,
  journeys,
  followers,
  following,
}: UserStatsProps) {
  return (
    <div className="flex items-start gap-20 w-full">
      <StatItem value={posts} label="Post" />
      <StatItem value={journeys} label="Journey" />
      <StatItem value={followers} label="Follower" />
      <StatItem value={following} label="Following" />
    </div>
  );
}
