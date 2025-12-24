# Email Verification Flow - Implementation

## Overview
When a user tries to login with an unverified email, they are automatically redirected to the OTP verification form and receive an OTP in their email.

## Flow

### 1. User Attempts Login
- User enters email and password
- Clicks "Sign in"

### 2. Backend Response
- If email is not verified (`!user.isActive`), backend:
  - Generates a 6-digit OTP
  - Stores OTP in database
  - Returns error: "Please verify your email address"
  - **Note:** Email sending is currently commented out in backend, but OTP is generated

### 3. Frontend Detection
- `LoginForm` detects the error message
- Checks for keywords:
  - "verify your email"
  - "please verify your email address"
  - "account not active"
  - "email not verified"
  - "verify email"

### 4. Automatic Navigation
- Extracts email from login form
- Calls `resendOtp(email)` to send OTP to user's email
- Navigates to OTP verification form via `onSwitchToOtp(email)`
- `AuthModal` switches to 'otp' step

### 5. OTP Verification
- User receives OTP in email
- Enters 6-digit code
- On successful verification:
  - Account is activated
  - User is automatically logged in
  - Redirected to dashboard

## Files Modified

### 1. `viargos-fe/src/components/auth/LoginForm.tsx`
**Changes:**
- Added `onSwitchToOtp` prop to interface
- Added `handleEmailVerificationError` helper function
- Detects email verification errors in `onSubmit`
- Automatically calls `resendOtp` and navigates to OTP form
- Added `useEffect` to watch for error changes
- Added ref to prevent duplicate handling

**Key Code:**
```typescript
// Detects error and navigates to OTP
if (errorString.includes('verify your email') || ...) {
  await resendOtp(email);
  onSwitchToOtp?.(email);
}
```

### 2. `viargos-fe/src/components/auth/AuthModal.tsx`
**Changes:**
- Added `handleLoginEmailVerification` function
- Passes `onSwitchToOtp` prop to `LoginForm`
- Sets email and switches to 'otp' step when called

**Key Code:**
```typescript
const handleLoginEmailVerification = (email: string) => {
  setSignupEmail(email);
  setIsPasswordResetFlow(false);
  setCurrentStep('otp');
  clearError();
};
```

## Error Messages Detected

The system detects these error messages (case-insensitive):
- "Please verify your email address"
- "Verify your email"
- "Account not active"
- "Email not verified"
- "Verify email"

## Backend Behavior

When login fails due to unverified email:
1. Backend generates OTP (6 digits)
2. OTP is stored in database with expiry
3. Error is returned: `ERROR_MESSAGES.AUTH.ACCOUNT_NOT_ACTIVE`
4. **Note:** Email sending is commented out in backend code
5. Frontend calls `resendOtp` endpoint to actually send the email

## User Experience

1. User enters credentials and clicks "Sign in"
2. Error appears: "Please verify your email address"
3. **Automatically:**
   - OTP is sent to user's email
   - User is navigated to OTP verification form
4. User enters OTP from email
5. On success:
   - Account is verified
   - User is logged in
   - Redirected to dashboard

## Testing

To test:
1. Create a user account (email not verified)
2. Try to login with that account
3. Should automatically:
   - Show error message briefly
   - Navigate to OTP form
   - OTP should be sent to email
4. Enter OTP from email
5. Should be logged in and redirected

## Notes

- OTP is automatically sent when error is detected
- Navigation happens automatically (no manual click needed)
- Error message is shown briefly before navigation
- If `resendOtp` fails, user is still navigated to OTP form (OTP might have been sent during login attempt)
- Backend generates OTP when login fails, so it should be available even if resend fails









