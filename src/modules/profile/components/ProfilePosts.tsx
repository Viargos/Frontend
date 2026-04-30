import type { ProfilePost } from '@/modules/profile/types/profile.types';
import * as motion from 'framer-motion/client';
import Link from 'next/link';
import { JourneyIcon } from '@/modules/common/icons';
import { ProfilePostMediaCarousel } from '@/modules/profile/components/ProfilePostMediaCarousel';

type ProfilePostsProps = {
  posts: ProfilePost[];
  ownerName: string;
};

export const ProfilePosts = (props: ProfilePostsProps) => {
  const { ownerName, posts } = props;

  if (posts.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        {ownerName}
        {' '}
        has no posts yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post, index) => (
        <motion.article
          key={post.id}
          className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.04 }}
          whileHover={{ y: -1 }}
        >
          {post.mediaUrls.length > 0
            ? (
                <div className="relative mb-3 h-40 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                  <ProfilePostMediaCarousel fillContainer mediaUrls={post.mediaUrls} />
                </div>
              )
            : null}
          {post.journey
            ? (
                <div className="mb-2">
                  <Link
                    className="flex items-center gap-1.5 text-xs font-medium text-[#160E53] hover:underline"
                    href={`/journey/${post.journey.id}`}
                  >
                    <JourneyIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate" title={post.journey.title}>{post.journey.title}</span>
                  </Link>
                </div>
              )
            : null}
          <p className="line-clamp-3 text-sm text-gray-700">{post.description}</p>
          <div className="mt-2 flex gap-3 text-xs text-gray-500">
            <span>
              {post.likeCount}
              {' '}
              likes
            </span>
            <span>
              {post.commentCount}
              {' '}
              comments
            </span>
          </div>
        </motion.article>
      ))}
    </div>
  );
};
