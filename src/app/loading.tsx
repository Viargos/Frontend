export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-[#160E53]"
          aria-hidden
        />
        <p className="text-gray-600" role="status" aria-live="polite">
          Loading...
        </p>
      </div>
    </div>
  );
}
