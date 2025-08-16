/**
 * Profile Layout - Special layout within dashboard that hides the right sidebar
 * This demonstrates how to create nested layouts in Next.js App Router
 */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 p-4 sm:p-6 max-w-none">
      {/* Profile pages don't show the right sidebar - just main content */}
      {children}
    </div>
  );
}
