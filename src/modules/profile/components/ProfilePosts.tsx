import type { ProfilePost } from '@/modules/profile/types/profile.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';

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
                  <Image alt={post.description.slice(0, 60)} className="h-full w-full object-cover" fill src={post.mediaUrls[0]!} unoptimized />
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
