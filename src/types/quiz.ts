export interface QuizAnswers {
  travelStyle: string;
  accommodation: string;
  pace: string;
  budget: string;
  duration: string;
  startDate: Date | null;
  endDate: Date | null;
  destination: string;
  destinations: string[]; // Múltiplos países (até 3)
  destinationDetails: string; // Região/cidades específicas
  customRequests: string; // Desejos especiais do usuário
  interests: string[];
  travelWith: string;
  hasChildren: boolean;
  hasPet: string;
  dietary: string[];
  mobility: string;
}

export const defaultQuizAnswers: QuizAnswers = {
  travelStyle: "",
  accommodation: "",
  pace: "",
  budget: "",
  duration: "",
  startDate: null,
  endDate: null,
  destination: "",
  destinations: [],
  destinationDetails: "",
  customRequests: "",
  interests: [],
  travelWith: "",
  hasChildren: false,
  hasPet: "none",
  dietary: [],
  mobility: "none",
};
