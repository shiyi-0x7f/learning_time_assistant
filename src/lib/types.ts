export type PlanStatus = 'active' | 'completed';

export type Plan = {
  id: string;
  subject: string;
  grade: string;
  term: string;
  totalTopics: number;
  dailyTime: number; // in minutes
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  restDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  status: PlanStatus;
  createdAt: string;
  topics: Topic[];
};

export type TopicStatus = 'pending' | 'completed';

export type Topic = {
  id: string;
  title: string;
  assignedDate: string; // YYYY-MM-DD
  status: TopicStatus;
};
