'use client';

import type { ChangeEvent } from 'react';
import type { JourneyDetail } from '@/modules/journey/types/journey-detail.types';
import type { JourneyDayInput, JourneyPlaceInput } from '@/modules/journey/types/journey.types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DatePickerField, TimePickerField } from '@/modules/common/components';
import {
  CarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  HotelIcon,
  ImageIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  TreeIcon,
  UtensilsIcon,
  XIcon,
} from '@/modules/common/icons';
import { PlaceType } from '@/modules/journey/enums/place-type.enum';
import { createClientId } from '@/modules/journey/helpers/journey.helper';
import { useJourneyActions, useJourneyPlannerForm } from '@/modules/journey/hooks';
import { useGoogleMapsLoader } from '@/modules/journey/infra/map-adapter';
import { JourneyCreateMapPanel } from './JourneyCreateMapPanel';

type JourneyPlannerFormProps = {
  initialJourney?: JourneyDetail;
  mode: 'create' | 'edit';
};

type ReviewModalProps = {
  coverImageSrc: string;
  days: JourneyDayInput[];
  endDate: string;
  isOpen: boolean;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onConfirm: () => void;
  startDate: string;
  subtitle: string;
  title: string;
};

type PlaceLocationFieldProps = {
  isPlacesReady: boolean;
  onAddressChange: (value: string) => void;
  onLocationSelect: (value: { address: string; latitude?: number; longitude?: number; name?: string }) => void;
  place: JourneyPlaceInput;
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_COVER_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PLACE_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const PLACE_TYPE_CONFIG: Array<{
  description: string;
  icon: JSX.Element;
  statLabel: string;
  title: string;
  type: PlaceType | 'NOTES';
}> = [
  {
    description: 'Where the traveler stayed, checked in, and checked out.',
    icon: <HotelIcon className="h-5 w-5" />,
    statLabel: 'Linked stays',
    title: 'Stay',
    type: PlaceType.STAY,
  },
  {
    description: 'Highlights, attractions, and experiences for the day.',
    icon: <TreeIcon className="h-5 w-5" />,
    statLabel: 'Places',
    title: 'Places to go',
    type: PlaceType.ACTIVITY,
  },
  {
    description: 'Restaurants, cafes, and memorable food stops.',
    icon: <UtensilsIcon className="h-5 w-5" />,
    statLabel: 'Food stops',
    title: 'Food',
    type: PlaceType.FOOD,
  },
  {
    description: 'Flights, trains, cabs, and other transport details.',
    icon: <CarIcon className="h-5 w-5" />,
    statLabel: 'Transport',
    title: 'Transport',
    type: PlaceType.TRANSPORT,
  },
  {
    description: 'Day-level notes, reminders, and context.',
    icon: <FileTextIcon className="h-5 w-5" />,
    statLabel: 'Notes',
    title: 'Notes',
    type: 'NOTES',
  },
];

function formatDisplayDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  });
}

function formatRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startDate} - ${endDate}`;
  }

  return `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function validateCoverImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, WebP, or GIF images are allowed for the journey cover.';
  }

  if (file.size > MAX_COVER_FILE_SIZE_BYTES) {
    return 'Journey cover image must be smaller than 10 MB.';
  }

  return null;
}

function validatePlaceMedia(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, WebP, or GIF images are allowed for place photos.';
  }

  if (file.size > MAX_PLACE_IMAGE_SIZE_BYTES) {
    return 'Each place photo must be smaller than 10 MB.';
  }

  return null;
}

function getTimeLabels(type: PlaceType): { end: string; start: string } {
  if (type === PlaceType.STAY) {
    return {
      end: 'Checkout time',
      start: 'Check-in time',
    };
  }

  return {
    end: 'End time',
    start: 'Start time',
  };
}

function ReviewModal(props: ReviewModalProps) {
  const {
    coverImageSrc,
    days,
    endDate,
    isOpen,
    isSubmitting,
    mode,
    onClose,
    onConfirm,
    startDate,
    subtitle,
    title,
  } = props;

  const totalPlaces = days.reduce((sum, day) => sum + day.places.length, 0);
  const totalPhotos = days.reduce((sum, day) => sum + day.places.reduce((placeSum, place) => placeSum + place.media.length, 0), 0);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="journey-planner-card max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] border shadow-2xl">
        <div className="relative h-56">
          <Image alt="Journey cover preview" className="object-cover" fill sizes="1200px" src={coverImageSrc} unoptimized />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <button
            className="journey-planner-ghost-button absolute top-4 right-4 rounded-full border p-2 transition-colors"
            onClick={onClose}
            type="button"
          >
            <XIcon className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-xs font-semibold tracking-[0.22em] text-white/70 uppercase">
              {mode === 'create' ? 'Review new journey' : 'Review journey updates'}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title || 'Untitled journey'}</h2>
            {subtitle
              ? <p className="mt-2 max-w-3xl text-sm text-white/85">{subtitle}</p>
              : null}
          </div>
        </div>

        <div className="journey-planner-shell grid gap-6 overflow-y-auto p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {days.map(day => (
              <div className="journey-planner-card rounded-3xl border p-5" key={day.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="journey-planner-label text-xs font-semibold tracking-[0.18em] uppercase">
                      Day
                      {day.dayNumber}
                    </p>
                    <h3 className="journey-planner-title mt-1 text-lg font-semibold">{formatDisplayDate(day.date)}</h3>
                  </div>
                  <span className="journey-planner-subcard rounded-full border px-3 py-1 text-xs font-medium">
                    {day.places.length}
                    {' '}
                    items
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {day.places.length > 0
                    ? day.places.map(place => (
                        <div className="journey-planner-subcard rounded-2xl border px-4 py-3" key={place.id}>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="journey-planner-title text-sm font-semibold">{place.name || 'Untitled item'}</p>
                              <p className="journey-planner-copy mt-1 text-xs">{place.address || 'No location added'}</p>
                            </div>
                            <span className="journey-planner-muted text-xs">
                              {place.media.length}
                              {' '}
                              photos
                            </span>
                          </div>
                        </div>
                      ))
                    : <p className="journey-planner-copy text-sm">No items planned for this day yet.</p>}

                  {day.notes
                    ? (
                        <div className="journey-planner-subcard rounded-2xl border px-4 py-3">
                          <p className="journey-planner-title text-sm font-medium">Notes</p>
                          <p className="journey-planner-copy mt-2 text-sm">{day.notes}</p>
                        </div>
                      )
                    : null}
                </div>
              </div>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="journey-planner-card rounded-3xl border p-5">
              <p className="journey-planner-label text-xs font-semibold tracking-[0.18em] uppercase">Trip range</p>
              <p className="journey-planner-title mt-2 text-lg font-semibold">{formatRange(startDate, endDate)}</p>
            </div>
            <div className="journey-planner-card rounded-3xl border p-5">
              <p className="journey-planner-label text-xs font-semibold tracking-[0.18em] uppercase">Summary</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="journey-planner-subcard rounded-2xl p-3 text-center">
                  <p className="journey-planner-title text-2xl font-semibold">{days.length}</p>
                  <p className="journey-planner-copy text-xs">Days</p>
                </div>
                <div className="journey-planner-subcard rounded-2xl p-3 text-center">
                  <p className="journey-planner-title text-2xl font-semibold">{totalPlaces}</p>
                  <p className="journey-planner-copy text-xs">Items</p>
                </div>
                <div className="journey-planner-subcard rounded-2xl p-3 text-center">
                  <p className="journey-planner-title text-2xl font-semibold">{totalPhotos}</p>
                  <p className="journey-planner-copy text-xs">Photos</p>
                </div>
              </div>
            </div>
            <div className="journey-planner-card rounded-3xl border p-5">
              <button
                className="journey-planner-primary-button w-full rounded-2xl px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                onClick={onConfirm}
                type="button"
              >
                {isSubmitting ? (mode === 'create' ? 'Creating journey...' : 'Saving journey...') : (mode === 'create' ? 'Post journey' : 'Save changes')}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PlaceLocationField(props: PlaceLocationFieldProps) {
  const {
    isPlacesReady,
    onAddressChange,
    onLocationSelect,
    place,
  } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const latestPlaceName = useRef(place.name);

  useEffect(() => {
    latestPlaceName.current = place.name;
  }, [place.name]);

  useEffect(() => {
    if (!isPlacesReady || typeof window === 'undefined') {
      return;
    }

    const input = inputRef.current;
    const mapsApi = window.google?.maps;

    if (!input || !mapsApi?.places?.Autocomplete) {
      return;
    }

    const autocomplete = new mapsApi.places.Autocomplete(input, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['establishment', 'geocode'],
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const selectedPlace = autocomplete.getPlace();
      const location = selectedPlace.geometry?.location;
      const address = selectedPlace.formatted_address ?? selectedPlace.name ?? input.value;

      onLocationSelect({
        address,
        latitude: location?.lat(),
        longitude: location?.lng(),
        name: latestPlaceName.current ? undefined : selectedPlace.name,
      });
    });

    return () => {
      mapsApi.event.removeListener(listener);
      mapsApi.event.clearInstanceListeners(autocomplete);
    };
  }, [isPlacesReady, onLocationSelect]);

  return (
    <div className="relative">
      <input
        autoComplete="off"
        className="journey-planner-field w-full rounded-2xl border px-4 py-3 pr-12 text-sm transition outline-none"
        onChange={event => onAddressChange(event.target.value)}
        placeholder="Search or type the place address"
        ref={inputRef}
        type="text"
        value={place.address ?? ''}
      />
      <span className="journey-planner-muted pointer-events-none absolute inset-y-0 right-4 flex items-center">
        <MapPinIcon className="h-4 w-4" />
      </span>
    </div>
  );
}

export function JourneyPlannerForm(props: JourneyPlannerFormProps) {
  const { initialJourney, mode } = props;
  const router = useRouter();
  const notesRef = useRef<HTMLTextAreaElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const dayNavigatorRef = useRef<HTMLDivElement | null>(null);
  const placeEditorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { createJourney, isCreatingJourney, isUpdatingJourney, isUploadingJourneyCoverImage, isUploadingJourneyPlaceMedia, updateJourney, uploadJourneyCoverImage, uploadJourneyPlaceMedia } = useJourneyActions();
  const mapLoader = useGoogleMapsLoader('journey-planner-map-loader');
  const {
    activeDayOptions,
    addPlace,
    error,
    removePlace,
    setCoverImage,
    setDateRange,
    setDescription,
    setError,
    setTitle,
    updateBookingRange,
    updateDayNotes,
    updatePlaceField,
    updatePlaceMedia,
    validate,
    values,
  } = useJourneyPlannerForm(initialJourney);

  const [activeDayId, setActiveDayId] = useState(values.days[0]?.id ?? '');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(initialJourney?.coverImage ?? null);
  const [expandedPlaces, setExpandedPlaces] = useState<Record<string, boolean>>({});
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [pendingScrollPlaceId, setPendingScrollPlaceId] = useState<string | null>(null);

  useEffect(() => {
    const nextActiveDayId = values.days.some(day => day.id === activeDayId)
      ? activeDayId
      : values.days[0]?.id;

    if (!nextActiveDayId || !dayNavigatorRef.current) {
      return;
    }

    const activeDayButton = dayNavigatorRef.current.querySelector<HTMLElement>(`[data-day-id="${nextActiveDayId}"]`);
    activeDayButton?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeDayId, values.days]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  const activeDay = values.days.find(day => day.id === activeDayId) ?? values.days[0];

  const groupedPlaces = useMemo(() => {
    const base = {
      [PlaceType.ACTIVITY]: [] as JourneyPlaceInput[],
      [PlaceType.FOOD]: [] as JourneyPlaceInput[],
      [PlaceType.STAY]: [] as JourneyPlaceInput[],
      [PlaceType.TRANSPORT]: [] as JourneyPlaceInput[],
    };

    if (!activeDay) {
      return base;
    }

    activeDay.places.forEach((place) => {
      if (place.type === PlaceType.NOTE) {
        return;
      }

      base[place.type].push(place);
    });

    return base;
  }, [activeDay]);

  const activeDayCategorySections = [
    { items: groupedPlaces[PlaceType.STAY], title: 'Stay', type: PlaceType.STAY },
    { items: groupedPlaces[PlaceType.ACTIVITY], title: 'Places to go', type: PlaceType.ACTIVITY },
    { items: groupedPlaces[PlaceType.FOOD], title: 'Food', type: PlaceType.FOOD },
    { items: groupedPlaces[PlaceType.TRANSPORT], title: 'Transport', type: PlaceType.TRANSPORT },
  ];
  const visibleActiveDaySections = activeDayCategorySections.filter(section => section.items.length > 0);
  const activeDayPhotoCount = activeDay?.places.reduce((sum, place) => sum + place.media.length, 0) ?? 0;
  const activeDayLinkedStayCount = activeDay?.places.filter(place => (place.bookingEndDayNumber ?? activeDay.dayNumber) > activeDay.dayNumber || (place.bookingStartDayNumber ?? activeDay.dayNumber) < activeDay.dayNumber).length ?? 0;

  useEffect(() => {
    if (!pendingScrollPlaceId) {
      return;
    }

    const placeEditor = placeEditorRefs.current[pendingScrollPlaceId];
    if (!placeEditor) {
      return;
    }

    window.requestAnimationFrame(() => {
      placeEditor.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setPendingScrollPlaceId(null);
    });
  }, [pendingScrollPlaceId, values.days]);

  const isSubmitting = isCreatingJourney || isUpdatingJourney || isUploadingJourneyCoverImage || isUploadingJourneyPlaceMedia;

  const totalPhotos = useMemo(
    () => values.days.reduce((sum, day) => sum + day.places.reduce((placeSum, place) => placeSum + place.media.length, 0), 0),
    [values.days],
  );
  const isPlacesReady = mapLoader.hasApiKey && mapLoader.isLoaded && !mapLoader.loadError;

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateCoverImage(file);
    if (validationError) {
      setError(validationError);
      event.target.value = '';
      return;
    }

    setError(null);
    setCoverImage(undefined);
    setCoverImageFile(file);

    if (coverPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    setCoverPreviewUrl(URL.createObjectURL(file));
    event.target.value = '';
  };

  const handlePlaceMediaChange = (dayId: string, placeId: string, event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) {
      return;
    }

    const firstError = selectedFiles.map(validatePlaceMedia).find(Boolean);
    if (firstError) {
      setError(firstError);
      event.target.value = '';
      return;
    }

    const targetPlace = values.days
      .find(day => day.id === dayId)
      ?.places
      .find(place => place.id === placeId);

    if (!targetPlace) {
      event.target.value = '';
      return;
    }

    const nextMedia = [
      ...targetPlace.media,
      ...selectedFiles.map((file, index) => ({
        file,
        id: createClientId('media'),
        order: targetPlace.media.length + index,
        previewUrl: URL.createObjectURL(file),
        type: 'image' as const,
      })),
    ];

    setError(null);
    updatePlaceMedia(dayId, placeId, nextMedia);
    event.target.value = '';
  };

  const handleRemovePlaceMedia = (dayId: string, placeId: string, mediaId: string) => {
    const targetPlace = values.days
      .find(day => day.id === dayId)
      ?.places
      .find(place => place.id === placeId);

    if (!targetPlace) {
      return;
    }

    const nextMedia = targetPlace.media.filter(item => item.id !== mediaId);
    updatePlaceMedia(dayId, placeId, nextMedia);
  };

  const handleAddCategory = (type: PlaceType | 'NOTES') => {
    if (!activeDay) {
      return;
    }

    if (type === 'NOTES') {
      notesRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      notesRef.current?.focus({ preventScroll: true });
      return;
    }

    const nextPlaceId = addPlace(activeDay.id, type);
    setExpandedPlaces(prev => ({ ...prev, [nextPlaceId]: true }));
    setPendingScrollPlaceId(nextPlaceId);
  };

  const scrollDayNavigator = (direction: 'left' | 'right') => {
    dayNavigatorRef.current?.scrollBy({
      behavior: 'smooth',
      left: direction === 'left' ? -320 : 320,
    });
  };

  const uploadAssetsForSubmit = async () => {
    const uploadedPlaceMedia = new Map<string, string>();

    const preparedDays = await Promise.all(values.days.map(async day => ({
      ...day,
      places: await Promise.all(day.places.map(async place => ({
        ...place,
        media: await Promise.all(place.media.map(async (mediaItem, mediaIndex) => {
          if (mediaItem.url) {
            return {
              ...mediaItem,
              order: mediaItem.order ?? mediaIndex,
              url: mediaItem.url,
            };
          }

          if (!mediaItem.file) {
            return {
              ...mediaItem,
              order: mediaItem.order ?? mediaIndex,
              url: mediaItem.previewUrl,
            };
          }

          const cachedUrl = uploadedPlaceMedia.get(mediaItem.id);
          if (cachedUrl) {
            return {
              ...mediaItem,
              order: mediaItem.order ?? mediaIndex,
              url: cachedUrl,
            };
          }

          const uploadedUrl = await uploadJourneyPlaceMedia(mediaItem.file);
          uploadedPlaceMedia.set(mediaItem.id, uploadedUrl);

          return {
            ...mediaItem,
            order: mediaItem.order ?? mediaIndex,
            url: uploadedUrl,
          };
        })),
      }))),
    })));

    let uploadedCoverUrl = values.coverImage;
    if (coverImageFile) {
      uploadedCoverUrl = await uploadJourneyCoverImage(coverImageFile);
    }

    return {
      coverImage: uploadedCoverUrl,
      days: preparedDays,
      description: values.description,
      title: values.title.trim(),
    };
  };

  const handleOpenReview = () => {
    if (!validate()) {
      return;
    }

    setIsReviewOpen(true);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      const payload = await uploadAssetsForSubmit();

      if (mode === 'create') {
        const createdJourney = await createJourney(payload);
        router.push(`/journey/${createdJourney.id}`);
        return;
      }

      if (!initialJourney) {
        return;
      }

      const updatedJourney = await updateJourney(initialJourney.id, payload);
      router.push(`/journey/${updatedJourney.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to save journey');
    }
  };

  const renderPlaceEditor = (place: JourneyPlaceInput) => {
    const timeLabels = getTimeLabels(place.type);
    const isExpanded = expandedPlaces[place.id] ?? true;
    const bookingStart = place.bookingStartDayNumber ?? activeDay?.dayNumber ?? 1;
    const bookingEnd = place.bookingEndDayNumber ?? activeDay?.dayNumber ?? 1;
    const typeConfig = PLACE_TYPE_CONFIG.find(config => config.type === place.type);

    return (
      <div
        className="journey-planner-card scroll-mt-6 rounded-3xl border"
        key={place.id}
        ref={(node) => {
          placeEditorRefs.current[place.id] = node;
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <button
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            onClick={() => setExpandedPlaces(prev => ({ ...prev, [place.id]: !isExpanded }))}
            type="button"
          >
            <div className="journey-planner-icon-tile flex h-10 w-10 items-center justify-center rounded-2xl">
              {typeConfig?.icon}
            </div>
            <div className="min-w-0">
              <p className="journey-planner-label text-xs font-semibold tracking-[0.16em] uppercase">{typeConfig?.title}</p>
              <p className="journey-planner-title truncate text-base font-semibold">{place.name || `Untitled ${typeConfig?.title.toLowerCase()}`}</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              onClick={() => removePlace(activeDay!.id, place.id)}
              type="button"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isExpanded
          ? (
              <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="journey-planner-copy mb-2 block text-sm font-medium" htmlFor={`${place.id}-name`}>Name</label>
                  <input
                    className="journey-planner-field w-full rounded-2xl border px-4 py-3 text-sm transition outline-none"
                    id={`${place.id}-name`}
                    onChange={event => updatePlaceField(activeDay!.id, place.id, 'name', event.target.value)}
                    placeholder={`Enter ${typeConfig?.title.toLowerCase()} name`}
                    type="text"
                    value={place.name}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="journey-planner-copy mb-2 block text-sm font-medium" htmlFor={`${place.id}-description`}>Description</label>
                  <textarea
                    className="journey-planner-field min-h-24 w-full rounded-2xl border px-4 py-3 text-sm transition outline-none"
                    id={`${place.id}-description`}
                    onChange={event => updatePlaceField(activeDay!.id, place.id, 'description', event.target.value)}
                    placeholder={`Describe this ${typeConfig?.title.toLowerCase()} stop`}
                    value={place.description ?? ''}
                  />
                </div>

                <div>
                  <label className="journey-planner-copy mb-2 block text-sm font-medium" htmlFor={`${place.id}-start-time`}>{timeLabels.start}</label>
                  <TimePickerField
                    className="journey-planner-field rounded-2xl"
                    description={`Set the ${timeLabels.start.toLowerCase()} for this ${typeConfig?.title.toLowerCase()}.`}
                    id={`${place.id}-start-time`}
                    onChange={nextValue => updatePlaceField(activeDay!.id, place.id, 'startTime', nextValue)}
                    placeholder={timeLabels.start}
                    title={timeLabels.start}
                    value={place.startTime ?? ''}
                  />
                </div>

                <div>
                  <label className="journey-planner-copy mb-2 block text-sm font-medium" htmlFor={`${place.id}-end-time`}>{timeLabels.end}</label>
                  <TimePickerField
                    className="journey-planner-field rounded-2xl"
                    description={`Set the ${timeLabels.end.toLowerCase()} for this ${typeConfig?.title.toLowerCase()}.`}
                    id={`${place.id}-end-time`}
                    onChange={nextValue => updatePlaceField(activeDay!.id, place.id, 'endTime', nextValue)}
                    placeholder={timeLabels.end}
                    title={timeLabels.end}
                    value={place.endTime ?? ''}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="journey-planner-copy mb-2 block text-sm font-medium" htmlFor={`${place.id}-address`}>Location</label>
                  <PlaceLocationField
                    isPlacesReady={isPlacesReady}
                    onAddressChange={value => updatePlaceField(activeDay!.id, place.id, 'address', value)}
                    onLocationSelect={(location) => {
                      updatePlaceField(activeDay!.id, place.id, 'address', location.address);

                      if (location.name) {
                        updatePlaceField(activeDay!.id, place.id, 'name', location.name);
                      }

                      if (location.latitude !== undefined) {
                        updatePlaceField(activeDay!.id, place.id, 'latitude', location.latitude);
                      }

                      if (location.longitude !== undefined) {
                        updatePlaceField(activeDay!.id, place.id, 'longitude', location.longitude);
                      }
                    }}
                    place={place}
                  />
                </div>

                <div>
                  <label className="journey-planner-copy mb-2 block text-sm font-medium" htmlFor={`${place.id}-booking-start`}>Booked from day</label>
                  <select
                    className="journey-planner-field w-full rounded-2xl border px-4 py-3 text-sm transition outline-none"
                    id={`${place.id}-booking-start`}
                    onChange={event => updateBookingRange(activeDay!.id, place.id, Number(event.target.value), bookingEnd)}
                    value={bookingStart}
                  >
                    {activeDayOptions.map(option => (
                      <option key={option.id} value={option.dayNumber}>{`Day ${option.dayNumber}`}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="journey-planner-copy mb-2 block text-sm font-medium" htmlFor={`${place.id}-booking-end`}>Booked until day</label>
                  <select
                    className="journey-planner-field w-full rounded-2xl border px-4 py-3 text-sm transition outline-none"
                    id={`${place.id}-booking-end`}
                    onChange={event => updateBookingRange(activeDay!.id, place.id, bookingStart, Number(event.target.value))}
                    value={bookingEnd}
                  >
                    {activeDayOptions.map(option => (
                      <option key={option.id} value={option.dayNumber}>{`Day ${option.dayNumber}`}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="journey-planner-empty-state flex flex-col gap-3 rounded-3xl border border-dashed p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="journey-planner-title text-sm font-semibold">Photos</p>
                        <p className="journey-planner-copy text-sm">Add multiple photos for this stop.</p>
                      </div>
                      <label className="journey-planner-ghost-button inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition">
                        <ImageIcon className="h-4 w-4" />
                        Add photos
                        <input
                          accept="image/*"
                          className="hidden"
                          multiple
                          onChange={event => handlePlaceMediaChange(activeDay!.id, place.id, event)}
                          type="file"
                        />
                      </label>
                    </div>

                    {place.media.length > 0
                      ? (
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {place.media.map(mediaItem => (
                              <div className="journey-planner-card group relative overflow-hidden rounded-2xl border" key={mediaItem.id}>
                                <div className="relative h-28">
                                  <Image alt="Place media preview" className="object-cover" fill sizes="200px" src={mediaItem.previewUrl} unoptimized />
                                </div>
                                <button
                                  className="absolute top-2 right-2 rounded-full bg-slate-950/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                                  onClick={() => handleRemovePlaceMedia(activeDay!.id, place.id, mediaItem.id)}
                                  type="button"
                                >
                                  <XIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )
                      : <p className="journey-planner-copy text-sm">No photos added yet.</p>}
                  </div>
                </div>
              </div>
            )
          : null}
      </div>
    );
  };

  return (
    <div className="journey-planner-shell max-w-none flex-1 p-4 sm:p-6">
      <div className="space-y-6">
        <section className="journey-planner-card overflow-hidden rounded-[32px] border">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.3fr)_420px]">
            <div className="relative min-h-[360px] overflow-hidden bg-slate-950">
              <Image
                alt="Journey cover"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                src={coverPreviewUrl ?? '/london.png'}
                unoptimized
              />
              <div className="absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-950/55 to-slate-950/15" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white sm:p-8">
                <p className="text-xs font-semibold tracking-[0.24em] text-white/70 uppercase">
                  {mode === 'create' ? 'Create a journey' : 'Edit journey'}
                </p>
                <input
                  className="mt-3 w-full max-w-3xl bg-transparent text-3xl font-semibold tracking-tight text-white outline-none placeholder:text-white/55 sm:text-4xl"
                  onChange={event => setTitle(event.target.value)}
                  placeholder="Journey title"
                  type="text"
                  value={values.title}
                />
                <input
                  className="mt-3 w-full max-w-2xl bg-transparent text-sm text-white/90 outline-none placeholder:text-white/55 sm:text-base"
                  onChange={event => setDescription(event.target.value)}
                  placeholder="Add a subtitle or short summary of the trip"
                  type="text"
                  value={values.description ?? ''}
                />

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/18"
                    onClick={() => coverInputRef.current?.click()}
                    type="button"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {coverPreviewUrl ? 'Change cover' : 'Upload cover'}
                  </button>
                </div>

                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                  ref={coverInputRef}
                  type="file"
                />
              </div>
            </div>

            <div className="journey-planner-card border-t p-6 lg:border-t-0 lg:border-l">
              <p className="journey-planner-label text-xs font-semibold tracking-[0.22em] uppercase">Journey setup</p>
              <h2 className="journey-planner-title mt-2 text-2xl font-semibold tracking-tight">Choose the travel window first</h2>
              <p className="journey-planner-copy mt-2 text-sm leading-6">
                Start with the trip dates, then plan each day with stays, food, transport, activities, notes, and photos.
              </p>

              <div className="mt-6 grid gap-4">
                <div>
                  <label className="journey-planner-copy mb-2 block text-sm font-medium" htmlFor="journey-start-date">Start date</label>
                  <DatePickerField
                    className="journey-planner-field rounded-2xl"
                    description="Choose when this journey begins."
                    id="journey-start-date"
                    max={values.endDate || undefined}
                    onChange={nextValue => setDateRange(nextValue, values.endDate)}
                    title="Select start date"
                    value={values.startDate}
                  />
                </div>

                <div>
                  <label className="journey-planner-copy mb-2 block text-sm font-medium" htmlFor="journey-end-date">End date</label>
                  <DatePickerField
                    className="journey-planner-field rounded-2xl"
                    description="Choose when this journey wraps up."
                    id="journey-end-date"
                    min={values.startDate || undefined}
                    onChange={nextValue => setDateRange(values.startDate, nextValue)}
                    title="Select end date"
                    value={values.endDate}
                  />
                </div>

                <div className="journey-planner-subcard rounded-3xl border p-4">
                  <p className="journey-planner-label text-xs font-semibold tracking-[0.18em] uppercase">Current range</p>
                  <p className="journey-planner-title mt-2 text-lg font-semibold">{formatRange(values.startDate, values.endDate)}</p>
                  <p className="journey-planner-copy mt-1 text-sm">
                    {values.days.length}
                    {' '}
                    generated day
                    {values.days.length === 1 ? '' : 's'}
                    {' '}
                    ready for planning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error
          ? (
              <div className="journey-planner-danger rounded-2xl border px-4 py-3 text-sm">
                {error}
              </div>
            )
          : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
          <div className="space-y-6">
            <section className="journey-planner-card rounded-[28px] border p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="journey-planner-label text-xs font-semibold tracking-[0.22em] uppercase">Day navigator</p>
                  <h2 className="journey-planner-title mt-2 text-2xl font-semibold tracking-tight">Build the trip day by day</h2>
                  <p className="journey-planner-copy mt-2 text-sm">Select a day, add the places, and keep multi-day bookings linked automatically.</p>
                </div>
                <button
                  className="journey-planner-primary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  onClick={handleOpenReview}
                  type="button"
                >
                  Review
                </button>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  aria-label="Scroll days left"
                  className="journey-planner-ghost-button hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors lg:inline-flex"
                  onClick={() => scrollDayNavigator('left')}
                  type="button"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2" ref={dayNavigatorRef}>
                    {values.days.map(day => (
                      <button
                        className={`journey-day-chip min-w-[180px] shrink-0 rounded-3xl border px-4 py-3 text-left transition-all ${day.id === activeDay?.id ? 'journey-day-chip-active' : ''}`}
                        data-day-id={day.id}
                        key={day.id}
                        onClick={() => setActiveDayId(day.id)}
                        type="button"
                      >
                        <p className="journey-planner-label text-xs font-semibold tracking-[0.18em] uppercase">
                          Day
                          {day.dayNumber}
                        </p>
                        <p className="mt-2 text-sm font-semibold">{formatDisplayDate(day.date)}</p>
                        <p className="journey-planner-copy mt-1 text-xs">
                          {day.places.length}
                          {' '}
                          items
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  aria-label="Scroll days right"
                  className="journey-planner-ghost-button hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors lg:inline-flex"
                  onClick={() => scrollDayNavigator('right')}
                  type="button"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </section>

            {activeDay
              ? (
                  <>
                    <section className="journey-planner-card rounded-[28px] border p-5 sm:p-8">
                      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                        <div>
                          <p className="journey-planner-label text-xs font-semibold tracking-[0.22em] uppercase">Active day</p>
                          <h2 className="journey-planner-title mt-2 text-2xl font-semibold tracking-tight">{formatDisplayDate(activeDay.date)}</h2>
                          <p className="journey-planner-copy mt-2 text-sm">Add each part of the day as the trip unfolded.</p>
                        </div>

                        <div className="grid min-w-full gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                          <div className="journey-planner-metric rounded-2xl border px-4 py-3">
                            <p className="journey-planner-label text-xs font-semibold tracking-wide uppercase">Items</p>
                            <p className="journey-planner-title mt-1 text-xl font-semibold">{activeDay.places.length}</p>
                          </div>
                          <div className="journey-planner-metric rounded-2xl border px-4 py-3">
                            <p className="journey-planner-label text-xs font-semibold tracking-wide uppercase">Photos</p>
                            <p className="journey-planner-title mt-1 text-xl font-semibold">{activeDayPhotoCount}</p>
                          </div>
                          <div className="journey-planner-metric rounded-2xl border px-4 py-3">
                            <p className="journey-planner-label text-xs font-semibold tracking-wide uppercase">Linked stays</p>
                            <p className="journey-planner-title mt-1 text-xl font-semibold">{activeDayLinkedStayCount}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        {PLACE_TYPE_CONFIG.map(item => (
                          <button
                            className="journey-planner-action-card group flex w-full items-center gap-4 rounded-3xl border px-4 py-4 text-left transition-all hover:-translate-y-0.5 sm:gap-6 sm:px-6 sm:py-5"
                            key={item.title}
                            onClick={() => handleAddCategory(item.type)}
                            type="button"
                          >
                            <div className="journey-planner-icon-tile flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl sm:h-[72px] sm:w-[72px]">
                              {item.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="journey-planner-title text-lg font-semibold">{item.title}</h3>
                              <p className="journey-planner-copy mt-1 text-sm leading-6 sm:text-base">{item.description}</p>
                            </div>
                            <div className="journey-planner-accent-link ml-auto hidden shrink-0 items-center gap-3 text-sm font-semibold sm:inline-flex sm:text-base">
                              {item.type === 'NOTES' ? <FileTextIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                              {item.type === 'NOTES' ? 'Open notes' : 'Add item'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>

                    {visibleActiveDaySections.map(section => (
                      <section className="journey-planner-card rounded-[28px] border p-5 sm:p-6" key={section.title}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="journey-planner-label text-xs font-semibold tracking-[0.22em] uppercase">{section.title}</p>
                            <h3 className="journey-planner-title mt-2 text-xl font-semibold tracking-tight">
                              {section.items.length}
                              {' '}
                              planned
                            </h3>
                          </div>
                          <button
                            className="journey-planner-soft-button inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                            onClick={() => handleAddCategory(section.type)}
                            type="button"
                          >
                            <PlusIcon className="h-4 w-4" />
                            Add
                            {' '}
                            {section.title}
                          </button>
                        </div>

                        <div className="mt-5 space-y-4">
                          {section.items.map(renderPlaceEditor)}
                        </div>
                      </section>
                    ))}

                    <section className="journey-planner-card rounded-[28px] border p-5 sm:p-6">
                      <p className="journey-planner-label text-xs font-semibold tracking-[0.22em] uppercase">Notes</p>
                      <h3 className="journey-planner-title mt-2 text-xl font-semibold tracking-tight">Day notes and context</h3>
                      <textarea
                        ref={notesRef}
                        className="journey-planner-field mt-5 min-h-40 w-full rounded-3xl border px-4 py-4 text-sm leading-6 transition outline-none"
                        onChange={event => updateDayNotes(activeDay.id, event.target.value)}
                        placeholder="Capture what happened, what worked well, and what future travelers should know."
                        value={activeDay.notes ?? ''}
                      />
                    </section>
                  </>
                )
              : null}
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <section className="journey-planner-card rounded-[28px] border p-5 sm:p-6">
              <p className="journey-planner-label text-xs font-semibold tracking-[0.22em] uppercase">Map preview</p>
              <h2 className="journey-planner-title mt-2 text-2xl font-semibold tracking-tight">Journey route builds live</h2>
              <p className="journey-planner-copy mt-2 text-sm">Every stop with coordinates appears on the map while the itinerary is being built.</p>

              <div className="journey-planner-subcard mt-5 overflow-hidden rounded-[24px] border">
                <div className="h-[420px]">
                  <JourneyCreateMapPanel
                    days={values.days}
                    hasApiKey={mapLoader.hasApiKey}
                    isLoaded={mapLoader.isLoaded}
                    loadError={mapLoader.loadError}
                  />
                </div>
              </div>
            </section>

            <section className="journey-planner-card rounded-[28px] border p-5 sm:p-6">
              <p className="journey-planner-label text-xs font-semibold tracking-[0.22em] uppercase">Journey health</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="journey-planner-subcard rounded-2xl border p-4">
                  <p className="journey-planner-label text-xs font-medium tracking-wide uppercase">Days</p>
                  <p className="journey-planner-title mt-2 text-2xl font-semibold">{values.days.length}</p>
                </div>
                <div className="journey-planner-subcard rounded-2xl border p-4">
                  <p className="journey-planner-label text-xs font-medium tracking-wide uppercase">Photos</p>
                  <p className="journey-planner-title mt-2 text-2xl font-semibold">{totalPhotos}</p>
                </div>
              </div>

              <button
                className="journey-planner-primary-button mt-5 w-full rounded-2xl px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                onClick={handleOpenReview}
                type="button"
              >
                {mode === 'create' ? 'Review & post' : 'Review changes'}
              </button>
            </section>
          </aside>
        </div>
      </div>

      <ReviewModal
        coverImageSrc={coverPreviewUrl ?? initialJourney?.coverImage ?? '/london.png'}
        days={values.days}
        endDate={values.endDate}
        isOpen={isReviewOpen}
        isSubmitting={isSubmitting}
        mode={mode}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleSubmit}
        startDate={values.startDate}
        subtitle={values.description ?? ''}
        title={values.title}
      />
    </div>
  );
}
