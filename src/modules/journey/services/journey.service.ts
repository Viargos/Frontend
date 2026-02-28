import type { JourneyDetailDto } from '@/modules/journey/dto/journey-detail.dto';
import type { CreateJourneyRequestDto, JourneyListItemDto } from '@/modules/journey/dto/journey.dto';
import type { JourneyDetail } from '@/modules/journey/types/journey-detail.types';
import type { JourneyCreateInput, JourneyListItem } from '@/modules/journey/types/journey.types';
import { httpClient } from '@/lib/api/http-client';
import { unwrapEnvelope } from '@/modules/common/mappers';
import { mapJourneyDetail } from '@/modules/journey/mappers/journey-detail.mapper';
import { mapCreateJourneyInputToDto, mapJourneyList } from '@/modules/journey/mappers/journey.mapper';

async function parseResponse<T>(path: string, options?: { body?: string; method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' }): Promise<T> {
  const payload = await httpClient.request<unknown>(path, {
    body: options?.body ?? null,
    method: options?.method ?? 'GET',
  });
  return unwrapEnvelope<T>(payload).data;
}

export const journeyService = {
  async create(input: JourneyCreateInput): Promise<JourneyListItem> {
    const dto: CreateJourneyRequestDto = mapCreateJourneyInputToDto(input);
    const created = await parseResponse<JourneyListItemDto>('/journeys', {
      body: JSON.stringify(dto),
      method: 'POST',
    });
    return {
      coverImage: created.coverImage ?? undefined,
      createdAt: created.createdAt,
      description: created.description,
      id: created.id,
      title: created.title,
    };
  },

  async delete(journeyId: string): Promise<void> {
    await parseResponse<unknown>(`/journeys/${journeyId}`, {
      method: 'DELETE',
    });
  },

  async getById(journeyId: string): Promise<JourneyDetail> {
    const dto = await parseResponse<JourneyDetailDto>(`/journeys/${journeyId}`);
    return mapJourneyDetail(dto);
  },

  async list(): Promise<JourneyListItem[]> {
    const items = await parseResponse<JourneyListItemDto[]>('/journeys');
    return mapJourneyList(items);
  },

  async update(journeyId: string, payload: { title?: string; description?: string }): Promise<JourneyDetail> {
    const dto = await parseResponse<JourneyDetailDto>(`/journeys/${journeyId}`, {
      body: JSON.stringify(payload),
      method: 'PATCH',
    });
    return mapJourneyDetail(dto);
  },
};
