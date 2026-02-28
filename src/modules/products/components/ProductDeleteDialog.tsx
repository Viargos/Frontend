'use client';

type ProductDeleteDialogProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  productName: string;
};

export function ProductDeleteDialog(props: ProductDeleteDialogProps) {
  const { isOpen, isSubmitting = false, onCancel, onConfirm, productName } = props;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">Delete Product</h2>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete
          {' '}
          <span className="font-semibold">{productName}</span>
          ?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-md border border-gray-300 px-3 py-2 text-sm" onClick={onCancel} type="button">Cancel</button>
          <button
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onConfirm}
            type="button"
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
