export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin";
  classGroup?: string;
  avatar?: string;
}

export interface ReportSubmission {
  id: string;
  studentId: string;
  studentName: string;
  classGroup: string;
  title: string;
  companyName: string;
  submissionDate: string;
  fileName: string;
  fileSize: string;
  status: "pending" | "graded" | "rejected";
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedDate?: string;
}

export interface DatabaseStats {
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingValidation: number;
  averageGrade: number;
  totalStudents: number;
  classGroups: string[];
}

export interface UnitTestSuite {
  name: string;
  passed: boolean;
  output: string;
}

export interface UnitTestResults {
  timestamp: string;
  testsRun: number;
  assertions: number;
  failures: number;
  errors: number;
  suites: UnitTestSuite[];
  rawOutput: string;
}

export interface CompetitorAnalysis {
  name: string;
  description: string;
  features: string[];
  strengths: string[];
  limitations: string[];
  improvementsByUs: string;
}
