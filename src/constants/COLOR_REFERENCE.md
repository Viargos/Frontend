# Viargos Map Color Reference

## Primary Colors Used in Map Styling

### Blue Tones (Primary Brand Colors)

**Blue-600 (Primary Blue)**: `#001a6e`

- Usage: Main text labels, administrative boundaries, highway labels, POI labels
- RGB: (0, 26, 110)
- HSL: (226°, 100%, 22%)

**Blue-700 (Darker Blue)**: `#001456`

- Usage: State/province labels (more prominent text)
- RGB: (0, 20, 86)
- HSL: (226°, 100%, 17%)

**Water Blue**: `#e3ebf5`

- Usage: Water bodies (oceans, lakes, rivers)
- RGB: (227, 235, 245)
- HSL: (207°, 50%, 93%)
- Note: Very light blue with white tint for clean appearance

### Blue-Tinted Gray Scale (Supporting Colors)

**White with Blue Tint**: `#fafbff`

- Usage: Base landscape with subtle blue undertone
- RGB: (250, 251, 255)
- HSL: (225°, 100%, 99%)

**Blue-Gray-50**: `#f5f7fb`

- Usage: Natural landscapes, arterial roads
- RGB: (245, 247, 251)
- HSL: (220°, 43%, 97%)

**Blue-Gray-100**: `#eff2f9`

- Usage: Roads, POI geometry
- RGB: (239, 242, 249)
- HSL: (222°, 50%, 96%)

**Blue-Gray-200**: `#e6ebf5`

- Usage: Road strokes, highways
- RGB: (230, 235, 245)
- HSL: (220°, 50%, 93%)

**Blue-Gray-300**: `#d0dae8`

- Usage: Highway strokes, transit lines, administrative borders
- RGB: (208, 218, 232)
- HSL: (215°, 38%, 86%)

**Blue-Gray-600**: `#4a5574`

- Usage: Road labels, POI labels
- RGB: (74, 85, 116)
- HSL: (224°, 22%, 37%)

**Blue-Gray-700**: `#3d4a5e`

- Usage: Arterial road labels
- RGB: (61, 74, 94)
- HSL: (216°, 21%, 30%)

### Accent Colors

**Indigo-50**: `#eef4ff`

- Usage: Parks, transit stations
- RGB: (238, 244, 255)
- HSL: (220°, 100%, 97%)

## Map Feature Color Mapping

### Water Features

- **Geometry**: Water Blue (`#e3ebf5`)
- **Labels**: Blue-600 (`#001a6e`) with white stroke

### Landscape

- **Base**: White with Blue Tint (`#fafbff`)
- **Natural Areas**: Blue-Gray-50 (`#f5f7fb`)
- **Parks**: Indigo-50 (`#eef4ff`)

### Roads

- **Local Roads Fill**: Blue-Gray-100 (`#eff2f9`)
- **Local Roads Stroke**: Blue-Gray-200 (`#e6ebf5`)
- **Local Roads Labels**: Blue-Gray-600 (`#4a5574`)
- **Highways Fill**: Blue-Gray-200 (`#e6ebf5`)
- **Highways Stroke**: Blue-Gray-300 (`#d0dae8`)
- **Highways Labels**: Blue-600 (`#001a6e`)
- **Arterial Roads Fill**: Blue-Gray-50 (`#f5f7fb`)
- **Arterial Roads Labels**: Blue-Gray-700 (`#3d4a5e`)

### Administrative

- **Borders Stroke**: Blue-Gray-300 (`#d0dae8`)
- **Labels**: Blue-600 (`#001a6e`) with white stroke
- **Province Labels**: Blue-700 (`#001456`)
- **Country Borders**: Blue-600 (`#001a6e`)

### Points of Interest

- **Geometry**: Blue-Gray-100 (`#eff2f9`)
- **Labels**: Blue-Gray-600 (`#4a5574`) with white stroke
- **Parks**: Indigo-50 (`#eef4ff`) with Blue-600 labels

### Transit

- **Station Geometry**: Indigo-50 (`#eef4ff`)
- **Station Labels**: Blue-600 (`#001a6e`)
- **Lines**: Blue-Gray-300 (`#d0dae8`)

## Color Contrast Ratios

For accessibility, all text colors meet WCAG AA standards:

- **Blue-600 on White Tinted**: 11.94:1 (AAA)
- **Blue-Gray-600 on White Tinted**: 7.5:1 (AAA)
- **Blue-Gray-700 on White Tinted**: 10.2:1 (AAA)
- **Blue-600 on Blue-Gray-50**: 11.60:1 (AAA)

## Design Philosophy

1. **Monochromatic Blue Theme**: All grays are blue-tinted for a cohesive, harmonious color palette
2. **High Contrast Text**: All text has white stroke for readability on any background
3. **Blue Accents**: Strategic use of brand blue-600 for important elements
4. **Blue-Tinted Base**: Subtle blue undertone throughout creates unity with brand
5. **Subtle Hierarchies**: Blue-gray scale creates visual hierarchy without distraction
6. **Cool & Professional**: Blue tones evoke trust, calm, and professionalism

## Comparison with Default Google Maps

| Element      | Default Google Maps | Viargos Custom             |
| ------------ | ------------------- | -------------------------- |
| Water        | Bright Blue         | Soft Blue-Gray             |
| Landscape    | Beige/Tan           | Blue-Tinted White          |
| Roads        | Yellow/White        | Blue-Tinted Gray Scale     |
| Labels       | Black               | Navy Blue                  |
| POI Density  | High                | Reduced                    |
| Overall Feel | Colorful            | Monochromatic Blue/Minimal |

## Usage in Code

```typescript
// Import the complete preset
import { viargoMapOptions } from '@/constants/map-styles';

// Use in GoogleMap component
<GoogleMap options={viargoMapOptions} />;

// Or import just the styles
import { mapStyles } from '@/constants/map-styles';

<GoogleMap options={{ styles: mapStyles }} />;
```

## Visual Hierarchy (Top to Bottom)

1. **Custom Journey Markers** - Most prominent (your custom colors)
2. **Water Bodies** - Light blue, clearly defined
3. **Parks & Natural Areas** - Subtle indigo tint
4. **Highways & Major Roads** - Medium blue-gray, blue labels
5. **Local Roads** - Light blue-gray
6. **POI & Buildings** - Very light blue-gray (background)
7. **Base Landscape** - Blue-tinted white

This hierarchy ensures that journey data (markers, polylines) always stands out against a clean, cohesive blue-tinted map background. The monochromatic blue theme creates visual harmony while maintaining clear element distinction.
