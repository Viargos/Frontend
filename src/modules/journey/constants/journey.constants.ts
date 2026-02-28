import { PlaceType } from '@/modules/journey/enums/place-type.enum';

export const JOURNEY_DEFAULT_TITLE = 'Untitled Journey';

export const JOURNEY_PLACE_TYPE_OPTIONS = [
  PlaceType.STAY,
  PlaceType.ACTIVITY,
  PlaceType.FOOD,
  PlaceType.TRANSPORT,
  PlaceType.NOTE,
] as const;
