# Viargos Frontend - Clean Architecture Implementation

This project implements a modern, scalable frontend architecture following SOLID principles and clean code practices.

## 🏗️ Architecture Overview

### Service Layer Pattern
The application follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────┐
│           UI Components             │ ← React Components
├─────────────────────────────────────┤
│           State Management          │ ← Zustand Stores  
├─────────────────────────────────────┤
│           Service Layer             │ ← Business Logic
├─────────────────────────────────────┤
│           HTTP Client               │ ← Network Layer
└─────────────────────────────────────┘
```

### SOLID Principles Implementation

#### 🎯 Single Responsibility Principle (SRP)
Each service has one clear purpose:
- `AuthService` - Authentication logic only
- `ValidationService` - Input validation only  
- `TokenService` - Token management only
- `UserService` - User operations only

#### 📂 Open/Closed Principle (OCP)
Services can be extended without modification:
```typescript
// Easy to add new validation rules
class EnhancedValidationService extends ValidationService {
  validatePhoneNumber(phone: string) { /* custom logic */ }
}
```

#### 🔄 Liskov Substitution Principle (LSP)
All services implement their interfaces and are interchangeable:
```typescript
const authService: IAuthService = new AuthService(httpClient, validator);
const mockAuthService: IAuthService = new MockAuthService();
// Both can be used interchangeably
```

#### 🎛️ Interface Segregation Principle (ISP)
Focused interfaces prevent unnecessary dependencies:
```typescript
interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): void;
}

interface IUserService {
  uploadProfileImage(file: File): Promise<UploadResult>;
  getCurrentStats(): Promise<UserStats>;
}
```

#### 🔌 Dependency Inversion Principle (DIP)
High-level modules depend on abstractions:
```typescript
class AuthService {
  constructor(
    private httpClient: IHttpClient,  // ← Interface dependency
    private validator: IValidationService // ← Interface dependency
  ) {}
}
```

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

## 📋 Usage Examples

### Authentication
```typescript
import { authService, validationService } from '@/lib/api';

// Validate input before API call
const emailValid = validationService.validateEmail(email);
const { isValid, errors } = validationService.validatePassword(password);

if (emailValid && isValid) {
  const result = await authService.login({ email, password });
  if (result.success) {
    // Handle success
    router.push('/dashboard');
  } else {
    // Handle error
    setError(result.error);
  }
}
```

### HTTP Requests
```typescript
import { httpClient } from '@/lib/api';

// Type-safe GET request
const users = await httpClient.get<User[]>('/users');

// POST with validation
const newUser = await httpClient.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// File upload
const result = await httpClient.uploadFile('/upload', file, 'image');
```

### State Management
```typescript
import { useAuthStoreV2 } from '@/store/auth.store.v2';

function LoginPage() {
  const { login, isLoading, error } = useAuthStoreV2();
  
  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      // Redirect or update UI
    }
  };
}
```

### Layout Composition
```typescript
import AuthenticatedLayoutV2 from '@/components/layout/AuthenticatedLayout.v2';

function DashboardPage() {
  return (
    <AuthenticatedLayoutV2 
      showLeftSidebar={true}
      showRightSidebar={false}
    >
      <DashboardContent />
    </AuthenticatedLayoutV2>
  );
}
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── interfaces/          # Service interfaces (DIP)
│   │   ├── auth.interface.ts
│   │   └── http-client.interface.ts
│   ├── services/           # Service implementations (SRP)
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── validation.service.ts
│   │   ├── token.service.ts
│   │   ├── http-client.service.ts
│   │   └── service-factory.ts
│   ├── api.ts              # Modern service exports
│   └── api.legacy.ts       # Legacy compatibility
├── components/
│   ├── auth/
│   │   ├── AuthModal.v2.tsx    # Enhanced auth modal
│   │   └── LoginForm.v2.tsx    # Improved login form
│   ├── layout/
│   │   ├── BaseLayout.tsx      # Composition-based layout
│   │   ├── ResponsiveSidebar.tsx # Reusable sidebar
│   │   └── AuthenticatedLayout.v2.tsx
│   └── ui/                     # Reusable UI components
├── store/
│   ├── auth.store.v2.ts        # Enhanced auth store
│   └── auth.store.ts           # Legacy store
└── types/                      # TypeScript definitions
```

## 🧪 Testing Strategy

The new architecture makes testing significantly easier:

### Service Testing
```typescript
// Mock dependencies
const mockHttpClient: IHttpClient = {
  post: jest.fn().mockResolvedValue({ success: true })
};

const mockValidator: IValidationService = {
  validateEmail: jest.fn().mockReturnValue(true)
};

// Test service in isolation
const authService = new AuthService(mockHttpClient, mockValidator);
```

### Component Testing
```typescript
// Mock service layer
jest.mock('@/lib/api', () => ({
  authService: {
    login: jest.fn().mockResolvedValue({ success: true })
  }
}));
```

## 🔧 Error Handling

Consistent error handling across the application:

```typescript
import { ApiError } from '@/lib/interfaces/http-client.interface';

try {
  const result = await authService.login(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API errors
    console.log(`API Error: ${error.message} (${error.statusCode})`);
  } else {
    // Handle other errors
    console.log('Unexpected error:', error);
  }
}
```

## 🔄 Migration from Legacy Code

The codebase supports gradual migration:

1. **New features**: Use new service architecture
2. **Existing features**: Gradually migrate using provided v2 components
3. **Legacy support**: Old components continue to work during transition

### Migration Examples

```typescript
// OLD - Direct API client usage
import apiClient from '@/lib/api';
const response = await apiClient.signIn(credentials);

// NEW - Service-based approach  
import { authService } from '@/lib/api';
const result = await authService.login(credentials);
```

```typescript
// OLD - Monolithic store
import { useAuthStore } from '@/store/auth.store';

// NEW - Service-integrated store
import { useAuthStoreV2 } from '@/store/auth.store.v2';
```

## 📊 Benefits

### Developer Experience
- **Better IntelliSense**: Comprehensive TypeScript support
- **Easier Testing**: Mockable service dependencies
- **Clear Structure**: Obvious where to add new features
- **Type Safety**: Compile-time error detection

### Code Quality
- **Separation of Concerns**: Each file has a single responsibility
- **Maintainability**: Changes are localized to specific services
- **Extensibility**: New features don't modify existing code
- **Consistency**: Standardized error handling and patterns

### Performance
- **Tree Shaking**: Better dead code elimination
- **Code Splitting**: Services can be lazy-loaded
- **Caching**: Service-level caching strategies
- **Bundle Size**: Modular architecture reduces bundle size

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript compilation check
```

## 📚 Additional Resources

- [Architecture Migration Guide](./ARCHITECTURE_MIGRATION.md)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

When contributing new features:

1. Follow SOLID principles
2. Create interfaces before implementations
3. Write tests for services
4. Update this documentation
5. Use the new service architecture

## 📝 License

This project is licensed under the MIT License.
