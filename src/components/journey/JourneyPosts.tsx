'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/types/post.types';
import { serviceFactory } from '@/lib/services/service-factory';
import Image from 'next/image';
import CreatePostModal from '@/components/post/CreatePostModal';
import PostMediaSlideshow from '@/components/post/PostMediaSlideshow';

interface JourneyPostsProps {
  journeyId: string;
  journeyTitle?: string;
}

export default function JourneyPosts({
  journeyId,
  journeyTitle,
}: JourneyPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchJourneyPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const postService = serviceFactory.postService;
        const response = await postService.getPostsByJourney(journeyId);
        setPosts(response.data || []);
      } catch (err) {
        console.error('Error fetching journey posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };

    if (journeyId) {
      fetchJourneyPosts();
    }
  }, [journeyId]);

  const handlePostCreated = () => {
    // Refresh the posts list after creating a new post
    const fetchJourneyPosts = async () => {
      try {
        const postService = serviceFactory.postService;
        const response = await postService.getPostsByJourney(journeyId);
        setPosts(response.data || []);
      } catch (err) {
        console.error('Error fetching journey posts:', err);
      }
    };
    fetchJourneyPosts();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="mt-3 h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Failed to load posts
          </h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 shadow-sm border border-blue-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Posts Yet
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Share your journey experiences! Create posts about your adventures,
            favorite spots, and memorable moments from{' '}
            {journeyTitle || 'this journey'}.
          </p>
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-[#001A6E] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Your First Post
          </button>

          {/* Create Post Modal */}
          <CreatePostModal
            isOpen={isCreatePostModalOpen}
            onClose={() => setIsCreatePostModalOpen(false)}
            onSuccess={handlePostCreated}
          />
        </div>
      </div>
    );
  }

  // Posts display - Creative Scrapbook/Polaroid Style
  return (
    <div className="relative">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.05) 35px, rgba(0,0,0,.05) 70px)`,
          }}
        ></div>
      </div>

      {/* Header with Handwritten Style */}
      <div className="relative mb-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 tracking-tight">
            Journey Memories
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300"></div>
            <p className="text-sm text-gray-500 italic">
              {posts.length} {posts.length === 1 ? 'memory' : 'memories'}{' '}
              captured
            </p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>
      </div>

      {/* Polaroid/Scrapbook Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        {posts.map((post, index) => {
          // Random slight rotations for organic feel
          const rotations = [-2, -1, 0, 1, 2, -1.5, 1.5];
          const rotation = rotations[index % rotations.length];

          return (
            <div
              key={post.id}
              className="group relative"
              style={{
                animation: `floatIn 0.6s ease-out ${index * 0.15}s both`,
              }}
            >
              {/* Polaroid Container */}
              <div
                className="bg-white p-3 pb-12 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'all 0.3s ease',
                }}
                onClick={() => setSelectedPost(post)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = `rotate(0deg) scale(1.05) translateY(-10px)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1) translateY(0)`;
                }}
              >
                {/* Tape Effect at Top */}
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-yellow-50 opacity-70 shadow-sm"
                  style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 98% 100%, 2% 100%)',
                  }}
                ></div>

                {/* Post Image */}
                <div className="relative aspect-square bg-gray-100 mb-3 overflow-hidden">
                  {post.media && post.media.length > 0 ? (
                    <Image
                      src={post.media[0].url}
                      alt={post.description}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <svg
                        className="w-16 h-16 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Media Count Badge */}
                  {post.media && post.media.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      +{post.media.length - 1}
                    </div>
                  )}
                </div>

                {/* Handwritten Caption Area */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>

                  {/* User Info */}
                  <div className="flex items-center space-x-2 pt-2">
                    {post.user.profileImage ? (
                      <Image
                        src={post.user.profileImage}
                        alt={post.user.username}
                        className="w-6 h-6 rounded-full"
                        width={24}
                        height={24}
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-600">
                          {post.user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-gray-500 italic">
                      by {post.user.username}
                    </span>
                  </div>

                  {/* Interaction Stats */}
                  <div className="flex items-center space-x-4 pt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill={
                          post.isLikedByCurrentUser ? 'currentColor' : 'none'
                        }
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{post.likeCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>{post.commentCount}</span>
                    </div>
                  </div>
                </div>

                {/* Corner Curl Effect */}
                <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Pin/Tack Effect */}
              <div
                className="absolute -top-2 right-8 w-3 h-3 bg-[#001A6E] rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  boxShadow:
                    '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              ></div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Media Slideshow Modal */}
      {selectedPost && (
        <PostMediaSlideshow
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          media={selectedPost.media || []}
          postDescription={selectedPost.description}
          username={selectedPost.user.username}
          userProfileImage={selectedPost.user.profileImage || undefined}
          likeCount={selectedPost.likeCount}
          commentCount={selectedPost.commentCount}
          isLikedByCurrentUser={selectedPost.isLikedByCurrentUser || false}
        />
      )}
    </div>
  );
}
