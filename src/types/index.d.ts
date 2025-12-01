// types/index.d.ts  ← CREATE OR UPDATE THIS FILE
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Book {
  id: string | number;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: "to-read" | "reading" | "finished";
}

export interface Session {
  id: string;
  date: string;
  pagesRead: number;
  duration?: number;
}

export interface AppData {
  user: User;
  books: Book[];
  sessions: Session[];
  hasSeenTutorial: boolean;
}

export interface DashboardUserData {
  name: string;
}
