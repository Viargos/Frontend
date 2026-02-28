export function formatPostTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  const now = Date.now();
  const delta = Math.max(0, now - date.getTime());
  const minutes = Math.floor(delta / (1000 * 60));

  if (minutes < 1) {
    return 'less than a minute ago';
  }

  if (minutes < 60) {
    return minutes === 1 ? 'a minute ago' : `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? 'about 1 hour ago' : `about ${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? 'about 1 month ago' : `about ${months} months ago`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? 'about 1 year ago' : `about ${years} years ago`;
}
