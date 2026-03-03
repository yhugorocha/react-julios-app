interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  isLoading = false,
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirm-overlay" role="presentation" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-description">{description}</p>

        <div className="confirm-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={tone === "danger" ? "btn btn-danger-outline" : "btn btn-primary"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
