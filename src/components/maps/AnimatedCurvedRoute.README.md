# AnimatedCurvedRoute Component

A reusable, performant React component for rendering animated curved dotted paths on maps (Mapbox, Google Maps, Leaflet).

## Features

- ✅ Smooth Bezier curve animation
- ✅ Infinite stroke-dashoffset animation
- ✅ Automatically syncs with map zoom/pan/resize
- ✅ SSR-safe for Next.js
- ✅ TypeScript support
- ✅ Tailwind CSS styling
- ✅ Multiple routes support
- ✅ Zero dependencies (except map library)
- ✅ Performant (no canvas, no heavy libraries)

---

## Installation

No additional dependencies required! Just copy the component files:

```
src/components/maps/
├── AnimatedCurvedRoute.tsx
├── AnimatedCurvedRoute.types.ts
└── MapWithAnimatedRoutes.example.tsx
```

Add the animation CSS to `globals.css` (already included if you copied the component).

---

## Quick Start

### Basic Usage

```tsx
import { AnimatedCurvedRoute } from '@/components/maps/AnimatedCurvedRoute';

function MyMap() {
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Initialize your map
    const mapInstance = new mapboxgl.Map({ ... });
    setMap(mapInstance);
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div id="map" className="w-full h-full" />

      {map && (
        <AnimatedCurvedRoute
          map={map}
          from={{ lat: 40.7128, lng: -74.0060 }}
          to={{ lat: 34.0522, lng: -118.2437 }}
        />
      )}
    </div>
  );
}
```

### Multiple Routes

```tsx
const routes = [
  { id: '1', from: { lat: 40.71, lng: -74.01 }, to: { lat: 34.05, lng: -118.24 } },
  { id: '2', from: { lat: 51.51, lng: -0.13 }, to: { lat: 48.86, lng: 2.35 } },
];

return (
  <>
    {map && routes.map(route => (
      <AnimatedCurvedRoute
        key={route.id}
        map={map}
        from={route.from}
        to={route.to}
        color="#3b82f6"
      />
    ))}
  </>
);
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `map` | `MapInstance` | **required** | Map instance (Mapbox/Google/Leaflet) |
| `from` | `LatLng` | **required** | Starting point `{ lat, lng }` |
| `to` | `LatLng` | **required** | Ending point `{ lat, lng }` |
| `curvature` | `number` | `0.35` | Curve intensity (0-1) |
| `strokeWidth` | `number` | `3` | Path thickness in pixels |
| `dashLength` | `number` | `12` | Length of each dash |
| `gapLength` | `number` | `8` | Gap between dashes |
| `animationSpeed` | `number` | `2` | Animation duration in seconds |
| `color` | `string` | `"#3b82f6"` | Path color (CSS color) |

---

## How It Works

### 1. Coordinate Projection

The component converts geographic coordinates to screen coordinates:

```typescript
const startPoint = map.project([from.lng, from.lat]);
const endPoint = map.project([to.lng, to.lat]);
```

**Zoom/Pan Syncing:**
- Component listens to map events (`zoom`, `move`, `resize`)
- Recalculates path whenever map changes
- Always sticks to correct geographic positions

### 2. Bezier Curve Calculation

Creates a smooth curved path using quadratic Bezier curve:

```typescript
// Calculate midpoint
const midX = (startPoint.x + endPoint.x) / 2;
const midY = (startPoint.y + endPoint.y) / 2;

// Calculate perpendicular offset for control point
const dx = endPoint.x - startPoint.x;
const dy = endPoint.y - startPoint.y;
const distance = Math.sqrt(dx * dx + dy * dy);

// Create control point perpendicular to line
const perpX = -dy;
const perpY = dx;
const curveOffset = distance * curvature;

const controlX = midX + (perpX / length) * curveOffset;
const controlY = midY + (perpY / length) * curveOffset;

// SVG path: M (move to start) Q (quadratic curve)
const d = `M ${startPoint.x} ${startPoint.y} Q ${controlX} ${controlY} ${endPoint.x} ${endPoint.y}`;
```

**Why it curves upward:**
- Control point is perpendicular to the straight line
- Distance between points affects curve size
- `curvature` prop controls curve intensity

### 3. Animation

Uses CSS `stroke-dashoffset` animation for traveling effect:

```css
@keyframes dash {
  to {
    stroke-dashoffset: -100;
  }
}

.animate-dotted-path {
  animation: dash var(--animation-speed, 2s) linear infinite;
}
```

**How it works:**
- `stroke-dasharray="12 8"` creates dotted line (12px dash, 8px gap)
- `stroke-dashoffset` shifts the pattern
- Animating offset creates traveling effect
- Infinite loop = continuous animation

---

## Map Integration

### Mapbox

```typescript
import mapboxgl from 'mapbox-gl';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-74.006, 40.7128],
  zoom: 10
});

map.on('load', () => {
  setMap(map);
});
```

### Google Maps

```typescript
const map = new google.maps.Map(document.getElementById('map'), {
  center: { lat: 40.7128, lng: -74.006 },
  zoom: 10
});

setMap(map);
```

### Leaflet

```typescript
import L from 'leaflet';

const map = L.map('map').setView([40.7128, -74.006], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

setMap(map);
```

---

## Performance Optimizations

### 1. **useCallback for Path Calculation**
- Memoizes `calculatePath` function
- Prevents unnecessary recalculations
- Only recalculates when dependencies change

### 2. **Debounced Map Events**
- Map events can fire rapidly during pan/zoom
- Component handles this efficiently
- Uses React's built-in optimization

### 3. **CSS Animations (Not JavaScript)**
- Offloaded to GPU
- Smooth 60fps animation
- No JavaScript animation loop

### 4. **SVG (Not Canvas)**
- Better for small number of paths
- Easier to debug
- Native browser rendering
- Responsive to CSS

### 5. **Lazy Path Length Calculation**
- `getTotalLength()` called after render
- Doesn't block initial render
- Calculates once per path change

---

## Common Use Cases

### Travel Route Visualization
```tsx
<AnimatedCurvedRoute
  from={departure}
  to={destination}
  color="#3b82f6"
  animationSpeed={3}
/>
```

### Journey Timeline
```tsx
{journeyStops.map((stop, i) => (
  i < journeyStops.length - 1 && (
    <AnimatedCurvedRoute
      key={i}
      from={stop}
      to={journeyStops[i + 1]}
      color={getColorByTime(stop.time)}
    />
  )
))}
```

### Flight Path Network
```tsx
{flights.map(flight => (
  <AnimatedCurvedRoute
    key={flight.id}
    from={flight.origin}
    to={flight.destination}
    curvature={0.4}
    color={flight.airline.color}
  />
))}
```

---

## Troubleshooting

### Animation not working?
- Ensure `globals.css` includes the keyframe animation
- Check that Tailwind is processing the CSS
- Verify `animate-dotted-path` class is applied

### Path not updating on zoom?
- Verify map event listeners are set up correctly
- Check map instance has `on`/`addListener` method
- Ensure map is passed as prop correctly

### Path not visible?
- Check z-index (component uses z-10 by default)
- Verify color contrast with map
- Ensure coordinates are valid

### Multiple routes causing performance issues?
- Limit number of concurrent routes (< 20 recommended)
- Consider showing routes on demand (viewport culling)
- Use `React.memo` to prevent unnecessary re-renders

---

## Advanced Customization

### Custom Curve Algorithm
```tsx
// Modify calculatePath in AnimatedCurvedRoute.tsx
// Use cubic Bezier for S-curves
const d = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${end.x} ${end.y}`;
```

### Directional Animation
```tsx
// Add arrow at end of path
<marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
  <polygon points="0 0, 10 3, 0 6" fill={color} />
</marker>
<path markerEnd="url(#arrow)" ... />
```

### Gradient Colors
```tsx
<defs>
  <linearGradient id="gradient">
    <stop offset="0%" stopColor="#3b82f6" />
    <stop offset="100%" stopColor="#10b981" />
  </linearGradient>
</defs>
<path stroke="url(#gradient)" ... />
```

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires browser support for:
- SVG
- CSS animations
- `getTotalLength()`

---

## License

MIT - Feel free to use in your projects!

---

## Credits

Built for Viargos travel platform with ❤️
