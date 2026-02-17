/**
 * Response DTO for POST /api/auth/refresh
 *
 * Backend contract: { message: string } (operation endpoint)
 *
 * Refresh endpoint sets new cookies and returns a simple message.
 */
export interface RefreshResponseDto {
  message: string;
}
