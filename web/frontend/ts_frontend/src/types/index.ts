export interface User {
  id: string;
  mail: string;
  username: string;
  profileImage?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  mail: string;
  username: string;
  psw: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Stats {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  goalsScored: number;
  tournamentsWon: number;
  rank: number;
}

export type RouteHandler = () => void;

export interface Route {
  path: string;
  handler: RouteHandler;
  requiresAuth?: boolean;
}
