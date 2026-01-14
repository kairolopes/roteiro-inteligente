export interface QuizAnswers {
  travelStyle: string[];
  accommodation: string;
  pace: string;
  budget: string;
  duration: string;
  startDate: Date | null;
  destinations: string[];
  interests: string[];
  travelWith: string;
  dietary: string[];
  mobility: string;
}

export const defaultQuizAnswers: QuizAnswers = {
  travelStyle: [],
  accommodation: "",
  pace: "",
  budget: "",
  duration: "",
  startDate: null,
  destinations: [],
  interests: [],
  travelWith: "",
  dietary: [],
  mobility: "",
};
