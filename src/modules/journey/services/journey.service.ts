import type { JourneyDetailDto } from '@/modules/journey/dto/journey-detail.dto';
import type { CreateJourneyRequestDto, JourneyListItemDto } from '@/modules/journey/dto/journey.dto';
import type { JourneyDetail } from '@/modules/journey/types/journey-detail.types';
import type { JourneyCreateInput, JourneyListItem } from '@/modules/journey/types/journey.types';
import type { DashboardPostDto } from '@/modules/dashboard/dto/dashboard.dto';
import type { DashboardPost } from '@/modules/dashboard/types/dashboard.types';
import { httpClient } from '@/lib/api/http-client';
import { unwrapEnvelope } from '@/modules/common/mappers';
import { mapJourneyDetail } from '@/modules/journey/mappers/journey-detail.mapper';
import { mapCreateJourneyInputToDto, mapJourneyList } from '@/modules/journey/mappers/journey.mapper';
import { mapPost } from '@/modules/dashboard/mappers/dashboard.mapper';

async function parseResponse<T>(path: string, options?: { body?: string; method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' }): Promise<T> {
  const payload = await httpClient.request<unknown>(path, {
    body: options?.body ?? null,
    method: options?.method ?? 'GET',
  });
  return unwrapEnvelope<T>(payload).data;
}

type JourneyUpdatePayload = {
  coverImage?: string;
  days?: JourneyCreateInput['days'];
  description?: string;
  title?: string;
};

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

  async update(journeyId: string, payload: JourneyUpdatePayload): Promise<JourneyDetail> {
    const body = payload.days
      ? JSON.stringify(mapCreateJourneyInputToDto({
          coverImage: payload.coverImage,
          days: payload.days,
          description: payload.description,
          title: payload.title ?? '',
        }))
      : JSON.stringify(payload);

    const dto = await parseResponse<JourneyDetailDto>(`/journeys/${journeyId}`, {
      body,
      method: 'PATCH',
    });
    return mapJourneyDetail(dto);
  },

  async uploadCoverImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await httpClient.request<unknown>('/journeys/cover-image', {
      body: formData,
      method: 'POST',
    });

    const raw = unwrapEnvelope<{ imageUrl: string }>(response).data;
    return raw.imageUrl;
  },

  async uploadPlaceMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await httpClient.request<unknown>('/journeys/place-media', {
      body: formData,
      method: 'POST',
    });

    const raw = unwrapEnvelope<{ imageUrl: string }>(response).data;
    return raw.imageUrl;
  },

  async getPosts(journeyId: string): Promise<DashboardPost[]> {
    const dtos = await parseResponse<DashboardPostDto[]>(`/posts/journey/${journeyId}`);
    return dtos.map(mapPost);
  },
};
