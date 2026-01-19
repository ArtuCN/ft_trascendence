export interface TournamentForBlockchain {
  user_ids: number[];
  user_scores: number[];
  winner_ids: number[];
  winner_names: string;
  tournament_id: number;
}

const API_BASE_URL = '/api';

export class BlockchainTournamentApi {
  private token: string | null = null;
  constructor() {
    this.token = localStorage.getItem('token');
  }
  getToken(): string | null {
    return this.token;
  }
  saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }
  removeToken(): void {
    this.token = null;
    localStorage.removeItem('token');
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

  async insertTournament(backend_id: number, blockchain_id: number): Promise<{ insertedId: number }> {
    const response = await this.makeAuthenticatedRequest('/blockchain/tournament', {
      method: 'POST',
      body: JSON.stringify({ backend_id, blockchain_id })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to insert tournament');
    return data;
  }

  async getTournamentByBackendId(backend_id: number): Promise<any> {
    const response = await this.makeAuthenticatedRequest(`/blockchain/tournament/by-backend?backend_id=${backend_id}`, {
      method: 'GET'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get tournament by backend id');
    return data;
  }

  async getTournamentByBlockchainId(blockchain_id: number): Promise<any> {
    const response = await this.makeAuthenticatedRequest(`/blockchain/tournament/by-blockchain?blockchain_id=${blockchain_id}`, {
      method: 'GET'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get tournament by blockchain id');
    return data;
  }

  async getTournamentForBlockchain(id: number, tournament_id: number): Promise<TournamentForBlockchain> {
    const response = await this.makeAuthenticatedRequest(`/gettournamentforblockchain?id=${id}&tournament_id=${tournament_id}`, {
      method: 'GET'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get tournament for blockchain');
    return data as TournamentForBlockchain;
  }
}

export const blockchainTournamentApi = new BlockchainTournamentApi();
