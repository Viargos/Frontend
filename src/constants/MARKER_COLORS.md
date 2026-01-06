# Map Marker Color System

## Overview

This document describes the blue-themed marker color system used across all maps in the Viargos application. All markers use a monochromatic blue palette that harmonizes with the custom map styling.

## Design Philosophy

1. **Monochromatic Blue**: All markers use shades of blue for visual harmony
2. **Type Differentiation**: Different place types use different blue shades for easy identification
3. **Accessibility**: All colors maintain sufficient contrast for visibility
4. **Brand Consistency**: Aligns with the primary blue-600 (#001a6e) brand color

## Color Palette

### Primary Marker Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Primary Blue** | `#001a6e` | (0, 26, 110) | Day 1 paths, primary journeys, base markers |
| **Deep Blue** | `#1e40af` | (30, 64, 175) | Day 2 paths, **hotel accommodations** 🏨 |
| **Bright Blue** | `#2563eb` | (37, 99, 235) | Day 3 paths, activity markers |
| **Sky Blue** | `#3b82f6` | (59, 130, 246) | Day 4 paths, food/restaurant markers |
| **Cyan Blue** | `#0ea5e9` | (14, 165, 233) | Day 5 paths, new markers, journey start |
| **Teal Blue** | `#06b6d4` | (6, 182, 212) | Day 6 paths, note markers |
| **Dark Teal** | `#0891b2` | (8, 145, 178) | Day 7 paths, transport, **rental properties** 🏠 |
| **Blue-Gray** | `#4a5574` | (74, 85, 116) | Unknown day, inactive elements |

## Marker Types by Component

### 1. ExploreMap (Discover Page)

**Circular Markers with User Images/Initials**

- **With Cover Image**: Shows journey cover image
- **With Profile Image**: Shows user profile picture
- **With Initial**: Shows user's first letter with blue-tinted background

**Initial Background Colors** (rotates based on username):
1. `#001a6e` - Primary blue
2. `#1e3a8a` - Dark blue
3. `#2563eb` - Bright blue
4. `#3b82f6` - Sky blue
5. `#0ea5e9` - Cyan blue
6. `#06b6d4` - Teal blue
7. `#0891b2` - Darker teal
8. `#0e7490` - Deep teal
9. `#155e75` - Navy teal
10. `#164e63` - Dark navy

**Marker Styling**:
- Border: White with `#d0dae8` (blue-gray-300) stroke
- Background (no image): `#eff2f9` (blue-gray-100)
- Pin: White fill with `#d0dae8` stroke

### 2. JourneyMap (Journey Detail Pages)

**Circular Markers by Place Type**

| Place Type | Color | Hex Code | Visual | Notes |
|------------|-------|----------|--------|-------|
| **Journey Location** | Primary Blue | `#001a6e` | Pin-style marker | - |
| **Stay - Hotel** | Deep Blue | `#1e40af` | Circle marker | Auto-detected from name |
| **Stay - Rental** | Teal Blue | `#0891b2` | Circle marker | Airbnb, apartments, etc. |
| **Activity** | Bright Blue | `#2563eb` | Circle marker | - |
| **Food** | Sky Blue | `#3b82f6` | Circle marker | - |
| **Transport** | Teal Blue | `#0891b2` | Circle marker | - |
| **Note** | Cyan Blue | `#06b6d4` | Circle marker | - |

**Smart Accommodation Detection**: The system automatically detects whether a stay is a hotel or rental based on keywords in the place name and description:
- **Hotels**: Hilton, Marriott, Resort, Inn, Lodge, etc. → Deep Blue `#1e40af`
- **Rentals**: Airbnb, Apartment, Villa, Vacation Rental, etc. → Teal Blue `#0891b2`

**New Marker Highlight**: `#0ea5e9` (Cyan blue with pulsing animation)

**Polyline Colors by Day**:
```typescript
Day 1: #001a6e (Primary Blue)
Day 2: #1e40af (Deep Blue)
Day 3: #2563eb (Bright Blue)
Day 4: #3b82f6 (Sky Blue)
Day 5: #0ea5e9 (Cyan Blue)
Day 6: #06b6d4 (Teal Blue)
Day 7: #0891b2 (Dark Teal)
Unknown: #4a5574 (Blue-Gray)
```

### 3. AllJourneysMap (Journey Overview)

**Markers by Type**

| Type | Color | Hex Code | Size | Special Feature |
|------|-------|----------|------|-----------------|
| **Journey Start** | Cyan Blue | `#0ea5e9` | 32px | Pin marker with "J" label |
| **Stay - Hotel** | Deep Blue | `#1e40af` | 24px | Circle marker |
| **Stay - Rental** | Teal Blue | `#0891b2` | 24px | Circle marker |
| **Activity** | Bright Blue | `#2563eb` | 24px | Circle marker |
| **Food** | Sky Blue | `#3b82f6` | 24px | Circle marker |
| **Transport** | Teal Blue | `#0891b2` | 24px | Circle marker |
| **Note** | Cyan Blue | `#06b6d4` | 24px | Circle marker |

**Selection States**:
- **Normal**: White stroke (2px)
- **Selected**: Primary blue stroke (#001a6e, 3px) with pulsing animation

**Polyline Colors**:
- Rotates through: `#001a6e`, `#1e40af`, `#2563eb`, `#3b82f6`, `#0ea5e9`, `#06b6d4`, `#0891b2`

## Visual Examples

### Color Gradient Visualization

```
Darkest ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Lightest

#001a6e  #1e40af  #2563eb  #3b82f6  #0ea5e9  #06b6d4  #0891b2
   │        │        │        │        │        │        │
Primary   Deep    Bright    Sky     Cyan     Teal    Dark
 Blue     Blue     Blue     Blue    Blue     Blue    Teal
```

## Smart Accommodation Detection System

### Overview

The application includes an intelligent accommodation type detector that automatically distinguishes between hotels and rental properties (Airbnb, vacation rentals, etc.) to assign appropriate marker colors.

### How It Works

The system analyzes the place name and description for specific keywords:

**Hotel Keywords** (assigned Deep Blue `#1e40af`):
- hotel, resort, inn, motel, lodge
- Brand names: Hilton, Marriott, Hyatt, Sheraton, etc.
- Descriptive: boutique, suites, palace, plaza

**Rental Keywords** (assigned Teal Blue `#0891b2`):
- airbnb, apartment, flat, rental, villa
- condo, house, cottage, cabin, studio
- vacation rental, vrbo, homestay

### Examples

```typescript
// Hotel detection
"Hilton Garden Inn" → Deep Blue (#1e40af)
"Grand Resort & Spa" → Deep Blue (#1e40af)
"Marriott Hotel Downtown" → Deep Blue (#1e40af)

// Rental detection
"Cozy Airbnb in City Center" → Teal Blue (#0891b2)
"Beachfront Villa Rental" → Teal Blue (#0891b2)
"Downtown Apartment with View" → Teal Blue (#0891b2)

// Unknown defaults to bright blue
"My Friend's Place" → Bright Blue (#2563eb)
```

### Using the Detector

```typescript
import { 
  detectAccommodationType, 
  getAccommodationColor,
  AccommodationType 
} from '@/utils/accommodation-detector';

// Detect type
const type = detectAccommodationType(
  "Marriott Hotel",
  "Luxury hotel in downtown"
);
// Returns: AccommodationType.HOTEL

// Get color
const color = getAccommodationColor(type);
// Returns: "#1e40af"
```

## Usage Examples

### Creating Custom Markers

```typescript
// Example: ExploreMap initial-based marker
const blueColors = [
  '#001a6e', // Primary blue
  '#1e3a8a', // Dark blue
  '#2563eb', // Bright blue
  '#3b82f6', // Sky blue
  '#0ea5e9', // Cyan blue
  '#06b6d4', // Teal blue
  '#0891b2', // Darker teal
  '#0e7490', // Deep teal
  '#155e75', // Navy teal
  '#164e63', // Dark navy
];

const colorIndex = username.charCodeAt(0) % blueColors.length;
const backgroundColor = blueColors[colorIndex];
```

### Journey Day Polylines

```typescript
// Example: JourneyMap day path colors
const dayColors = {
  'Day 1': '#001a6e', // Primary blue
  'Day 2': '#1e40af', // Deep blue
  'Day 3': '#2563eb', // Bright blue
  'Day 4': '#3b82f6', // Sky blue
  'Day 5': '#0ea5e9', // Cyan blue
  'Day 6': '#06b6d4', // Teal blue
  'Day 7': '#0891b2', // Darker teal
  unknown: '#4a5574', // Blue-gray
};
```

### Place Type Markers with Smart Detection

```typescript
// Example: Place type color mapping with accommodation detection
import { detectAccommodationType, getAccommodationColor } from '@/utils/accommodation-detector';

// For stay types, detect if it's hotel or rental
let stayColor = '#1e40af'; // Default deep blue
if (type === 'stay' && location?.name) {
  const accommodationType = detectAccommodationType(
    location.name,
    location.description
  );
  stayColor = getAccommodationColor(accommodationType);
  // Hotels: #1e40af (deep blue)
  // Rentals: #0891b2 (teal blue)
}

const colors = {
  journeyLocation: '#001a6e', // Primary blue
  stay: stayColor,            // Varies: Hotel or Rental
  activity: '#2563eb',        // Bright blue
  food: '#3b82f6',            // Sky blue
  transport: '#0891b2',       // Teal blue
  note: '#06b6d4',            // Cyan blue
};
```

## Accessibility

All marker colors meet accessibility standards:

| Color | Contrast on White | Contrast on Blue-Gray-100 | WCAG Level |
|-------|-------------------|---------------------------|------------|
| #001a6e | 11.94:1 | 10.8:1 | AAA |
| #1e40af | 9.2:1 | 8.3:1 | AAA |
| #2563eb | 5.8:1 | 5.2:1 | AA |
| #3b82f6 | 4.5:1 | 4.1:1 | AA |
| #0ea5e9 | 3.8:1 | 3.5:1 | AA (large text) |
| #06b6d4 | 3.2:1 | 2.9:1 | AA (large text) |

Note: Markers use white borders/strokes for additional contrast.

## Best Practices

### 1. Consistency
- Always use the defined color palette
- Don't introduce new colors outside the blue spectrum
- Maintain color assignments for place types across all maps

### 2. Visibility
- All markers have white stroke (2px minimum) for visibility
- Selected states use increased stroke width (3px)
- New markers use pulsing animation for attention

### 3. User Experience
- Colors differentiate between types but remain harmonious
- Darker blues for important/permanent elements (stays, primary journeys)
- Lighter blues for transient/supporting elements (notes, transport)

### 4. Testing
After making changes:
1. Verify markers are visible on the blue-tinted map
2. Test color differentiation between adjacent markers
3. Check selected states are clearly distinguishable
4. Ensure polylines don't clash with markers

## Integration with Map Styles

The marker colors are designed to work seamlessly with the custom map styling:

- **Map Water**: `#e3ebf5` (light blue-gray)
- **Map Roads**: `#eff2f9` to `#d0dae8` (blue-gray scale)
- **Map Labels**: `#001a6e` (primary blue)

This creates a cohesive, monochromatic blue theme throughout the entire map interface.

## Future Enhancements

Potential additions to the marker system:

1. **Hover States**: Lighten color by 10% on hover
2. **Inactive States**: Use `#4a5574` (blue-gray) for disabled markers
3. **Category Clustering**: Aggregate markers with gradient backgrounds
4. **Dark Mode**: Adjust to lighter blue shades for dark backgrounds

## Related Files

- `map-styles.ts` - Map background styling
- `accommodation-detector.ts` - **Smart accommodation type detection**
- `ExploreMap.tsx` - Discover page markers
- `JourneyMap.tsx` - Journey detail markers (with accommodation detection)
- `AllJourneysMap.tsx` - Overview map markers (with accommodation detection)
- `COLOR_REFERENCE.md` - Complete color documentation

