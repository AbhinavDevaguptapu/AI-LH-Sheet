
export interface AnalysisResult {
  matchPercentage: number;
  status: "Meets criteria" | "Needs improvement";
  rationale: string;
}

export enum AnalysisStatus {
  PENDING = 'PENDING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Task {
  id: number;
  rawText: string;
  analysis: AnalysisResult | null;
  status: AnalysisStatus;
}
