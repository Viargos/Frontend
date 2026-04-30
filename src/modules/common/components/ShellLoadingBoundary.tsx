export const ShellLoadingBoundary = () => {
  return (
    <div
      aria-busy="true"
      className="flex min-h-[40vh] items-center justify-center bg-gray-50"
      role="status"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#160E53]"
          aria-hidden
        />
        <span className="sr-only">Initializing workspace</span>
      </div>
    </div>
  );
};
