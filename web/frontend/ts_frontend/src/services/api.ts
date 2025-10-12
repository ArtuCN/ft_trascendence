import { LoginRequest, RegisterRequest, AuthResponse, User, Stats, Match, CreateMatchRequest, Tournament, Friendship, HeartbeatResponse } from '../types/index.js';

const API_BASE_URL = '/api';

export class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  removeToken(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('id');
    localStorage.removeItem('mail');
    localStorage.removeItem('username');
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Login failed');
    }
    return data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Registration failed');
    }

    return data;
  }

  async googleAuth(credential: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Google authentication failed');
    }

    return data;
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
    
    if (response.status === 401) {
      this.removeToken();
      throw new Error('Session expired');
    }
    return response;
  }

  // ==================== STATS ====================
  
  async getStats(id: number): Promise<any> {
    const response = await this.makeAuthenticatedRequest(`/stats?id=${id}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch stats');
    }

    return await response.json();
  }

  async getAllStats(): Promise<Stats[]> {
    const response = await this.makeAuthenticatedRequest('/allstats', {
      method: 'GET'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch all stats');
    }

    return await response.json();
  }

  // ==================== FRIENDS ====================

  async getFriends(id: number): Promise<User[]> {
    const response = await this.makeAuthenticatedRequest(`/friend?id=${id}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch friends');
    }

    return await response.json();
  }

  async addFriend(id1: number, id2: number): Promise<{ success: boolean }> {
    const response = await this.makeAuthenticatedRequest('/addfriend', {
      method: 'POST',
      body: JSON.stringify({ id1, id2 })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to add friend');
    }

    return await response.json();
  }

  async removeFriend(id1: number, id2: number): Promise<{ success: boolean; deleted: number }> {
    const response = await this.makeAuthenticatedRequest('/removefriend', {
      method: 'DELETE',
      body: JSON.stringify({ id1, id2 })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to remove friend');
    }

    return await response.json();
  }

  async getAllFriendships(): Promise<Friendship[]> {
    const response = await this.makeAuthenticatedRequest('/allfriendships', {
      method: 'GET'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch friendships');
    }

    return await response.json();
  }

  // ==================== MATCHES ====================

  async getAllMatches(): Promise<Match[]> {
    const response = await this.makeAuthenticatedRequest('/allmatch', {
      method: 'GET'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch matches');
    }

    return await response.json();
  }

  async getMatchById(id: number): Promise<Match> {
    const response = await this.makeAuthenticatedRequest(`/matchid?id=${id}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch match');
    }

    return await response.json();
  }

  async getPlayerMatches(id_player: number): Promise<any[]> {
    const response = await this.makeAuthenticatedRequest(`/allmatchplayer?id_player=${id_player}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch player matches');
    }

    return await response.json();
  }

  async getPlayersByMatchId(id: number): Promise<User[]> {
    const response = await this.makeAuthenticatedRequest(`/playersbymatchid?id=${id}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch players');
    }

    return await response.json();
  }

  async createMatch(matchData: CreateMatchRequest): Promise<Match> {
    const response = await this.makeAuthenticatedRequest('/match', {
      method: 'POST',
      body: JSON.stringify(matchData)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create match');
    }

    return await response.json();
  }

  // ==================== TOURNAMENTS ====================

  async createTournament(tournament_name: string): Promise<Tournament> {
    const response = await this.makeAuthenticatedRequest('/tournament', {
      method: 'POST',
      body: JSON.stringify({ tournament_name })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create tournament');
    }

    return await response.json();
  }

  async getAllTournaments(): Promise<Tournament[]> {
    const response = await this.makeAuthenticatedRequest('/alltournament', {
      method: 'GET'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch tournaments');
    }

    return await response.json();
  }

  async startTournament(id: number): Promise<Tournament> {
    const response = await this.makeAuthenticatedRequest('/starttournament', {
      method: 'POST',
      body: JSON.stringify({ id })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to start tournament');
    }

    return await response.json();
  }

  async finishTournament(id: number, id_winner: number): Promise<Tournament> {
    const response = await this.makeAuthenticatedRequest('/finishtournament', {
      method: 'POST',
      body: JSON.stringify({ id, id_winner })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to finish tournament');
    }

    return await response.json();
  }

  // ==================== HEARTBEAT & LOGOUT ====================

  async sendHeartbeat(): Promise<{ ok: boolean }> {
    const response = await this.makeAuthenticatedRequest('/heartbeat', {
      method: 'POST'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send heartbeat');
    }

    return await response.json();
  }

  async getUserLastActive(id: number): Promise<HeartbeatResponse> {
    const response = await this.makeAuthenticatedRequest(`/heartbeat/get?id=${id}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to get user status');
    }

    return await response.json();
  }

  async logout(username: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Logout failed');
    }

    this.removeToken();
    return data;
  }
}

export const apiService = new ApiService();
