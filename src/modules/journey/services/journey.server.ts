import type { JourneyDetailDto } from '@/modules/journey/dto/journey-detail.dto';
import type { JourneyListItemDto } from '@/modules/journey/dto/journey.dto';
import type { JourneyDetail } from '@/modules/journey/types/journey-detail.types';
import type { JourneyListItem } from '@/modules/journey/types/journey.types';
import { cookies } from 'next/headers';
import { unwrapEnvelope } from '@/modules/common/mappers';
import { mapJourneyDetail } from '@/modules/journey/mappers/journey-detail.mapper';
import { mapJourneyList } from '@/modules/journey/mappers/journey.mapper';

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export async function getServerJourneys(): Promise<JourneyListItem[]> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${getBaseUrl()}/api/journeys`, {
      cache: 'no-store',
      credentials: 'include',
      headers: {
        cookie: cookieStore.toString(),
      },
      method: 'GET',
    });

    if (!response.ok) {
      return [];
    }

    const payload: unknown = await response.json().catch(() => null);
    const items = unwrapEnvelope<JourneyListItemDto[]>(payload).data;
    return mapJourneyList(items);
  } catch {
    return [];
  }
}

export async function getServerJourneyById(journeyId: string): Promise<JourneyDetail | null> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${getBaseUrl()}/api/journeys/${journeyId}`, {
      cache: 'no-store',
      credentials: 'include',
      headers: {
        cookie: cookieStore.toString(),
      },
      method: 'GET',
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json().catch(() => null);
    const dto = unwrapEnvelope<JourneyDetailDto>(payload).data;
    return mapJourneyDetail(dto);
  } catch {
    return null;
  }
}
