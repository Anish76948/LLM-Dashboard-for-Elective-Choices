export type Role = "student" | "admin" | "faculty";

export interface WaiverRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  electiveId: string;
  electiveTitle: string;
  missingPrereq: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export type Elective = {
  id: string; title: string; dept: string; credits: number;
  capacity: number; enrolled: number;
  difficulty: "easy" | "medium" | "hard";
  prereqs: string[]; description: string; tags: string[];
  day: string; start: string; end: string;
};

export type ChoiceStatus = "confirmed" | "waitlist" | "blocked";

export type Choice = {
  id: string; elective: Elective; preference: number;
  status: ChoiceStatus; reason?: string;
};

export type Recommendation = {
  elective: string; match_score: number; reason: string; seat_chance: number;
};

export type AdvisorResponse = {
  recommendations: Recommendation[];
  rejected: { elective: string; reason: string }[];
};

export type Analytics = {
  perElective: { title: string; choices: number; capacity: number }[];
  deptSplit: { dept: string; count: number }[];
  waitlistTotal: number;
};
