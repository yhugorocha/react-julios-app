import { create } from "zustand";

type FeedbackKind = "error" | "success";

interface FeedbackMessage {
  id: number;
  kind: FeedbackKind;
  text: string;
}

interface FeedbackState {
  messages: FeedbackMessage[];
  pushError: (text: string) => void;
  pushSuccess: (text: string) => void;
  dismiss: (id: number) => void;
}

function nextId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  messages: [],
  pushError: (text) => {
    const id = nextId();
    set((state) => ({
      messages: [...state.messages, { id, kind: "error", text }],
    }));
    setTimeout(() => get().dismiss(id), 5000);
  },
  pushSuccess: (text) => {
    const id = nextId();
    set((state) => ({
      messages: [...state.messages, { id, kind: "success", text }],
    }));
    setTimeout(() => get().dismiss(id), 5000);
  },
  dismiss: (id) =>
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    })),
}));

