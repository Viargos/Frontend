/**
 * LoaderExamples.tsx
 * 
 * This file demonstrates various ways to use the Loader component
 * throughout your Viargos application. You can copy these examples
 * and adapt them to your needs.
 */

"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Loader, { LoaderPresets } from "./Loader";

export default function LoaderExamples() {
  const [showFullPageLoader, setShowFullPageLoader] = useState(false);
  const [showCardLoader, setShowCardLoader] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Loader Component Examples</h1>

      {/* Example 1: Default Full Page Loader */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">1. Default Full Page Loader</h2>
        <button
          onClick={() => setShowFullPageLoader(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Show Full Page Loader
        </button>
        <AnimatePresence>
          {showFullPageLoader && (
            <Loader key="fullpage" />
          )}
        </AnimatePresence>
        {showFullPageLoader && (
          <button
            onClick={() => setShowFullPageLoader(false)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Hide Loader
          </button>
        )}
      </div>

      {/* Example 2: Custom Branded Loader */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">2. Custom Branded Loader</h2>
        <div className="p-4 border rounded-lg">
          <pre className="text-sm bg-gray-100 p-2 rounded">
{`<Loader
  text="MyApp"
  subtitle="Loading your content..."
  logoText="M"
  gradient={{
    from: "green-500",
    via: "blue-500", 
    to: "purple-500"
  }}
/>`}
          </pre>
        </div>
      </div>

      {/* Example 3: Small Inline Loader */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">3. Small Inline Loader</h2>
        <div className="bg-white border rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-4">Loading Content...</h3>
          <Loader
            size="sm"
            fullscreen={false}
            text="Please wait"
            subtitle=""
            className="py-4"
          />
        </div>
      </div>

      {/* Example 4: Card Loader */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">4. Card Loader</h2>
        <button
          onClick={() => setShowCardLoader(!showCardLoader)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Toggle Card Loader
        </button>
        {showCardLoader && (
          <div className="bg-white border rounded-lg max-w-md">
            {LoaderPresets.card({ 
              text: "Loading...",
              subtitle: "Fetching data"
            })}
          </div>
        )}
      </div>

      {/* Example 5: Different Sizes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">5. Different Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Small */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Small (sm)</h4>
            <Loader
              size="sm"
              fullscreen={false}
              text="Small"
              subtitle="Loading..."
              className="py-4"
            />
          </div>

          {/* Medium */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Medium (md)</h4>
            <Loader
              size="md"
              fullscreen={false}
              text="Medium"
              subtitle="Loading..."
              className="py-6"
            />
          </div>

          {/* Large */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Large (lg)</h4>
            <Loader
              size="lg"
              fullscreen={false}
              text="Large"
              subtitle="Loading..."
              className="py-8"
            />
          </div>
        </div>
      </div>

      {/* Example 6: Custom Colors */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">6. Custom Color Gradients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Ocean Theme</h4>
            <Loader
              size="md"
              fullscreen={false}
              text="Ocean"
              subtitle="Blue waves..."
              gradient={{
                from: "cyan-500",
                via: "blue-500",
                to: "indigo-600"
              }}
              className="py-6"
            />
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Sunset Theme</h4>
            <Loader
              size="md"
              fullscreen={false}
              text="Sunset"
              subtitle="Golden hour..."
              gradient={{
                from: "yellow-500",
                via: "orange-500",
                to: "red-500"
              }}
              className="py-6"
            />
          </div>
        </div>
      </div>

      {/* Example 7: Without Dots */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">7. Loader Without Dots</h2>
        <div className="bg-white border rounded-lg p-4 max-w-sm">
          <Loader
            size="md"
            fullscreen={false}
            text="Clean"
            subtitle="No dots animation"
            showDots={false}
            className="py-6"
          />
        </div>
      </div>

      {/* Usage Code Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">8. Common Usage Patterns</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Full Page Loading State:</h4>
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
{`import Loader from '@/components/common/Loader';

function MyPage() {
  const [loading, setLoading] = useState(true);
  
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <Loader key="loading" />
      ) : (
        <div key="content">
          {/* Your content */}
        </div>
      )}
    </AnimatePresence>
  );
}`}
            </pre>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">API Loading State:</h4>
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
{`function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  return (
    <div className="min-h-64">
      {loading ? (
        <Loader
          size="md"
          fullscreen={false}
          text="Fetching data"
          subtitle="Please wait..."
          className="py-12"
        />
      ) : (
        <div>{/* Render data */}</div>
      )}
    </div>
  );
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// Common React patterns with the Loader component
export const LoaderPatterns = {
  // For page transitions
  pageTransition: (isLoading: boolean, content: React.ReactNode) => (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <Loader key="page-loading" />
      ) : (
        <div key="page-content">{content}</div>
      )}
    </AnimatePresence>
  ),

  // For API calls
  apiLoading: (isLoading: boolean, data: any, error: string | null) => {
    if (error) return <div className="text-red-600">Error: {error}</div>;
    if (isLoading) return <Loader size="md" fullscreen={false} className="py-8" />;
    return <div>Data loaded: {JSON.stringify(data)}</div>;
  },

  // For card/component loading
  cardLoading: (isLoading: boolean, children: React.ReactNode) => (
    <div className="bg-white rounded-lg border">
      {isLoading ? (
        LoaderPresets.card({ text: "Loading...", subtitle: "" })
      ) : (
        children
      )}
    </div>
  )
};
