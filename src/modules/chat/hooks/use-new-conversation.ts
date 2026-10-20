'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { chatService } from '@/modules/chat/services/chat.service';

export function useNewConversation(options: {
  currentUserId?: string;
  onStartConversation: (userId: string) => Promise<void>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const peopleQuery = useQuery({
    enabled: debouncedQuery !== null,
    queryFn: () => chatService.searchUsers(debouncedQuery ?? ''),
    queryKey: ['chat', 'people', options.currentUserId, debouncedQuery],
    retry: false,
    staleTime: 30_000,
  });
  const startConversation = useMutation({
    mutationFn: options.onStartConversation,
  });

  return {
    isSearching: peopleQuery.isPending || debouncedQuery !== searchQuery.trim(),
    people: (peopleQuery.data ?? []).filter(person => person.id !== options.currentUserId),
    peopleQuery,
    searchQuery,
    setSearchQuery,
    startConversation,
  };
}
