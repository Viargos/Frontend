'use client';

import type { ChangeEvent, CSSProperties, ReactNode } from 'react';
import type { DragEndEvent } from '@/modules/journey/infra/dnd-adapter';
import type { JourneyDayInput, JourneyPlaceInput } from '@/modules/journey/types/journey.types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarIcon,
  CarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  GripVerticalIcon,
  HotelIcon,
  ImageIcon,
  MapPinIcon,
  TrashIcon,
  TreeIcon,
  UtensilsIcon,
  XIcon,
} from '@/modules/common/icons';
import { PlaceType } from '@/modules/journey/enums/place-type.enum';
import { useJourneyActions, useJourneyCreateForm } from '@/modules/journey/hooks';
import { DndContext, PointerSensor, SortableContext, useSensor, useSensors, verticalListSortingStrategy } from '@/modules/journey/infra/dnd-adapter';
import { useGoogleMapsLoader } from '@/modules/journey/infra/map-adapter';
import { JourneyCreateMapPanel } from './JourneyCreateMapPanel';

type ErrorAlertProps = {
  message: string | null;
  onDismiss: () => void;
  title?: string;
};

type DayFilterProps = {
  activeDayId: string;
  days: JourneyDayInput[];
  onAddDay: () => void;
  onDayChange: (dayId: string) => void;
  onDeleteDay: (dayId: string) => void;
};

type PlanningCategoryProps = {
  bgColor?: string;
  icon: ReactNode;
  isActive?: boolean;
  label: string;
  onClick: () => void;
};

type ReviewModalProps = {
  days: JourneyDayInput[];
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subtitle: string;
  title: string;
};

type PlaceFormProps = {
  dayId: string;
  isPlacesReady: boolean;
  onUpdateField: (field: EditablePlaceField, value: string | number) => void;
  place: JourneyPlaceInput;
};

type SortablePlaceCardProps = {
  dayId: string;
  index: number;
  isPlacesReady: boolean;
  isExpanded: boolean;
  onRemove: () => void;
  onToggleExpansion: () => void;
  onUpdateField: (field: EditablePlaceField, value: string | number) => void;
  place: JourneyPlaceInput;
};

type EditablePlaceField = 'address' | 'description' | 'endTime' | 'latitude' | 'longitude' | 'name' | 'startTime' | 'type';

const DAY_MS = 24 * 60 * 60 * 1000;

const PLACE_TYPE_METADATA: Array<{ icon: ReactNode; label: string; type: PlaceType }> = [
  {
    icon: <HotelIcon className="h-8 w-8" color="#160E53" strokeWidth={2} />,
    label: 'Hotel / Stay',
    type: PlaceType.STAY,
  },
  {
    icon: <TreeIcon className="h-8 w-8" color="#160E53" strokeWidth={2} />,
    label: 'Places to go',
    type: PlaceType.ACTIVITY,
  },
  {
    icon: <UtensilsIcon className="h-8 w-8" color="#160E53" strokeWidth={2} />,
    label: 'Food',
    type: PlaceType.FOOD,
  },
  {
    icon: <CarIcon className="h-8 w-8" color="#160E53" strokeWidth={2} />,
    label: 'Transport',
    type: PlaceType.TRANSPORT,
  },
  {
    icon: <FileTextIcon className="h-8 w-8" color="#160E53" strokeWidth={2} />,
    label: 'Notes',
    type: PlaceType.NOTE,
  },
];

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toDayLabel(dayNumber: number): string {
  return `Day ${dayNumber}`;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    weekday: 'long',
  });
}

function getPlaceTypeIcon(type: PlaceType): ReactNode {
  if (type === PlaceType.STAY) {
    return <HotelIcon className="h-6 w-6" color="#160E53" strokeWidth={2} />;
  }

  if (type === PlaceType.ACTIVITY) {
    return <TreeIcon className="h-6 w-6" color="#160E53" strokeWidth={2} />;
  }

  if (type === PlaceType.FOOD) {
    return <UtensilsIcon className="h-6 w-6" color="#160E53" strokeWidth={2} />;
  }

  if (type === PlaceType.TRANSPORT) {
    return <CarIcon className="h-6 w-6" color="#160E53" strokeWidth={2} />;
  }

  return <FileTextIcon className="h-6 w-6" color="#160E53" strokeWidth={2} />;
}

function getCalendarDays(currentMonth: Date): Date[] {
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const start = new Date(firstDayOfMonth);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(lastDayOfMonth);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const days: Date[] = [];
  for (let cursor = new Date(start); cursor <= end; cursor = new Date(cursor.getTime() + DAY_MS)) {
    days.push(new Date(cursor));
  }

  return days;
}

function isSameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function ErrorAlert(props: ErrorAlertProps) {
  const { message, onDismiss, title = 'Unable to create journey' } = props;

  if (!message) {
    return null;
  }

  return (
    <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4" data-parity="create-error-banner">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 0 0 3.53 21H20.47A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="mb-1 text-sm font-medium text-red-800">{title}</h4>
          <p className="text-sm text-red-700">{message}</p>
        </div>
        <button
          aria-label="Dismiss error"
          className="flex-shrink-0 rounded p-1 transition-colors hover:bg-red-100"
          onClick={onDismiss}
          type="button"
        >
          <XIcon className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

function PlanningCategory(props: PlanningCategoryProps) {
  const { bgColor = '#ffffff', icon, isActive = false, label, onClick } = props;

  return (
    <button
      className="flex cursor-pointer flex-col items-center justify-center gap-2.5 transition-all hover:opacity-90"
      onClick={onClick}
      type="button"
    >
      <div className="text-center font-manrope text-xs leading-3 font-bold text-gray-600">{label}</div>
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-sm transition-all hover:shadow-md ${isActive ? 'ring-2 ring-blue-200 ring-offset-2' : 'hover:scale-105'}`}
        style={{ backgroundColor: bgColor, borderColor: '#160E53' }}
      >
        <div className="flex h-8 w-8 items-center justify-center">
          {icon}
        </div>
      </div>
    </button>
  );
}

function DayFilter(props: DayFilterProps) {
  const { activeDayId, days, onAddDay, onDayChange, onDeleteDay } = props;

  return (
    <div className="scrollbar-hide flex w-full items-center gap-3 overflow-x-scroll py-2" data-parity="create-day-filter">
      <div className="flex items-center gap-3">
        {days.map(day => (
          <div className="relative flex-shrink-0" key={day.id}>
            <button
              className={`shadow-button flex w-25 items-center justify-center gap-2 rounded-2xl px-4 py-1 font-manrope text-base leading-6 font-semibold ${activeDayId === day.id ? 'bg-primary-blue text-white' : 'border-primary-blue text-primary-blue border bg-white hover:bg-blue-50'}`}
              onClick={() => onDayChange(day.id)}
              type="button"
            >
              {toDayLabel(day.dayNumber)}
            </button>

            {days.length > 1
              ? (
                  <button
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-sm transition-colors hover:bg-red-600"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteDay(day.id);
                    }}
                    title={`Delete ${toDayLabel(day.dayNumber)}`}
                    type="button"
                  >
                    ×
                  </button>
                )
              : null}
          </div>
        ))}

        <button
          className="border-primary-blue text-primary-blue shadow-button flex w-25 flex-shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white px-4 py-[2px] font-manrope text-base leading-6 font-semibold whitespace-nowrap transition-colors hover:bg-blue-50"
          onClick={onAddDay}
          type="button"
        >
          + Add Day
        </button>
      </div>
    </div>
  );
}

function PlaceForm(props: PlaceFormProps) {
  const {
    dayId,
    isPlacesReady,
    onUpdateField,
    place,
  } = props;
  const fieldPrefix = `${dayId}-${place.id}`;
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const onUpdateFieldRef = useRef(onUpdateField);
  const placeNameRef = useRef(place.name);

  useEffect(() => {
    onUpdateFieldRef.current = onUpdateField;
  }, [onUpdateField]);

  useEffect(() => {
    placeNameRef.current = place.name;
  }, [place.name]);

  useEffect(() => {
    if (!isPlacesReady || typeof window === 'undefined') {
      return;
    }

    const input = addressInputRef.current;
    const mapsApi = window.google?.maps;

    if (!input || !mapsApi?.places?.Autocomplete) {
      return;
    }

    const autocomplete = new mapsApi.places.Autocomplete(input, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['establishment', 'geocode'],
    });

    const placeChangedListener = autocomplete.addListener('place_changed', () => {
      const selectedPlace = autocomplete.getPlace();
      const location = selectedPlace.geometry?.location;
      const address = selectedPlace.formatted_address ?? selectedPlace.name ?? input.value;

      if (address) {
        onUpdateFieldRef.current('address', address);
      }

      if (!placeNameRef.current && selectedPlace.name) {
        onUpdateFieldRef.current('name', selectedPlace.name);
      }

      if (location) {
        onUpdateFieldRef.current('latitude', location.lat());
        onUpdateFieldRef.current('longitude', location.lng());
      }
    });

    return () => {
      mapsApi.event.removeListener(placeChangedListener);
      mapsApi.event.clearInstanceListeners(autocomplete);
    };
  }, [isPlacesReady, place.id]);

  if (place.type === PlaceType.NOTE) {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-black" htmlFor={`${fieldPrefix}-notes`}>Notes</label>
        <textarea
          className="focus:ring-primary-blue w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:outline-none"
          id={`${fieldPrefix}-notes`}
          onChange={event => onUpdateField('description', event.target.value)}
          placeholder="Add your notes here..."
          rows={4}
          value={place.description ?? ''}
        />
      </div>
    );
  }

  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium text-black" htmlFor={`${fieldPrefix}-name`}>Name *</label>
        <input
          className="focus:ring-primary-blue w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:outline-none"
          id={`${fieldPrefix}-name`}
          onChange={event => onUpdateField('name', event.target.value)}
          placeholder="Enter place name"
          type="text"
          value={place.name}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-black" htmlFor={`${fieldPrefix}-description`}>Description</label>
        <textarea
          className="focus:ring-primary-blue w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:outline-none"
          id={`${fieldPrefix}-description`}
          onChange={event => onUpdateField('description', event.target.value)}
          placeholder="Enter description"
          rows={2}
          value={place.description ?? ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-black" htmlFor={`${fieldPrefix}-start-time`}>Start Time</label>
          <input
            className="focus:ring-primary-blue w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-transparent focus:ring-2 focus:outline-none"
            id={`${fieldPrefix}-start-time`}
            onChange={event => onUpdateField('startTime', event.target.value)}
            step="60"
            type="time"
            value={place.startTime ?? ''}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black" htmlFor={`${fieldPrefix}-end-time`}>End Time</label>
          <input
            className="focus:ring-primary-blue w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-transparent focus:ring-2 focus:outline-none"
            id={`${fieldPrefix}-end-time`}
            onChange={event => onUpdateField('endTime', event.target.value)}
            step="60"
            type="time"
            value={place.endTime ?? ''}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-black" htmlFor={`${fieldPrefix}-address`}>Location/Address *</label>
        <div className="relative">
          <input
            autoComplete="off"
            className="focus:ring-primary-blue w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:outline-none"
            id={`${fieldPrefix}-address`}
            onChange={event => onUpdateField('address', event.target.value)}
            placeholder="Search for a location"
            ref={addressInputRef}
            type="text"
            value={place.address ?? ''}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <MapPinIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </>
  );
}

function SortablePlaceCard(props: SortablePlaceCardProps) {
  const {
    dayId,
    index,
    isPlacesReady,
    isExpanded,
    onRemove,
    onToggleExpansion,
    onUpdateField,
    place,
  } = props;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: place.id });

  const style: CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: index * 0.08, duration: 0.3 }}
      >
        <motion.div
          className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50"
          onClick={onToggleExpansion}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onToggleExpansion();
            }
          }}
          role="button"
          tabIndex={0}
          whileTap={{ scale: 0.998 }}
        >
          <div className="flex items-center gap-3">
            <button
              aria-label="Reorder place"
              className="flex cursor-grab touch-none items-center justify-center text-gray-400 hover:text-gray-600 active:cursor-grabbing"
              onClick={event => event.stopPropagation()}
              type="button"
              {...attributes}
              {...listeners}
            >
              <GripVerticalIcon className="h-5 w-5" strokeWidth={2} />
            </button>

            <div className="m-0 flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 p-0">
              <div className="flex h-full w-full items-center justify-center p-0 opacity-70" style={{ maxHeight: '20px', maxWidth: '20px' }}>
                {getPlaceTypeIcon(place.type)}
              </div>
            </div>

            <div className="flex flex-col items-start gap-1">
              <div className="font-manrope text-sm leading-5 font-semibold text-black">{place.name || 'Untitled place'}</div>
              {!isExpanded && place.startTime && place.endTime
                ? (
                    <div className="font-manrope text-xs leading-4 font-normal text-gray-500">
                      {place.startTime}
                      {' '}
                      -
                      {' '}
                      {place.endTime}
                    </div>
                  )
                : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded p-1 transition-colors hover:bg-red-50"
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              title="Remove place"
              type="button"
            >
              <TrashIcon className="h-4 w-4 text-red-500" strokeWidth={2} />
            </button>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isExpanded
            ? (
                <motion.div
                  animate={{ height: 'auto', opacity: 1 }}
                  className="overflow-hidden border-t border-gray-200 p-4"
                  exit={{ height: 0, opacity: 0 }}
                  initial={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <motion.div
                    animate={{ y: 0 }}
                    className="w-full space-y-3"
                    exit={{ y: -20 }}
                    initial={{ y: -20 }}
                    transition={{ delay: 0.08, duration: 0.2 }}
                  >
                    <PlaceForm dayId={dayId} isPlacesReady={isPlacesReady} onUpdateField={onUpdateField} place={place} />
                  </motion.div>
                </motion.div>
              )
            : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function JourneyReviewModal(props: ReviewModalProps) {
  const { days, isOpen, isSubmitting, onClose, onConfirm, subtitle, title } = props;
  const totalPlaces = days.reduce((sum, day) => sum + day.places.length, 0);

  return (
    <AnimatePresence>
      {isOpen
        ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" data-parity="create-review-modal">
              <motion.div
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative h-48 overflow-hidden bg-[#160E53]">
                  <Image alt="Journey cover" className="object-cover" fill sizes="896px" src="/london.png" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <button
                    className="absolute top-4 right-4 rounded-full bg-white/95 p-2 shadow-lg transition-all hover:bg-white"
                    disabled={isSubmitting}
                    onClick={onClose}
                    type="button"
                  >
                    <XIcon className="h-5 w-5 text-gray-700" />
                  </button>
                  <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
                    <p className="mb-2 text-xs tracking-widest text-white/80 uppercase">Review Journey</p>
                    <h2 className="mb-2 text-3xl font-semibold">{title || 'Untitled Journey'}</h2>
                    {subtitle ? <p className="line-clamp-2 text-sm text-white/90">{subtitle}</p> : null}
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                      <CalendarIcon className="mx-auto mb-2 h-6 w-6 text-[#160E53]" />
                      <p className="text-2xl font-semibold text-slate-900">{days.length}</p>
                      <p className="text-xs text-slate-500">Days</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                      <MapPinIcon className="mx-auto mb-2 h-6 w-6 text-[#160E53]" />
                      <p className="text-2xl font-semibold text-slate-900">{totalPlaces}</p>
                      <p className="text-xs text-slate-500">Places</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                      <ImageIcon className="mx-auto mb-2 h-6 w-6 text-[#160E53]" />
                      <p className="text-2xl font-semibold text-slate-900">0</p>
                      <p className="text-xs text-slate-500">Photos</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {days.map(day => (
                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={day.id}>
                        <h3 className="text-lg font-semibold text-slate-900">{toDayLabel(day.dayNumber)}</h3>
                        <p className="mb-3 text-sm text-slate-500">{formatDisplayDate(parseIsoDate(day.date))}</p>
                        {day.places.length
                          ? (
                              <div className="space-y-2">
                                {day.places.map(place => (
                                  <div className="rounded-lg border border-slate-200 p-3" key={place.id}>
                                    <p className="text-sm font-semibold text-slate-900">{place.name || 'Untitled place'}</p>
                                    {place.address ? <p className="text-xs text-slate-500">{place.address}</p> : null}
                                  </div>
                                ))}
                              </div>
                            )
                          : <p className="py-4 text-center text-sm text-slate-500">No places added for this day</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                      <p className="font-semibold text-slate-900">Ready to share your journey?</p>
                      <p className="text-xs text-slate-500">This will be visible to other travelers</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="rounded-lg border border-slate-200 px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        disabled={isSubmitting}
                        onClick={onClose}
                        type="button"
                      >
                        Edit Journey
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-lg bg-[#160E53] px-6 py-2.5 font-medium text-white shadow-lg transition-colors hover:bg-[#002b9e] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isSubmitting}
                        onClick={onConfirm}
                        type="button"
                      >
                        {isSubmitting
                          ? (
                              <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Posting...
                              </>
                            )
                          : 'Post Journey'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        : null}
    </AnimatePresence>
  );
}

export const JourneyCreateForm = () => {
  const router = useRouter();
  const { createJourney, isCreatingJourney } = useJourneyActions();
  const mapLoader = useGoogleMapsLoader('create-journey-map-loader');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [activeDayId, setActiveDayId] = useState<string>('');
  const [expandedPlaces, setExpandedPlaces] = useState<Record<string, boolean>>({});
  const [activePlaceType, setActivePlaceType] = useState<PlaceType | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [journeyName, setJourneyName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const {
    addDay,
    addPlace,
    error,
    removeDay,
    removePlace,
    reorderPlaces,
    setDescription,
    setError,
    setTitle,
    updateDay,
    updatePlace,
    validate,
    values,
  } = useJourneyCreateForm();
  const isSubmitting = isCreatingJourney;
  const isPlacesReady = mapLoader.hasApiKey && mapLoader.isLoaded && !mapLoader.loadError;

  useEffect(() => {
    if (!values.days.length) {
      return;
    }

    values.days.forEach((day, index) => {
      const expectedDate = new Date(startDate.getTime() + index * DAY_MS);
      const expectedIso = toIsoDate(expectedDate);
      if (day.date !== expectedIso) {
        updateDay(day.id, 'date', expectedIso);
      }
    });
  }, [startDate, updateDay, values.days]);

  const resolvedActiveDayId = values.days.some(day => day.id === activeDayId)
    ? activeDayId
    : (values.days[0]?.id ?? '');

  const activeDay = useMemo(() => {
    return values.days.find(day => day.id === resolvedActiveDayId) ?? values.days[0] ?? null;
  }, [resolvedActiveDayId, values.days]);

  const activeDayPlaces = useMemo(() => activeDay?.places ?? [], [activeDay]);

  const placeIds = useMemo(() => activeDayPlaces.map(place => place.id), [activeDayPlaces]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const handleUploadCover = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCoverImageUrl(objectUrl);

    event.target.value = '';
  };

  const handleAddDay = () => {
    const newDayId = addDay();
    setActiveDayId(newDayId);
  };

  const handleDeleteDay = (dayId: string) => {
    removeDay(dayId);
    setExpandedPlaces((prev) => {
      const next: Record<string, boolean> = {};
      Object.entries(prev).forEach(([placeId, expanded]) => {
        if (expanded) {
          next[placeId] = true;
        }
      });
      return next;
    });
  };

  const handleAddPlace = (type: PlaceType) => {
    if (!activeDay) {
      return;
    }

    const placeId = addPlace(activeDay.id, type);
    setActivePlaceType(type);
    setExpandedPlaces(prev => ({ ...prev, [placeId]: true }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!activeDay) {
      return;
    }

    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = activeDayPlaces.findIndex(place => place.id === active.id);
    const newIndex = activeDayPlaces.findIndex(place => place.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    reorderPlaces(activeDay.id, oldIndex, newIndex);
  };

  const handleOpenReview = () => {
    const title = journeyName.trim();
    const description = subtitle.trim();

    setTitle(title);
    setDescription(description);

    if (!title) {
      setError('Journey title is required');
      return;
    }

    setShowReviewModal(true);
  };

  const handleConfirmPost = async () => {
    if (isSubmitting) {
      return;
    }

    const title = journeyName.trim();
    const description = subtitle.trim();

    setTitle(title);
    setDescription(description);

    if (!validate()) {
      return;
    }

    try {
      const created = await createJourney({
        ...values,
        description,
        title,
      });

      setShowReviewModal(false);
      router.push(`/journey/${created.id}`);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Failed to create journey';
      setError(message);
    }
  };

  const selectedDate = activeDay ? parseIsoDate(activeDay.date) : startDate;
  const activeDayLabel = activeDay ? toDayLabel(activeDay.dayNumber) : 'Day 1';

  return (
    <div className="max-w-none flex-1 p-4 sm:p-6" data-parity-page="create-journey">
      <div className="flex w-full flex-col gap-6">
        <div className="relative h-64 w-full overflow-hidden rounded-lg sm:h-80 lg:h-96" data-parity="create-hero">
          <Image
            alt="Journey destination"
            className="object-cover"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1024px"
            src={coverImageUrl ?? '/london.png'}
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
            <div className="mb-4 w-full max-w-2xl">
              <input
                className="no-focus-ring w-full border-none bg-transparent text-center text-2xl font-bold text-white placeholder-white/70 outline-none sm:text-3xl lg:text-4xl"
                onChange={event => setJourneyName(event.target.value)}
                placeholder="Enter journey name..."
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
                type="text"
                value={journeyName}
              />
            </div>

            <div className="w-full max-w-xl">
              <input
                className="no-focus-ring w-full border-none bg-transparent text-center text-sm text-white/90 placeholder-white/60 outline-none sm:text-base lg:text-lg"
                onChange={event => setSubtitle(event.target.value)}
                placeholder="Add a subtitle..."
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                type="text"
                value={subtitle}
              />
            </div>
          </div>

          <button
            className="absolute top-4 right-4 flex items-center gap-2 rounded-md bg-white/20 px-3 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <ImageIcon className="h-4 w-4" />
            Change Cover
          </button>

          <input
            accept="image/*"
            className="hidden"
            onChange={handleUploadCover}
            ref={fileInputRef}
            type="file"
          />
        </div>

        <div className="grid w-full grid-cols-1 gap-2 lg:grid-cols-3" data-parity="create-main-grid">
          <div className="flex w-full flex-col items-start gap-8 lg:col-span-2" data-parity="create-left-column">
            <div className="flex w-full items-center gap-3 border-b border-gray-300 pb-3" data-parity="create-journey-header">
              <h1 className="flex-1 font-outfit text-2xl leading-[120%] font-medium text-black">Journey Details</h1>

              <div className="relative flex items-center gap-2" data-parity="create-date-selector">
                <button
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-gray-100"
                  onClick={() => {
                    setCurrentMonth(selectedDate);
                    setShowDatePicker(value => !value);
                  }}
                  type="button"
                >
                  <span className="font-manrope text-sm font-normal text-black">
                    {selectedDate.toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      weekday: 'short',
                    })}
                  </span>
                  <CalendarIcon className="h-4 w-4 text-gray-600" />
                </button>

                {showDatePicker
                  ? (
                      <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                          <button
                            className="rounded p-1 transition-colors hover:bg-gray-100"
                            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                            type="button"
                          >
                            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                          </button>
                          <h3 className="font-manrope text-sm font-semibold text-gray-900">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </h3>
                          <button
                            className="rounded p-1 transition-colors hover:bg-gray-100"
                            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                            type="button"
                          >
                            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>

                        <div className="mb-2 grid grid-cols-7 gap-1">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div className="py-1 text-center text-xs font-medium text-gray-500" key={day}>{day}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {calendarDays.map((day) => {
                            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                            const isSelected = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, new Date());

                            return (
                              <button
                                className={`aspect-square rounded text-sm transition-colors ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isSelected ? 'bg-blue-10 border border-black font-semibold text-white' : isToday ? 'bg-blue-50 font-semibold text-blue-600' : 'hover:bg-gray-100'}`}
                                key={`${day.toISOString()}-${isCurrentMonth ? 'in' : 'out'}`}
                                onClick={() => {
                                  setStartDate(day);
                                  setShowDatePicker(false);
                                }}
                                type="button"
                              >
                                {day.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )
                  : null}
              </div>

              <button
                className="border-primary-blue bg-primary-blue shadow-button hover:bg-opacity-90 inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 font-manrope text-sm leading-5 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                onClick={handleOpenReview}
                type="button"
              >
                {isSubmitting ? 'Creating...' : 'Review & Post'}
              </button>
            </div>

            <ErrorAlert message={error} onDismiss={() => setError(null)} />

            <DayFilter
              activeDayId={resolvedActiveDayId}
              days={values.days}
              onAddDay={handleAddDay}
              onDayChange={setActiveDayId}
              onDeleteDay={handleDeleteDay}
            />

            <div className="flex w-full flex-col items-start gap-6">
              {activeDay
                ? (
                    <div className="flex w-full flex-col items-start justify-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:gap-6 sm:p-6" data-parity="create-active-day-card">
                      <div className="flex w-full flex-col items-start justify-center gap-6 sm:gap-8">
                        <div className="flex w-full flex-col items-start gap-2">
                          <div className="w-full font-manrope text-sm leading-5 font-normal text-gray-600">{activeDayLabel}</div>
                          <div className="w-full font-manrope text-base leading-6 font-semibold text-gray-900 sm:text-lg">
                            {formatDisplayDate(parseIsoDate(activeDay.date))}
                          </div>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5" data-parity="create-planning-categories">
                          {PLACE_TYPE_METADATA.map(item => (
                            <PlanningCategory
                              bgColor="#ffffff"
                              icon={item.icon}
                              isActive={activePlaceType === item.type}
                              key={item.type}
                              label={item.label}
                              onClick={() => handleAddPlace(item.type)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                : null}

              <div className="flex w-full flex-col items-start gap-6" data-parity="create-places-section">
                {activeDayPlaces.length
                  ? (
                      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
                        <SortableContext items={placeIds} strategy={verticalListSortingStrategy}>
                          <div className="w-full space-y-4" data-parity="create-dnd-list">
                            {activeDayPlaces.map((place, index) => (
                              <SortablePlaceCard
                                dayId={activeDay?.id ?? ''}
                                index={index}
                                isPlacesReady={isPlacesReady}
                                isExpanded={Boolean(expandedPlaces[place.id])}
                                key={place.id}
                                onRemove={() => activeDay ? removePlace(activeDay.id, place.id) : undefined}
                                onToggleExpansion={() => {
                                  setExpandedPlaces(prev => ({ ...prev, [place.id]: !prev[place.id] }));
                                }}
                                onUpdateField={(field, value) => {
                                  if (!activeDay) {
                                    return;
                                  }
                                  updatePlace(activeDay.id, place.id, field, value);
                                }}
                                place={place}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )
                  : (
                      <div className="w-full" data-parity="create-empty-places">
                        {/* Empty state intentionally mirrors old UI contract (no visible card). */}
                      </div>
                    )}
              </div>
            </div>
          </div>

          <div className="w-full lg:sticky lg:top-4 lg:col-span-1 lg:self-start" data-parity="create-map-column" style={{ height: 'calc(100vh - 115px)' }}>
            <div className="relative h-[500px] w-full overflow-hidden rounded-lg bg-gray-200 shadow-inner sm:h-[600px] lg:h-full" data-parity="create-map-panel">
              <JourneyCreateMapPanel
                days={values.days}
                hasApiKey={mapLoader.hasApiKey}
                isLoaded={mapLoader.isLoaded}
                loadError={mapLoader.loadError}
              />
            </div>
          </div>
        </div>

        <JourneyReviewModal
          days={values.days}
          isOpen={showReviewModal}
          isSubmitting={isSubmitting}
          onClose={() => setShowReviewModal(false)}
          onConfirm={handleConfirmPost}
          subtitle={subtitle}
          title={journeyName}
        />
      </div>
    </div>
  );
};
