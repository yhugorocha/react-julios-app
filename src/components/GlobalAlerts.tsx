import { useFeedbackStore } from "../store/feedbackStore";

function GlobalAlerts() {
  const messages = useFeedbackStore((state) => state.messages);
  const dismiss = useFeedbackStore((state) => state.dismiss);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="alert-stack" role="status" aria-live="polite">
      {messages.map((message) => (
        <div
          key={message.id}
          className={message.kind === "error" ? "alert alert-error" : "alert alert-success"}
        >
          <span>{message.text}</span>
          <button
            type="button"
            className="alert-close"
            aria-label="Fechar mensagem"
            onClick={() => dismiss(message.id)}
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}

export default GlobalAlerts;

