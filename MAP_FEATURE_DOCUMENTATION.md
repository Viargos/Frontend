# Journey Map Feature Documentation

This document outlines the comprehensive map feature integrated into the Profile page that allows users to view all their journeys on a single interactive map with filtering capabilities.

## 🗺️ Feature Overview

The Journey Map feature provides users with a centralized view of all their travel journeys on an interactive Google Map, accessible through the "Map" tab in their Profile page. It includes year-based filtering and detailed journey cards.

### Key Features

1. **All Journeys View**: Display all user journeys on a single map
2. **Year Filtering**: Filter journeys by creation year
3. **Interactive Journey Cards**: Detailed cards that appear when clicking on journey markers
4. **Journey Details**: Show individual places when a journey is selected
5. **Optimized Performance**: Uses the Google Maps optimizations for reduced API costs

## 📁 File Structure

```
frontend/src/
├── app/(dashboard)/profile/
│   └── page.tsx                   # Profile page with integrated map tab
├── components/maps/
│   ├── AllJourneysMap.tsx         # Core map component for multiple journeys
│   ├── YearFilter.tsx             # Year filtering dropdown component
│   └── JourneyCard.tsx            # Journey detail card component
└── components/profile/
    └── ProfileTabs.tsx            # Profile tabs including map tab
```

## 🎯 Component Details

### 1. Map Page (`/map/page.tsx`)

**Purpose**: Main container page for the map feature

**Key Features**:

- Fetches user's journeys on mount
- Manages year filtering state
- Handles journey selection and card display
- Provides empty states for no journeys

**Props**: None (uses global state)

**State Management**:

- `selectedYear`: Currently selected filter year
- `selectedJourney`: Journey selected for detailed view
- `showJourneyCard`: Controls journey card visibility

### 2. AllJourneysMap Component

**Purpose**: Core map rendering with multiple journey support

**Key Features**:

- Displays journey start markers for all journeys
- Shows detailed places when a journey is selected
- Draws polylines connecting places in selected journeys
- Handles marker interactions

**Props**:

```typescript
interface AllJourneysMapProps {
  journeys: Journey[];
  onJourneyClick: (journey: Journey) => void;
  selectedJourney?: Journey | null;
}
```

**Marker Types**:

- **Journey Start Markers**: Orange location pins with "J" indicator
- **Place Markers**: Colored circles based on place type (stay, activity, food, etc.)

### 3. YearFilter Component

**Purpose**: Dropdown filter for selecting journey years

**Key Features**:

- Automatically extracts available years from journeys
- Animated dropdown with smooth transitions
- "All Years" option to show everything
- Visual indicators for selected year

**Props**:

```typescript
interface YearFilterProps {
  availableYears: number[];
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
}
```

### 4. JourneyCard Component

**Purpose**: Detailed journey information modal

**Key Features**:

- Journey cover image or gradient placeholder
- Journey statistics (duration, places count)
- Creator information and creation date
- Action buttons (View Journey, Close)

**Props**:

```typescript
interface JourneyCardProps {
  journey: Journey;
  onClose: () => void;
}
```

## 🎨 User Interface Design

### Color Scheme

- **Journey Start Markers**: `#FF6B35` (Orange)
- **Place Types**:
  - Stay: `#4ECDC4` (Teal)
  - Activity: `#45B7D1` (Blue)
  - Food: `#96CEB4` (Green)
  - Transport: `#6B66FF` (Purple)
  - Note: `#FF6B6B` (Red)

### Responsive Design

- **Desktop**: Full sidebar navigation with map tab
- **Mobile**: Bottom navigation with map icon
- **Tablet**: Responsive layout with touch-friendly interactions

## 🔄 User Flow

### 1. Accessing the Map

```
Dashboard → Profile Page → Map Tab → Map View
```

### 2. Viewing Journeys

```
Map Tab → See all journey markers → Filter by year (optional)
```

### 3. Journey Details

```
Click Journey Marker → Journey Card Opens → View Details or Close
```

### 4. Detailed Journey View

```
Journey Card → "View Journey" → Navigate to Journey Details Page
```

## 🚀 Performance Optimizations

### 1. Google Maps API Optimizations

- Uses optimized field selection for Places API
- Implements request caching for repeated queries
- Session tokens for cost reduction
- Disabled unnecessary map features (clickable icons)

### 2. React Optimizations

- Memoized coordinate calculations
- Efficient re-rendering with useMemo and useCallback
- Lazy loading of journey details
- Optimized marker rendering

### 3. Data Management

- Filters applied client-side for instant response
- Minimal API calls with smart caching
- Efficient coordinate generation for mock data

## 📊 Data Flow

### 1. Journey Data Fetching

```typescript
useEffect(() => {
  if (user) {
    fetchJourneys(); // From journey store
  }
}, [user, fetchJourneys]);
```

### 2. Year Extraction

```typescript
const availableYears = useMemo(() => {
  const years = new Set<number>();
  journeys.forEach(journey => {
    if (journey.createdAt) {
      const year = new Date(journey.createdAt).getFullYear();
      years.add(year);
    }
  });
  return Array.from(years).sort((a, b) => b - a);
}, [journeys]);
```

### 3. Journey Filtering

```typescript
const filteredJourneys = useMemo(() => {
  if (!selectedYear) return journeys;

  return journeys.filter(journey => {
    if (!journey.createdAt) return false;
    const journeyYear = new Date(journey.createdAt).getFullYear();
    return journeyYear === selectedYear;
  });
}, [journeys, selectedYear]);
```

## 🎯 Interactive Features

### 1. Map Interactions

- **Zoom to Fit**: Automatically fits all journey markers in view
- **Marker Clustering**: Prevents overlap with smart positioning
- **Polyline Connections**: Shows journey paths for selected journeys

### 2. Filter Interactions

- **Year Dropdown**: Smooth animations with backdrop
- **Real-time Filtering**: Instant updates without API calls
- **Clear Filters**: Easy reset to "All Years" view

### 3. Journey Card Interactions

- **Modal Overlay**: Backdrop click to close
- **Action Buttons**: Navigate to journey details or close
- **Responsive Design**: Adapts to screen size

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Map Configuration

```typescript
options={{
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  gestureHandling: 'cooperative',
  clickableIcons: false, // Reduces API costs
  restriction: {
    latLngBounds: {
      north: 85, south: -85,
      west: -180, east: 180,
    },
  },
}}
```

## 🎨 Styling Guidelines

### Animation Patterns

- **Page Transitions**: 0.6s duration with easeOut
- **Component Animations**: 0.3s for modals, 0.2s for interactions
- **Staggered Animations**: Delayed animations for better UX

### Responsive Breakpoints

- **Mobile**: `< 640px` - Bottom navigation, full-width cards
- **Tablet**: `640px - 1024px` - Narrow sidebar, responsive cards
- **Desktop**: `> 1024px` - Full sidebar, optimized layout

## 🚀 Future Enhancements

### 1. Advanced Filtering

- Filter by journey duration
- Filter by number of places
- Filter by journey type/category
- Search by journey title or location

### 2. Enhanced Interactions

- Journey clustering for dense areas
- Heat map view for popular locations
- Journey comparison mode
- Sharing journey locations

### 3. Performance Improvements

- Virtual scrolling for large journey lists
- Progressive loading of journey details
- Service worker caching for offline support
- Image optimization for journey covers

### 4. Analytics Integration

- Track most viewed journeys
- Popular location analytics
- User engagement metrics
- Journey completion rates

## 🛠️ Development Notes

### Testing Considerations

- Test with various journey counts (0, 1, many)
- Test year filtering edge cases
- Test map interactions on different devices
- Verify Google Maps API error handling

### Accessibility Features

- Keyboard navigation for filters
- Screen reader support for map markers
- High contrast mode compatibility
- Touch-friendly interaction areas

### Browser Compatibility

- Modern browsers with ES6+ support
- Google Maps JavaScript API compatibility
- Responsive design across devices
- Progressive enhancement for older browsers

---

**Note**: This feature integrates seamlessly with existing Google Maps optimizations and provides a comprehensive view of user journeys while maintaining performance and cost efficiency.
