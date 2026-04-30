import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <span aria-hidden="true" className="text-2xl leading-none text-red-600">x</span>
        </div>

        <h2 className="mb-0 block h-[49px] w-[193px] text-center text-[14px] leading-[49px] font-normal text-black">
          Page not found
        </h2>

        <p className="mb-6 text-center text-gray-600">
          The page you are looking for does not exist.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
