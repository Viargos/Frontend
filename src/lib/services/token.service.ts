export interface ITokenService {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  isTokenExpired(token?: string): boolean;
}

export class TokenService implements ITokenService {
  private static readonly TOKEN_KEY = 'viargos_auth_token';
  
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TokenService.TOKEN_KEY);
  }
  
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TokenService.TOKEN_KEY, token);
  }
  
  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TokenService.TOKEN_KEY);
  }
  
  isTokenExpired(token?: string): boolean {
    const authToken = token || this.getToken();
    if (!authToken) return true;
    
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

// Singleton instance
export const tokenService = new TokenService();
