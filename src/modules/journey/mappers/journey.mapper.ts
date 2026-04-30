import type { CreateJourneyRequestDto, JourneyListItemDto } from '@/modules/journey/dto/journey.dto';
import type { JourneyCreateInput, JourneyListItem } from '@/modules/journey/types/journey.types';

function normalizeOptionalText(value?: string): string | undefined {
  const trimmedValue = value?.trim();
  return trimmedValue || undefined;
}

export function mapJourneyListItem(dto: JourneyListItemDto): JourneyListItem {
  return {
    coverImage: dto.coverImage ?? undefined,
    createdAt: dto.createdAt,
    days: dto.days?.map(day => ({
      date: day.date,
      dayNumber: day.dayNumber,
      id: day.id,
      places: day.places?.map(place => ({
        address: place.address,
        id: place.id,
        name: place.name,
      })),
    })),
    description: dto.description,
    id: dto.id,
    title: dto.title,
    updatedAt: dto.updatedAt,
    user: dto.user?.username
      ? {
          email: dto.user.email,
          id: dto.user.id,
          username: dto.user.username,
        }
      : undefined,
  };
}

export function mapJourneyList(dtos: JourneyListItemDto[]): JourneyListItem[] {
  return dtos.map(mapJourneyListItem);
}

export function mapCreateJourneyInputToDto(input: JourneyCreateInput): CreateJourneyRequestDto {
  return {
    coverImage: input.coverImage,
    days: input.days.map(day => ({
      date: day.date,
      dayNumber: day.dayNumber,
      notes: day.notes,
      places: day.places.map((place, index) => ({
        address: place.address,
        bookingEndDayNumber: place.bookingEndDayNumber,
        bookingGroupId: place.bookingGroupId,
        bookingStartDayNumber: place.bookingStartDayNumber,
        description: normalizeOptionalText(place.description),
        endTime: normalizeOptionalText(place.endTime),
        latitude: place.latitude,
        longitude: place.longitude,
        media: place.media.map((media, mediaIndex) => ({
          order: media.order ?? mediaIndex,
          thumbnailUrl: media.thumbnailUrl,
          type: media.type,
          url: media.url ?? media.previewUrl,
        })),
        name: place.name,
        order: place.order ?? index,
        startTime: normalizeOptionalText(place.startTime),
        type: place.type,
      })),
    })),
    description: input.description,
    title: input.title,
  };
}
