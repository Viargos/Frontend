import { redirect } from 'next/navigation';
import { getChatParityFixtureConversations } from '../constants/chat-parity.fixtures';
import { ChatUnauthorizedError, getServerChatConversations } from '../services/chat.server';
import { ChatPageClient } from './ChatPageClient';

type ChatPageViewProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function ChatPageView(props: ChatPageViewProps) {
  const searchParams = await props.searchParams;
  const parityEnabled = process.env.PARITY === 'true' && searchParams.parityFixtures === '1';
  const userIdParam = typeof searchParams.userId === 'string' ? searchParams.userId.trim() : '';
  const initialTargetUserId = userIdParam.length > 0 ? userIdParam : undefined;
  const initialConversations = parityEnabled
    ? getChatParityFixtureConversations()
    : await (async () => {
        try {
          return await getServerChatConversations();
        } catch (error) {
          if (error instanceof ChatUnauthorizedError) {
            redirect('/');
          }
          throw error;
        }
      })();

  return (
    <ChatPageClient
      disableAutoSelect={parityEnabled}
      initialConversations={initialConversations}
      initialTargetUserId={initialTargetUserId}
    />
  );
}
