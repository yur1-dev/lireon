// types/index.ts

export type BookStatus = "to-read" | "reading" | "completed";

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  currentPage: number;
  totalPages: number;
  coverUrl?: string;
  startedAt?: string | Date;
  completedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId?: string;
}

export interface ReadingSession {
  id: string;
  date: string | Date;
  duration?: number;
  pagesRead?: number;
  bookId?: string;
  userId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  totalPagesRead?: number;
  dailyGoal?: number;
  weeklyGoal?: number;
  monthlyGoal?: number;
  streak?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AppData {
  user: User;
  books: Book[];
  sessions: ReadingSession[];
  hasSeenTutorial?: boolean;
}

// Extended types for components
export interface BookWithProgress extends Book {
  progress: number;
  pagesLeft: number;
}

export interface DailyStats {
  date: string;
  pagesRead: number;
  minutesRead: number;
  sessionsCount: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalPages: number;
  totalMinutes: number;
  totalSessions: number;
  dailyStats: DailyStats[];
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalPages: number;
  totalMinutes: number;
  totalSessions: number;
  booksCompleted: number;
  weeklyStats: WeeklyStats[];
}

// Props interfaces
export interface TimerCardProps {
  onTimerComplete?: (duration: number) => void;
}

export interface CalendarCardProps {
  sessions: ReadingSession[];
}

export interface ProgressGoalsTabsProps {
  userData: {
    name: string;
    streak: number;
    totalPagesRead?: number;
    dailyGoal?: number;
    weeklyGoal?: number;
    monthlyGoal?: number;
  };
  todayPages: number;
  weeklyPages: number;
  monthlyPages: number;
  books: Book[];
  sessions: ReadingSession[];
}

export interface BooksSectionProps {
  books: Book[];
  setBooks: (books: Book[]) => void;
  updateBook: (book: Book) => void;
  onSessionsUpdate?: () => void | Promise<void>;
}

export interface TutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Form data types
export interface BookFormData {
  title: string;
  author: string;
  totalPages: number;
  currentPage?: number;
  status?: BookStatus;
  coverUrl?: string;
}

export interface SessionFormData {
  bookId: string;
  pagesRead: number;
  duration?: number;
  date?: string | Date;
}

export interface UserGoalsFormData {
  dailyGoal?: number;
  weeklyGoal?: number;
  monthlyGoal?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export interface RegisterResponse {
  user: User;
  token?: string;
}

// Filter and sort types
export type BookFilterType = "all" | "to-read" | "reading" | "completed";
export type BookSortType = "recent" | "title" | "author" | "progress";

export interface BookFilters {
  filter: BookFilterType;
  sort: BookSortType;
  search?: string;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakDates: string[];
}
