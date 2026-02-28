import type { CreateJourneyRequestDto, JourneyListItemDto } from '@/modules/journey/dto/journey.dto';
import type { JourneyCreateInput, JourneyListItem } from '@/modules/journey/types/journey.types';

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
    days: input.days.map(day => ({
      date: day.date,
      dayNumber: day.dayNumber,
      notes: day.notes,
      places: day.places.map((place, index) => ({
        address: place.address,
        description: place.description,
        endTime: place.endTime,
        latitude: place.latitude,
        longitude: place.longitude,
        name: place.name,
        order: index,
        startTime: place.startTime,
        type: place.type,
      })),
    })),
    description: input.description,
    title: input.title,
  };
}
