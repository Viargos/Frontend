/**
 * Geocoding utility functions for converting addresses to coordinates
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
  name?: string;
}

/**
 * Geocode an address string to get coordinates
 * @param address - The address string to geocode
 * @returns Promise with geocoded coordinates and address, or null if geocoding fails
 */
export const geocodeAddress = async (
  address: string
): Promise<GeocodeResult | null> => {
  if (!address || !address.trim()) {
    return null;
  }

  if (!window.google || !window.google.maps) {
    console.warn('Google Maps API not loaded');
    return null;
  }

  return new Promise((resolve) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: address.trim() }, (results, status) => {
      if (
        status === window.google.maps.GeocoderStatus.OK &&
        results &&
        results.length > 0
      ) {
        const location = results[0].geometry.location;
        const formattedAddress = results[0].formatted_address;
        // Extract name from formatted address (first part before comma) or use full address
        const name = formattedAddress ? formattedAddress.split(',')[0].trim() : '';

        resolve({
          lat: location.lat(),
          lng: location.lng(),
          address: formattedAddress,
          name: name,
        });
      } else {
        console.warn('Geocoding failed for address:', address, status);
        resolve(null);
      }
    });
  });
};

/**
 * Check if coordinates are valid (not 0,0 and within valid range)
 */
export const isValidCoordinates = (
  lat: number | null | undefined,
  lng: number | null | undefined
): boolean => {
  if (!lat || !lng) return false;
  if (lat === 0 && lng === 0) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

