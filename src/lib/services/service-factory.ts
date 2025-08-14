import { HttpClientService } from './http-client.service';
import { TokenService, tokenService } from './token.service';
import { ValidationService, validationService } from './validation.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { IAuthService, IUserService, IValidationService } from '../interfaces/auth.interface';
import { IHttpClient } from '../interfaces/http-client.interface';
import { ITokenService } from './token.service';

class ServiceFactory {
  private static instance: ServiceFactory;
  private _httpClient?: IHttpClient;
  private _authService?: IAuthService;
  private _userService?: IUserService;

  private constructor() {}

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  get httpClient(): IHttpClient {
    if (!this._httpClient) {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      this._httpClient = new HttpClientService(baseURL, tokenService);
    }
    return this._httpClient;
  }

  get tokenService(): ITokenService {
    return tokenService;
  }

  get validationService(): IValidationService {
    return validationService;
  }

  get authService(): IAuthService {
    if (!this._authService) {
      this._authService = new AuthService(this.httpClient, this.validationService);
    }
    return this._authService;
  }

  get userService(): IUserService {
    if (!this._userService) {
      this._userService = new UserService(this.httpClient);
    }
    return this._userService;
  }

  // Method to reset services (useful for testing)
  reset(): void {
    this._httpClient = undefined;
    this._authService = undefined;
    this._userService = undefined;
  }
}

export const serviceFactory = ServiceFactory.getInstance();

// Export individual services for convenience
export const {
  httpClient,
  tokenService: tokenSvc,
  validationService: validationSvc,
  authService,
  userService,
} = serviceFactory;
