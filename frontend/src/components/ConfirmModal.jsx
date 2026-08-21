import './ConfirmModal.css'

function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    onConfirm,
    onCancel,
}) {
    if (!open) {
        return null
    }

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="confirm-modal-title">{title}</h2>
                {message && <p className="confirm-modal-message">{message}</p>}
                <div className="confirm-modal-actions">
                    <button type="button" className="confirm-modal-cancel" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={danger ? 'confirm-modal-confirm confirm-modal-danger' : 'confirm-modal-confirm'}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
