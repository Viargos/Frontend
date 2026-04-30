import { ChatPageView } from '@/modules/chat';

export default async function MessagesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ChatPageView searchParams={props.searchParams} />;
}
