

export default function ConfirmDelete({
  isOpen,
  title = "Delete item",
  message = "Are you sure you want to delete this?",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-md w-80 p-4 shadow-lg">
        <h3 className="text-base font-semibold text-gray-800 mb-2">
          {title}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {message}
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-blue-600 text-sm border rounded hover:bg-blue-700"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}