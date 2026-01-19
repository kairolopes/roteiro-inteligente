export interface QuizAnswers {
  travelStyle: string;
  accommodation: string;
  pace: string;
  budget: string;
  duration: string;
  startDate: Date | null;
  destinations: string[];
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
  destinations: [],
  interests: [],
  travelWith: "",
  hasChildren: false,
  hasPet: "none",
  dietary: [],
  mobility: "",
};
