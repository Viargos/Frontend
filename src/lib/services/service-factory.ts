import { HttpClientService } from '@/lib/services/http-client.service';
import { TokenService, tokenService } from '@/lib/services/token.service';
import { AuthService } from '@/lib/services/auth.service';
import { UserService } from '@/lib/services/user.service';
import { ValidationService, validationService } from '@/lib/services/validation.service';
import { ProfileService } from '@/lib/services/profile.service';
import { JourneyService } from './journey.service';
import { IAuthService, IUserService, IValidationService } from '@/lib/interfaces/auth.interface';
import { IProfileService } from '@/lib/interfaces/profile.interface';
import { IJourneyService } from '@/lib/interfaces/journey.interface';
import { IHttpClient } from '@/lib/interfaces/http-client.interface';
import { ITokenService } from './token.service';

class ServiceFactory {
  private static instance: ServiceFactory;
  private _httpClient?: IHttpClient;
  private _authService?: IAuthService;
  private _userService?: IUserService;
  private _profileService?: IProfileService;
  private _journeyService?: IJourneyService;

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

  get profileService(): IProfileService {
    if (!this._profileService) {
      this._profileService = new ProfileService(this.httpClient);
    }
    return this._profileService;
  }

  get journeyService(): IJourneyService {
    if (!this._journeyService) {
      this._journeyService = new JourneyService();
    }
    return this._journeyService;
  }

  // Method to reset services (useful for testing)
  reset(): void {
    this._httpClient = undefined;
    this._authService = undefined;
    this._userService = undefined;
    this._profileService = undefined;
    this._journeyService = undefined;
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
  profileService,
  journeyService,
} = serviceFactory;
