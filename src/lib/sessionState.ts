import { QuizAnswers } from "@/types/quiz";
import { Itinerary } from "@/types/itinerary";

/**
 * Helper único para o estado de fluxo do usuário entre páginas.
 * Evita strings mágicas e parses duplicados de sessionStorage.
 */

const KEYS = {
  quiz: "quizAnswers",
  itinerary: "generatedItinerary",
  chatSummary: "chatSummary",
} as const;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const sessionState = {
  // Quiz
  getQuiz(): QuizAnswers | null {
    return safeParse<QuizAnswers>(sessionStorage.getItem(KEYS.quiz));
  },
  setQuiz(answers: QuizAnswers) {
    sessionStorage.setItem(KEYS.quiz, JSON.stringify(answers));
  },
  clearQuiz() {
    sessionStorage.removeItem(KEYS.quiz);
  },

  // Itinerary
  getItinerary(): Itinerary | null {
    return safeParse<Itinerary>(sessionStorage.getItem(KEYS.itinerary));
  },
  setItinerary(it: Itinerary) {
    sessionStorage.setItem(KEYS.itinerary, JSON.stringify(it));
  },
  clearItinerary() {
    sessionStorage.removeItem(KEYS.itinerary);
  },

  // Chat summary (legado, mantido por compatibilidade)
  getChatSummary(): string {
    return sessionStorage.getItem(KEYS.chatSummary) || "";
  },
  setChatSummary(s: string) {
    sessionStorage.setItem(KEYS.chatSummary, s);
  },
  clearChatSummary() {
    sessionStorage.removeItem(KEYS.chatSummary);
  },

  // Reset completo do fluxo
  clearAll() {
    sessionStorage.removeItem(KEYS.quiz);
    sessionStorage.removeItem(KEYS.itinerary);
    sessionStorage.removeItem(KEYS.chatSummary);
  },
};
