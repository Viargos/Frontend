/**
 * Accommodation Type Detector
 * 
 * Intelligently detects accommodation types (hotel vs rental) based on
 * place name and description to assign appropriate marker colors.
 */

export enum AccommodationType {
  HOTEL = 'hotel',
  RENTAL = 'rental',
  UNKNOWN = 'unknown',
}

/**
 * Keywords for detecting hotels
 */
const HOTEL_KEYWORDS = [
  'hotel',
  'hotels',
  'resort',
  'resorts',
  'inn',
  'motel',
  'lodge',
  'lodging',
  'hostel',
  'guesthouse',
  'guest house',
  'boutique',
  'suites',
  'marriott',
  'hilton',
  'hyatt',
  'sheraton',
  'radisson',
  'holiday inn',
  'best western',
  'ibis',
  'novotel',
  'accor',
  'plaza',
  'palace',
  'grand',
  'royal',
  'imperial',
];

/**
 * Keywords for detecting rentals
 */
const RENTAL_KEYWORDS = [
  'airbnb',
  'air bnb',
  'apartment',
  'apartments',
  'flat',
  'rental',
  'rentals',
  'vacation rental',
  'vrbo',
  'condo',
  'condominium',
  'villa',
  'villas',
  'house',
  'home',
  'cottage',
  'cabin',
  'studio',
  'loft',
  'townhouse',
  'bungalow',
  'chalet',
  'homestay',
  'private room',
  'entire place',
  'booking.com',
  'expedia',
  'hostelworld',
];

/**
 * Detects accommodation type from place name and description
 * 
 * @param placeName - The name of the place
 * @param description - Optional description of the place
 * @returns AccommodationType - Detected accommodation type
 */
export function detectAccommodationType(
  placeName: string,
  description?: string
): AccommodationType {
  if (!placeName) return AccommodationType.UNKNOWN;

  const combinedText = `${placeName.toLowerCase()} ${(description || '').toLowerCase()}`;

  // Check for hotel keywords first (usually more specific)
  const hasHotelKeyword = HOTEL_KEYWORDS.some(keyword => 
    combinedText.includes(keyword.toLowerCase())
  );

  if (hasHotelKeyword) {
    return AccommodationType.HOTEL;
  }

  // Check for rental keywords
  const hasRentalKeyword = RENTAL_KEYWORDS.some(keyword => 
    combinedText.includes(keyword.toLowerCase())
  );

  if (hasRentalKeyword) {
    return AccommodationType.RENTAL;
  }

  // Default to unknown if no keywords match
  return AccommodationType.UNKNOWN;
}

/**
 * Get marker color based on accommodation type
 * Uses blue-themed colors matching the application theme
 * 
 * @param accommodationType - The type of accommodation
 * @returns Hex color code
 */
export function getAccommodationColor(accommodationType: AccommodationType): string {
  const colors = {
    [AccommodationType.HOTEL]: '#1e40af',     // Deep blue for hotels
    [AccommodationType.RENTAL]: '#0891b2',    // Teal blue for rentals
    [AccommodationType.UNKNOWN]: '#2563eb',   // Default bright blue
  };

  return colors[accommodationType];
}

/**
 * Get accommodation type label for UI display
 * 
 * @param accommodationType - The type of accommodation
 * @returns Human-readable label
 */
export function getAccommodationLabel(accommodationType: AccommodationType): string {
  const labels = {
    [AccommodationType.HOTEL]: 'Hotel',
    [AccommodationType.RENTAL]: 'Rental',
    [AccommodationType.UNKNOWN]: 'Stay',
  };

  return labels[accommodationType];
}

/**
 * Get accommodation icon emoji
 * 
 * @param accommodationType - The type of accommodation
 * @returns Emoji icon
 */
export function getAccommodationIcon(accommodationType: AccommodationType): string {
  const icons = {
    [AccommodationType.HOTEL]: '🏨',
    [AccommodationType.RENTAL]: '🏠',
    [AccommodationType.UNKNOWN]: '🛏️',
  };

  return icons[accommodationType];
}



