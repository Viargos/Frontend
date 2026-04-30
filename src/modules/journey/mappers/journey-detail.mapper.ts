import type { JourneyDetailDto } from '@/modules/journey/dto/journey-detail.dto';
import type { JourneyDetail } from '@/modules/journey/types/journey-detail.types';

function toNumber(value: number | string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function mapJourneyDetail(dto: JourneyDetailDto): JourneyDetail {
  return {
    coverImage: dto.coverImage,
    createdAt: dto.createdAt,
    days: dto.days.map(day => ({
      date: day.date,
      dayNumber: day.dayNumber,
      id: day.id,
      notes: day.notes,
      places: day.places.map(place => ({
        address: place.address,
        bookingEndDayNumber: place.bookingEndDayNumber,
        bookingGroupId: place.bookingGroupId,
        bookingStartDayNumber: place.bookingStartDayNumber,
        description: place.description,
        endTime: place.endTime,
        id: place.id,
        latitude: toNumber(place.latitude),
        longitude: toNumber(place.longitude),
        media: (place.media ?? []).map(media => ({
          id: media.id,
          order: media.order,
          thumbnailUrl: media.thumbnailUrl,
          type: media.type.toLowerCase() === 'video' ? 'video' : 'image',
          url: media.url,
        })),
        name: place.name,
        startTime: place.startTime,
        type: place.type,
      })),
    })),
    description: dto.description,
    id: dto.id,
    title: dto.title,
    updatedAt: dto.updatedAt,
  };
}
