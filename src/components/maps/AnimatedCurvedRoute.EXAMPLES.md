# AnimatedCurvedRoute - All Animation Modes Examples

This document shows all three animation modes with code examples and use cases.

---

## 🎯 Three Animation Modes

### 1. Sequential Mode (Draw → Travel)
**Best for**: Storytelling, journey visualization, presentations

**What happens**:
1. Path draws from start to end (smooth line animation)
2. Once complete, a dot starts traveling along the path
3. Dot loops infinitely

**Code Example**:
```tsx
<AnimatedCurvedRoute
  map={mapInstance}
  from={{ lat: 48.8566, lng: 2.3522 }} // Paris
  to={{ lat: 41.9028, lng: 12.4964 }}   // Rome
  color="#3b82f6"
  animationMode="sequential"
  animationSpeed={2.5}
  travelingDotSize={10}
  showMarkers={true}
/>
```

**Visual Effect**:
```
Start Marker → -------- (path draws) --------→ End Marker
               ⚫ (dot appears and travels)
```

---

### 2. Traveling Mode (Dot Travels)
**Best for**: Active tracking, real-time updates, status indicators

**What happens**:
1. Static dotted path appears immediately (semi-transparent)
2. Colored dot travels along the path from start to end
3. Loops infinitely

**Code Example**:
```tsx
<AnimatedCurvedRoute
  map={mapInstance}
  from={{ lat: 48.8566, lng: 2.3522 }}
  to={{ lat: 41.9028, lng: 12.4964 }}
  color="#10b981"
  animationMode="traveling"
  animationSpeed={3}
  travelingDotSize={10}
  strokeWidth={3}
  dashLength={12}
  gapLength={8}
  showMarkers={true}
/>
```

**Visual Effect**:
```
Start Marker → ····················· (static) → End Marker
               ⚫ (dot travels immediately)
```

---

### 3. Continuous Mode (Flowing Line)
**Best for**: Network visualization, data flow, ambient effects

**What happens**:
1. Dotted line appears and flows continuously
2. Creates "traveling dashes" effect
3. No traveling dot, just the animated line pattern
4. Loops infinitely

**Code Example**:
```tsx
<AnimatedCurvedRoute
  map={mapInstance}
  from={{ lat: 48.8566, lng: 2.3522 }}
  to={{ lat: 41.9028, lng: 12.4964 }}
  color="#f59e0b"
  animationMode="continuous"
  animationSpeed={2}
  strokeWidth={3}
  dashLength={12}
  gapLength={8}
  showMarkers={true}
/>
```

**Visual Effect**:
```
Start Marker → ···→··→··→··→··→··→ (flowing dashes) → End Marker
```

---

## 📊 Comparison Table

| Feature | Sequential | Traveling | Continuous |
|---------|-----------|-----------|------------|
| Path Animation | ✅ Draws once | ❌ Static | ❌ Static |
| Traveling Dot | ✅ After path draws | ✅ Immediate | ❌ None |
| Line Animation | ❌ None | ❌ None | ✅ Flowing dashes |
| Start/End Markers | ✅ Yes | ✅ Yes | ✅ Yes |
| Loop Type | Dot loops | Dot loops | Line flows |
| Best Performance | Medium | High | High |
| Visual Impact | High (storytelling) | Medium | Medium |

---

## 🎨 Real-World Use Cases

### Use Case 1: Travel Blog Journey
```tsx
// Show user's travel journey with sequential animation
const journeyStops = [
  { id: 1, from: paris, to: rome, date: "May 1" },
  { id: 2, from: rome, to: barcelona, date: "May 5" },
  { id: 3, from: barcelona, to: london, date: "May 10" }
];

{journeyStops.map(stop => (
  <AnimatedCurvedRoute
    key={stop.id}
    map={map}
    from={stop.from}
    to={stop.to}
    color="#3b82f6"
    animationMode="sequential"  // 👈 Path draws, then travels
    animationSpeed={3}
  />
))}
```

### Use Case 2: Live Flight Tracker
```tsx
// Show active flights in real-time
{activeFlights.map(flight => (
  <AnimatedCurvedRoute
    key={flight.id}
    map={map}
    from={flight.origin}
    to={flight.destination}
    color={flight.airline.color}
    animationMode="traveling"  // 👈 Immediate dot movement
    animationSpeed={flight.duration / 60} // Scale to real time
    travelingDotSize={12}
  />
))}
```

### Use Case 3: Network Data Flow
```tsx
// Show data flowing between servers
{networkRoutes.map(route => (
  <AnimatedCurvedRoute
    key={route.id}
    map={map}
    from={route.serverA}
    to={route.serverB}
    color={route.status === "active" ? "#10b981" : "#ef4444"}
    animationMode="continuous"  // 👈 Flowing line effect
    animationSpeed={1.5}
    strokeWidth={2}
  />
))}
```

### Use Case 4: E-commerce Delivery Routes
```tsx
// Show package delivery journey
<AnimatedCurvedRoute
  map={map}
  from={warehouse}
  to={customerLocation}
  color={deliveryStatus === "in-transit" ? "#f59e0b" : "#10b981"}
  animationMode="sequential"
  animationSpeed={2}
  travelingDotSize={14}
  showMarkers={true}
  markerRadius={8}
/>
```

---

## 🎛️ Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `map` | `MapInstance` | **required** | Google Maps instance |
| `from` | `LatLng` | **required** | Start point `{ lat, lng }` |
| `to` | `LatLng` | **required** | End point `{ lat, lng }` |
| `animationMode` | `"sequential" \| "traveling" \| "continuous"` | `"continuous"` | Animation type |
| `color` | `string` | `"#3b82f6"` | Path/dot color |
| `animationSpeed` | `number` | `2` | Duration in seconds |
| `strokeWidth` | `number` | `3` | Path line thickness |
| `dashLength` | `number` | `12` | Dash length (for dotted lines) |
| `gapLength` | `number` | `8` | Gap between dashes |
| `showMarkers` | `boolean` | `true` | Show start/end markers |
| `markerRadius` | `number` | `6` | Marker size |
| `travelingDotSize` | `number` | `8` | Traveling dot size |
| `curvature` | `number` | `0.35` | Curve intensity (0-1) |

---

## 💡 Tips & Best Practices

### Performance
- **Limit concurrent routes**: Keep under 20 routes for smooth performance
- **Use appropriate speed**: 2-4 seconds is optimal for most cases
- **Match mode to use case**:
  - Sequential: One-time storytelling
  - Traveling: Real-time tracking
  - Continuous: Ambient background

### Visual Design
- **Color coding**: Use consistent colors for route categories
- **Marker size**: Larger markers (8-10px) for important locations
- **Curve intensity**: 0.3-0.4 works well for most geographic distances
- **Animation speed**: Faster for short distances, slower for long journeys

### Accessibility
- Use high-contrast colors for visibility
- Provide text alternatives for screen readers
- Consider adding pause/play controls for users who prefer reduced motion

---

## 🔧 Customization Examples

### Rainbow Routes
```tsx
const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

{routes.map((route, index) => (
  <AnimatedCurvedRoute
    key={route.id}
    map={map}
    from={route.from}
    to={route.to}
    color={colors[index % colors.length]}
    animationMode="sequential"
    animationSpeed={2 + (index * 0.5)} // Stagger timing
  />
))}
```

### Pulsing Start Marker
```tsx
// Add CSS animation for pulsing effect
<style>
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
  }
  .pulse-marker {
    animation: pulse 2s ease-in-out infinite;
  }
</style>

// Then customize marker rendering in component
```

### Variable Speed Routes
```tsx
// Faster animation for shorter distances
const calculateSpeed = (from: LatLng, to: LatLng) => {
  const distance = Math.sqrt(
    Math.pow(to.lat - from.lat, 2) +
    Math.pow(to.lng - from.lng, 2)
  );
  return Math.max(1.5, Math.min(4, distance * 10));
};

<AnimatedCurvedRoute
  animationSpeed={calculateSpeed(from, to)}
  // ... other props
/>
```

---

## 🎬 Demo Component

See `AnimatedRouteDemo.tsx` for a complete interactive demo with mode toggle.

Features:
- ✅ Real-time mode switching
- ✅ Three example routes (Paris → Rome → Barcelona → London)
- ✅ Color-coded legend
- ✅ Responsive design
- ✅ Clean UI with badges

---

## 📝 Notes

- All modes automatically sync with map zoom/pan/resize
- Animations use native SVG and CSS for optimal performance
- Component is SSR-safe for Next.js
- Works with Google Maps, Mapbox, and Leaflet
- TypeScript definitions included

---

## 🤝 Contributing

To add a new animation mode:
1. Add mode to `AnimatedCurvedRouteProps` type
2. Implement animation logic in `AnimatedCurvedRoute.tsx`
3. Add CSS keyframes if needed in `globals.css`
4. Update this documentation with examples

---

Built with ❤️ for Viargos
