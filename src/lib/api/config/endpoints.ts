export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    REFRESH: '/api/auth/refresh',
    SIGNUP: '/api/auth/signup',
    VERIFY_OTP: '/api/auth/verify-otp',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    RESEND_OTP: '/api/auth/resend-otp',
  },
  USER: {
    ME: '/api/user/me',
    GET: (userId: string) => `/api/user/${userId}`,
    PROFILE: '/api/user/profile',
    PROFILE_IMAGE: '/api/user/profile-image',
    BANNER_IMAGE: '/api/user/banner-image',
    STATS: '/api/user/stats',
    FOLLOW: '/api/user/relationships/follow',
    UNFOLLOW: (userId: string) => `/api/user/relationships/unfollow/${userId}`,
    FOLLOWERS: (userId: string) =>
      `/api/user/relationships/${userId}/followers`,
    FOLLOWING: (userId: string) =>
      `/api/user/relationships/${userId}/following`,
  },
  DASHBOARD: {
    POSTS: '/api/dashboard',
  },
  POSTS: {
    LIST: '/api/posts',
    CREATE: '/api/posts',
    GET: (id: string) => `/api/posts/${id}`,
    UPDATE: (id: string) => `/api/posts/${id}`,
    DELETE: (id: string) => `/api/posts/${id}`,
    LIKE: (id: string) => `/api/posts/${id}/like`,
    UNLIKE: (id: string) => `/api/posts/${id}/unlike`,
    COMMENTS: (id: string) => `/api/posts/${id}/comments`,
    USER: (userId: string) => `/api/posts/user/${userId}`,
    JOURNEY: (journeyId: string) => `/api/posts/journey/${journeyId}`,
    REPLIES: (commentId: string) => `/api/posts/comments/${commentId}/replies`,
    MEDIA: (postId: string) => `/api/posts/${postId}/media`,
    UPLOAD_MEDIA: '/api/posts/media',
  },
  JOURNEYS: {
    LIST: '/api/journeys',
    NEARBY: '/api/journeys/nearby',
    CREATE: '/api/journeys',
    GET: (id: string) => `/api/journeys/${id}`,
    UPDATE: (id: string) => `/api/journeys/${id}`,
    DELETE: (id: string) => `/api/journeys/${id}`,
    BANNER: (id: string) => `/api/journeys/${id}/banner`,
    DAYS: (id: string) => `/api/journeys/${id}/days`,
    DAY: (id: string, dayId: string) => `/api/journeys/${id}/days/${dayId}`,
    ACTIVITIES: (id: string) => `/api/journeys/${id}/activities`,
    ACTIVITY: (id: string, locationId: string) =>
      `/api/journeys/${id}/activities/${locationId}`,
    REORDER_ACTIVITIES: (id: string) =>
      `/api/journeys/${id}/activities/reorder`,
  },
  CHAT: {
    ME: '/api/chat/me',
    CONVERSATIONS: '/api/chat/conversations',
    CREATE_CONVERSATION: '/api/chat/conversations',
    CONVERSATION: (id: string) => `/api/chat/conversations/${id}`,
    MARK_CONVERSATION_READ: (id: string) =>
      `/api/chat/conversations/${id}/read`,
    MESSAGES: (conversationId: string) =>
      `/api/chat/conversations/${conversationId}/messages`,
    SEND_MESSAGE: '/api/chat/messages',
    USERS_SEARCH: '/api/chat/users/search',
    USER: (userId: string) => `/api/chat/users/${userId}`,
  },
  LOCATION: {
    CURRENT: '/api/location/current',
  },
} as const;
