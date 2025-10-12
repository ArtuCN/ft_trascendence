export interface User {
  id: string;
  mail: string;
  username: string;
  profileImage?: string;
}

export interface LoginRequest {
  mail: string;
  psw: string;
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

export interface Match {
  id: number;
  id_tournament: number;
  date_time: string;
  users_ids: number[];
  users_goal_scored: number[];
  users_goal_taken: number[];
}

export interface CreateMatchRequest {
  id_tournament: number;
  users_ids: number[];
  users_goal_scored: number[];
  users_goal_taken: number[];
}

export interface Tournament {
  id: number;
  tournament_name: string;
  start_time?: string;
  end_time?: string;
  id_winner?: number;
}

export interface Friendship {
  id_user1: number;
  id_user2: number;
}

export interface HeartbeatResponse {
  last_active: string;
}

// Blockchain types
export interface GameData {
  user_ids: bigint[];
  user_wallets: string[];
  user_scores: bigint[];
  winner_ids: bigint[];
  game_id: bigint;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
}

export interface BlockchainGameData {
  user_ids: number[];
  user_wallets: string[];
  user_scores: number[];
}

export type RouteHandler = () => void;

export interface Route {
  path: string;
  handler: RouteHandler;
  requiresAuth?: boolean;
}
