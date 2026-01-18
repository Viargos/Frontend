/**
 * Map Marker SVG Generators
 * Creates dynamic SVG data URLs for Google Maps custom markers
 */

interface MarkerOptions {
  size?: number;
  color?: string;
  isHovered?: boolean;
  isNew?: boolean;
  emoji?: string;
}

/**
 * Generates a Viargos branded journey start marker
 * White pin with navy border and Viargos logo
 */
export const generateViargosMarker = (options: MarkerOptions = {}): google.maps.Icon => {
  const { size = 32, color = '#001A6E', isHovered = false } = options;
  const baseSize = size;
  const markerSize = isHovered ? baseSize + 4 : baseSize;

  const svgContent = `
    <svg width="${markerSize}" height="${markerSize * 1.3}" viewBox="0 0 50 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.35"/>
        </filter>
      </defs>

      <g filter="url(%23shadow)">
        <!-- White pin body with navy border -->
        <path d="M25 2C12.85 2 3 11.85 3 24c0 16.5 22 42 22 42s22-25.5 22-42C47 11.85 37.15 2 25 2z" fill="${color}" stroke="#001A6E" stroke-width="2"/>

        <!-- Viargos logo circle area -->
        <circle cx="25" cy="22" r="16" fill="white" stroke="${color}" stroke-width="1.5"/>

        <!-- Viargos logo -->
        <image href="viargos.svg" width="${markerSize}" height="${markerSize * 1.4}" />
      </g>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
    scaledSize: new window.google.maps.Size(markerSize, markerSize * 1.4),
    anchor: new window.google.maps.Point(markerSize / 2, markerSize * 1.4),
  };
};

/**
 * Generates a regular place marker
 * White pin with navy border and V icon
 */
export const generatePlaceMarker = (options: MarkerOptions = {}): google.maps.Icon => {
  const { size = 32, isHovered = false } = options;
  const baseSize = size;
  const markerSize = isHovered ? baseSize + 4 : baseSize;

  const svgContent = `
    <svg width="${markerSize}" height="${markerSize * 1.3}" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow2" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <g filter="url(%23shadow2)">
        <!-- White pin with navy border -->
        <path d="M20 2C10.06 2 2 10.06 2 20c0 13 18 30 18 30s18-17 18-30C38 10.06 29.94 2 20 2z" fill="white" stroke="#001A6E" stroke-width="2"/>
        <!-- Navy inner circle -->
        <circle cx="20" cy="18" r="10" fill="#001A6E"/>
        <!-- White V icon -->
        <path d="M16 14L20 20L24 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
    scaledSize: new window.google.maps.Size(markerSize, markerSize * 1.3),
    anchor: new window.google.maps.Point(markerSize / 2, markerSize * 1.3),
  };
};

/**
 * Generates a colored marker with emoji icon
 * Used for different place types (food, transport, etc.)
 */
export const generateEmojiMarker = (options: MarkerOptions): google.maps.Icon => {
  const { size = 32, color = '#001A6E', emoji = '📍' } = options;
  const circleSize = size;
  const pinHeight = 8;
  const totalHeight = circleSize + pinHeight;
  const totalWidth = circleSize;
  const pinWidth = 8;

  const svgContent = `
    <svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer white border circle -->
      <circle cx="${totalWidth / 2}" cy="${totalWidth / 2}" r="${circleSize / 2}" fill="white" stroke="${color}" stroke-width="3"/>
      <!-- Colored inner circle -->
      <circle cx="${totalWidth / 2}" cy="${totalWidth / 2}" r="${circleSize / 2 - 3}" fill="${color}"/>
      <!-- Emoji icon -->
      <text x="${totalWidth / 2}" y="${totalWidth / 2 + 4}" text-anchor="middle" fill="white" font-size="20" font-family="Arial, sans-serif" dominant-baseline="middle">${emoji}</text>
      <!-- Pin pointing down -->
      <path d="M ${totalWidth / 2 - pinWidth / 2} ${circleSize} L ${totalWidth / 2} ${totalHeight} L ${totalWidth / 2 + pinWidth / 2} ${circleSize} Z" fill="${color}" stroke="white" stroke-width="1"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
    scaledSize: new window.google.maps.Size(totalWidth, totalHeight),
    anchor: new window.google.maps.Point(totalWidth / 2, totalHeight),
  };
};

/**
 * Generates a journey location marker with optional animation
 * Used for marking specific journey locations
 */
export const generateJourneyLocationMarker = (options: MarkerOptions = {}): google.maps.Icon => {
  const { size = 40, color = '#001A6E', isNew = false } = options;
  const newMarkerColor = '#10b981'; // green color for new markers

  const svgContent = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${isNew ? `<circle cx="12" cy="12" r="11" fill="${newMarkerColor}" opacity="0.3"><animate attributeName="r" values="11;15;11" dur="1s" repeatCount="indefinite"/></circle>` : ''}
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}" stroke="white" stroke-width="1"/>
      <circle cx="12" cy="9" r="2" fill="white"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
    scaledSize: new window.google.maps.Size(size, size),
    anchor: new window.google.maps.Point(size / 2, size),
  };
};

/**
 * Generates a simple circular marker with optional animation
 * Used for journey waypoints
 */
export const generateSimpleMarker = (options: MarkerOptions = {}): google.maps.Icon => {
  const { size = 30, color = '#001A6E', isNew = false } = options;
  const newMarkerColor = '#10b981';

  const svgContent = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${isNew ? `<circle cx="12" cy="12" r="11" fill="${newMarkerColor}" opacity="0.3"><animate attributeName="r" values="11;15;11" dur="1s" repeatCount="indefinite"/></circle>` : ''}
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
    scaledSize: new window.google.maps.Size(size, size),
  };
};

/**
 * Helper to get emoji for place type
 */
export const getPlaceTypeEmoji = (type: string): string => {
  const emojiMap: Record<string, string> = {
    stay: '🏨',
    activity: '🎯',
    food: '🍽️',
    transport: '🚗',
    note: '📝',
  };
  return emojiMap[type] || '📍';
};

/**
 * Helper to get color for place type
 */
export const getPlaceTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    stay: '#3b82f6',      // blue
    activity: '#10b981',  // green
    food: '#ef4444',      // red
    transport: '#8b5cf6', // purple
    note: '#f59e0b',      // yellow
  };
  return colorMap[type] || '#001A6E';
};
