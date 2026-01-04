# Google Maps Custom Styling Guide

## Overview

This document describes the reusable Google Maps styling system for the Viargos application. The map styles match the application's white and blue-600 (#001a6e) color scheme, creating a clean, modern, and professional appearance.

## Files

- **`map-styles.ts`** - Contains reusable map styling configurations

## Color Scheme

The map styling uses the following color palette from the application:

- **Primary Blue (Blue-600)**: `#001a6e` - Used for text, labels, and accents
- **Blue-700**: `#001456` - Used for darker text elements
- **White**: `#ffffff` - Pure white base for landscape
- **Gray Scale**:
  - Gray-50: `#f9fafb` - Very light backgrounds
  - Gray-100: `#f3f4f6` - Roads and subtle elements
  - Gray-200: `#e9eaeb` - Road strokes and borders
  - Gray-300: `#d5d7da` - Highways and boundaries
  - Gray-500: `#717680` - Medium text
  - Gray-600: `#535862` - Text on roads
  - Gray-700: `#414651` - Arterial road labels
- **Indigo-50**: `#eef4ff` - Parks and transit stations
- **Water**: `#e3ebf5` - Light blue tint for water features

## Available Exports

### 1. `mapStyles` (Default)

The primary map styling configuration with comprehensive theming.

**Features:**

- Clean white base with subtle gray variations
- Blue-tinted water features
- Reduced visual clutter (many POI types hidden)
- Blue-600 accents throughout
- Subtle road hierarchy
- Beautiful park and natural area highlighting

**Usage:**

```typescript
import { mapStyles } from '@/constants/map-styles';

<GoogleMap
  options={{ styles: mapStyles }}
  // ... other props
/>;
```

### 2. `mapStylesMinimal`

A minimal version with even less visual noise, perfect when you want custom markers to be the primary focus.

**Features:**

- Simplified labels
- Same color scheme as default
- Most POI and transit elements hidden
- Very clean appearance

**Usage:**

```typescript
import { mapStylesMinimal } from '@/constants/map-styles';

<GoogleMap
  options={{ styles: mapStylesMinimal }}
  // ... other props
/>;
```

### 3. `viargoMapOptions` (Recommended)

A complete map options preset that includes styles and common settings.

**Features:**

- Includes the default `mapStyles`
- Zoom control enabled
- Street view, map type controls disabled
- Fullscreen control disabled
- Cooperative gesture handling
- Clickable POI icons disabled
- Map bounds restricted to valid coordinates

**Usage:**

```typescript
import { viargoMapOptions } from '@/constants/map-styles';

<GoogleMap
  options={viargoMapOptions}
  // ... other props
/>;
```

**Overriding Options:**

```typescript
import { viargoMapOptions } from '@/constants/map-styles';

<GoogleMap
  options={{
    ...viargoMapOptions,
    fullscreenControl: true, // Override specific option
    disableDefaultUI: true, // Override another option
  }}
  // ... other props
/>;
```

## Implementation Examples

### Discover Page (ExploreMap)

The discover page uses the complete `viargoMapOptions` preset:

```typescript
import { viargoMapOptions } from '@/constants/map-styles';

<GoogleMap
  mapContainerStyle={containerStyle}
  center={mapCenter}
  zoom={center ? 10 : 3}
  onLoad={onLoad}
  onUnmount={onUnmount}
  onClick={onMapClick}
  options={viargoMapOptions}
/>;
```

### Journey Detail Map (JourneyMap)

Journey maps also use the preset for consistency:

```typescript
import { viargoMapOptions } from '@/constants/map-styles';

<GoogleMap
  mapContainerStyle={containerStyle}
  center={center}
  zoom={12}
  onLoad={onLoad}
  onUnmount={onUnmount}
  onClick={onMapClick}
  options={viargoMapOptions}
/>;
```

### All Journeys Overview (AllJourneysMap)

This map overrides some options while maintaining the style:

```typescript
import { viargoMapOptions } from '@/constants/map-styles';

<GoogleMap
  mapContainerStyle={containerStyle}
  center={defaultCenter}
  zoom={1}
  onLoad={onLoad}
  onUnmount={onUnmount}
  options={{
    ...viargoMapOptions,
    fullscreenControl: true, // Enable fullscreen for overview
    disableDefaultUI: true, // Hide default UI for cleaner look
  }}
/>;
```

## Customization

### Adding Custom Styles

To add or modify map styles, edit `map-styles.ts`:

```typescript
export const mapStyles: google.maps.MapTypeStyle[] = [
  // ... existing styles
  {
    featureType: 'your-feature',
    elementType: 'geometry',
    stylers: [
      {
        color: '#yourcolor',
      },
    ],
  },
];
```

### Feature Types

Common feature types you can style:

- `water` - Water bodies
- `landscape` - Base terrain
- `landscape.natural` - Natural features
- `poi` - Points of interest
- `poi.park` - Parks specifically
- `road` - All roads
- `road.highway` - Highways
- `road.arterial` - Major roads
- `transit.station` - Transit stations
- `transit.line` - Transit lines
- `administrative` - Borders and boundaries

### Element Types

- `geometry` - The visual feature itself
- `geometry.fill` - Fill color
- `geometry.stroke` - Stroke/border color
- `labels` - All labels
- `labels.text.fill` - Label text color
- `labels.text.stroke` - Label text outline

### Stylers

- `color` - Hex color code
- `visibility` - 'on', 'off', 'simplified'
- `weight` - Line weight for strokes
- `lightness` - Lightness adjustment (-100 to 100)
- `saturation` - Saturation adjustment (-100 to 100)

## Design Principles

1. **Consistency**: All maps use the same color scheme matching the application
2. **Clarity**: Reduced visual noise to focus on journey data
3. **Hierarchy**: Important elements (water, highways, borders) use blue accents
4. **Accessibility**: High contrast text with white outlines for readability
5. **Professionalism**: Clean, modern appearance with subtle variations

## Testing

After making changes to map styles:

1. Test on the `/discover` page with multiple journeys
2. Test on individual journey detail pages
3. Test on the all journeys overview
4. Verify readability of labels at different zoom levels
5. Check appearance on both light and dark themes (if applicable)

## Marker Colors

All markers use a blue-themed color palette to match the map styling. See `MARKER_COLORS.md` for complete documentation.

**Quick Reference**:

- Journey markers: Blue gradient from `#001a6e` to `#0891b2`
- Day polylines: Blue progression matching journey days
- Place types: Differentiated by blue shade intensity
- New markers: `#0ea5e9` (cyan blue) with animation

## Resources

- [Google Maps Styling Wizard](https://mapstyle.withgoogle.com/)
- [Google Maps Style Reference](https://developers.google.com/maps/documentation/javascript/style-reference)
- [Snazzy Maps](https://snazzymaps.com/) - Community map styles for inspiration
- `MARKER_COLORS.md` - Detailed marker color documentation
- `COLOR_REFERENCE.md` - Complete color palette reference

## Notes

- The map styles are applied at runtime and don't require map reload
- Custom marker icons use blue-themed colors matching the map
- Polylines use blue gradient for visual harmony
- Map styles create a cohesive monochromatic blue theme
- All colors meet WCAG AA/AAA accessibility standards
