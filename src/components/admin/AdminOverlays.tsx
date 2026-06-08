"use client";

type FeedbackType = "error" | "success";

function Spinner() {
  return (
    <div
      className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-brand"
      aria-hidden
    />
  );
}

export function AdminLoadingOverlay({ label = "Chargement..." }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="card flex w-full max-w-sm flex-col items-center gap-4 px-8 py-10 text-center">
        <Spinner />
        <p className="text-sm font-medium text-neutral-700">{label}</p>
      </div>
    </div>
  );
}

export function AdminFeedbackModal({
  type,
  message,
  onClose,
}: {
  type: FeedbackType;
  message: string;
  onClose: () => void;
}) {
  const isError = type === "error";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="admin-feedback-title"
      aria-describedby="admin-feedback-message"
      onClick={onClose}
    >
      <div
        className={[
          "card w-full max-w-md p-6",
          isError ? "border-red-200" : "border-green-200",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg",
              isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700",
            ].join(" ")}
            aria-hidden
          >
            {isError ? "!" : "✓"}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p
              id="admin-feedback-title"
              className={[
                "text-base font-semibold",
                isError ? "text-red-800" : "text-green-800",
              ].join(" ")}
            >
              {isError ? "Erreur" : "Succès"}
            </p>
            <p id="admin-feedback-message" className="mt-1 text-sm text-neutral-700">
              {message}
            </p>
          </div>
        </div>
        <button type="button" className="button-primary mt-5 w-full" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
