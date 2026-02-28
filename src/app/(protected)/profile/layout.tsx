import type { Metadata } from 'next';

export const metadata: Metadata = {
  description: 'View and manage your profile, journeys, and posts',
  title: 'Profile | Viargos',
};

export default function ProfileLayout(props: { children: React.ReactNode }) {
  return (
    <div className="max-w-none flex-1 p-4 sm:p-6">
      {props.children}
    </div>
  );
}
