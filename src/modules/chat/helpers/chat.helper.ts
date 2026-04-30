export function buildConversationId(userA: string, userB: string): string {
  return userA < userB ? `${userA}__${userB}` : `${userB}__${userA}`;
}

export function formatChatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
