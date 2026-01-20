'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Users, UserPlus } from 'lucide-react';
import { User } from '@/types/user.types';
import { userService } from '@/lib/services/service-factory';
import { useAuthStore } from '@/store/auth.store';
import { ChevronRightIcon } from '@/components/icons';

export type ModalType = 'followers' | 'following';

interface FollowersFollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab: ModalType;
  username?: string;
}

interface UserItemProps {
  user: User;
  onUserClick: (userId: string) => void;
  currentUserId?: string;
}

function UserItem({ user, onUserClick, currentUserId }: UserItemProps) {
  const isCurrentUser = user.id === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
      onClick={() => onUserClick(user.id)}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#001A6E] flex-shrink-0">
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.username || 'User'}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 text-sm">
            {user.username}
            {isCurrentUser && (
              <span className="ml-2 text-xs text-gray-500">(You)</span>
            )}
          </span>
          {user.email && (
            <span className="text-xs text-gray-500 truncate max-w-[180px]">
              {user.email}
            </span>
          )}
        </div>
      </div>

      {/* View Profile Arrow */}
      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
    </motion.div>
  );
}

function EmptyState({ type }: { type: ModalType }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {type === 'followers' ? (
          <Users className="w-8 h-8 text-gray-400" />
        ) : (
          <UserPlus className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {type === 'followers' ? 'No followers yet' : 'Not following anyone'}
      </h3>
      <p className="text-gray-500 text-center text-sm">
        {type === 'followers'
          ? 'When someone follows this account, they will appear here.'
          : 'When this account follows someone, they will appear here.'}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FollowersFollowingModal({
  isOpen,
  onClose,
  userId,
  initialTab,
  username,
}: FollowersFollowingModalProps) {
  const [activeTab, setActiveTab] = useState<ModalType>(initialTab);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user: currentUser } = useAuthStore();

  // Reset tab when modal opens with a different initial tab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Fetch data when modal opens or tab changes
  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (activeTab === 'followers') {
          const response = await userService.getFollowers(userId);
          setFollowers(response.data || []);
        } else {
          const response = await userService.getFollowing(userId);
          setFollowing(response.data || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, userId, activeTab]);

  const handleUserClick = (clickedUserId: string) => {
    onClose();
    if (clickedUserId === currentUser?.id) {
      router.push('/profile');
    } else {
      router.push(`/user/${clickedUserId}`);
    }
  };

  const currentList = activeTab === 'followers' ? followers : following;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {username ? `${username}'s ` : ''}
                {activeTab === 'followers' ? 'Followers' : 'Following'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'followers'
                    ? 'text-primary-blue'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Followers
                {activeTab === 'followers' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-blue"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'following'
                    ? 'text-primary-blue'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Following
                {activeTab === 'following' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-blue"
                  />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[400px] min-h-[300px] overflow-y-auto">
              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <p className="text-red-500 text-center">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setIsLoading(true);
                    }}
                    className="mt-4 text-primary-blue hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : currentList.length === 0 ? (
                <EmptyState type={activeTab} />
              ) : (
                <div className="divide-y divide-gray-100">
                  {currentList.map(user => (
                    <UserItem
                      key={user.id}
                      user={user}
                      onUserClick={handleUserClick}
                      currentUserId={currentUser?.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
