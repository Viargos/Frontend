import type { NotificationCategory } from '@/modules/notifications/types/notification.types';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ListChecks,
  LockKeyhole,
  Megaphone,
  MessageCircle,
} from 'lucide-react';

export function NotificationCategoryIcon(props: {
  category: NotificationCategory;
  className?: string;
}) {
  const className = props.className ?? 'h-4 w-4';

  switch (props.category) {
    case 'account_security':
      return <LockKeyhole aria-hidden="true" className={className} />;
    case 'errors_warnings':
      return <AlertTriangle aria-hidden="true" className={className} />;
    case 'messages_activity':
      return <MessageCircle aria-hidden="true" className={className} />;
    case 'product_system':
      return <Megaphone aria-hidden="true" className={className} />;
    case 'reminders':
      return <BellRing aria-hidden="true" className={className} />;
    case 'success':
      return <CheckCircle2 aria-hidden="true" className={className} />;
    case 'task_workflow':
      return <ListChecks aria-hidden="true" className={className} />;
    default:
      return <BellRing aria-hidden="true" className={className} />;
  }
}
