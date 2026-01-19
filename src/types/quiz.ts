export interface QuizAnswers {
  travelStyle: string;
  accommodation: string;
  pace: string;
  budget: string;
  duration: string;
  startDate: Date | null;
  destination: string;
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
  destination: "",
  interests: [],
  travelWith: "",
  hasChildren: false,
  hasPet: "none",
  dietary: [],
  mobility: "none",
};
