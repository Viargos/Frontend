import type { BrowserContext, Page } from '@playwright/test';
import { Buffer } from 'node:buffer';
import { expect, test } from '@playwright/test';

type SafetyGuards = {
  assertClean: () => void;
};

const AUTH_COOKIE_NAME = 'viargos_access_token';
const ONE_PIXEL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn0j7sAAAAASUVORK5CYII=';

function installSafetyGuards(page: Page): SafetyGuards {
  const failures: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      const text = message.text();
      if (text.includes('401 (Unauthorized)')) {
        return;
      }
      failures.push(`console-error: ${message.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    failures.push(`page-error: ${error.message}`);
  });

  page.on('requestfailed', (request) => {
    const type = request.resourceType();
    if (type === 'websocket') {
      return;
    }
    const failureText = request.failure()?.errorText ?? '';
    if (failureText.includes('net::ERR_ABORTED')) {
      return;
    }
    failures.push(`request-failed: ${request.method()} ${request.url()} ${failureText}`.trim());
  });

  page.on('response', (response) => {
    const resourceType = response.request().resourceType();
    if (resourceType !== 'document' && resourceType !== 'fetch' && resourceType !== 'xhr') {
      return;
    }

    if (response.status() >= 500) {
      failures.push(`response-${response.status()}: ${response.request().method()} ${response.url()}`);
      return;
    }

    if (response.status() === 404) {
      failures.push(`response-404: ${response.request().method()} ${response.url()}`);
    }
  });

  return {
    assertClean: () => {
      expect(failures, failures.join('\n')).toEqual([]);
    },
  };
}

async function setAuthenticatedCookie(context: BrowserContext) {
  await context.addCookies([
    {
      domain: 'localhost',
      httpOnly: false,
      name: AUTH_COOKIE_NAME,
      path: '/',
      sameSite: 'Lax',
      secure: false,
      value: 'e2e-access-token',
    },
  ]);
}

async function mockSignedInAuthApis(page: Page) {
  await page.route('**://viargos-sandbox.s3.us-east-2.amazonaws.com/**', async (route) => {
    await route.fulfill({
      body: Buffer.from(ONE_PIXEL_PNG_BASE64, 'base64'),
      contentType: 'image/png',
      status: 200,
    });
  });

  await page.route('**/api/auth/profile', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          email: 'e2e@viargos.test',
          id: 'user-e2e',
          isActive: true,
          profileImage: '',
          username: 'e2e-user',
        },
      }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: { message: 'ok' } }),
      contentType: 'application/json',
      status: 200,
    });
  });
}

test('auth login and logout smoke', async ({ page }) => {
  const guards = installSafetyGuards(page);

  await page.route('**/api/auth/profile', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ error: 'UNAUTHORIZED', message: 'Unauthorized', statusCode: 401 }),
      contentType: 'application/json',
      status: 401,
    });
  });

  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ error: 'UNAUTHORIZED', message: 'Unauthorized', statusCode: 401 }),
      contentType: 'application/json',
      status: 401,
    });
  });

  await page.route('**/api/auth/signin', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          message: 'Signed in',
          user: {
            email: 'e2e@viargos.test',
            id: 'user-e2e',
            isActive: true,
            profileImage: '',
            username: 'e2e-user',
          },
        },
      }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: { message: 'Logged out' } }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Email').fill('e2e@viargos.test');
  await page.getByLabel('Password').fill('Pass@1234');
  await page.locator('form').getByRole('button', { exact: true, name: 'Sign in' }).click();

  await expect(page.getByRole('button', { name: 'Open Dashboard' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

  guards.assertClean();
});

test('journey create flow smoke', async ({ context, page }) => {
  await setAuthenticatedCookie(context);
  const guards = installSafetyGuards(page);
  await mockSignedInAuthApis(page);

  await page.route('**/api/journeys', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({
      body: JSON.stringify({
        data: {
          coverImage: '',
          createdAt: '2026-02-01T10:00:00.000Z',
          description: 'E2E description',
          id: 'journey-e2e',
          title: 'E2E journey',
        },
      }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.route('**/journey/journey-e2e**', async (route) => {
    await route.fulfill({
      body: '<html><body>Journey Created</body></html>',
      contentType: 'text/html',
      status: 200,
    });
  });

  await page.goto('/create-journey');
  await page.getByPlaceholder('Enter journey name...').fill('E2E journey');
  await page.getByRole('button', { name: 'Places to go' }).click();
  await page.getByPlaceholder('Enter place name').fill('Big Ben');
  await page.getByRole('button', { name: 'Review & Post' }).click();
  await page.getByRole('button', { name: 'Post Journey' }).click();

  await expect(page).toHaveURL(/journey\/journey-e2e/);

  guards.assertClean();
});

test('discover modal and filter smoke', async ({ context, page }) => {
  await setAuthenticatedCookie(context);
  await context.grantPermissions(['geolocation'], { origin: 'http://localhost:3008' });
  await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 });
  const guards = installSafetyGuards(page);
  await mockSignedInAuthApis(page);
  const discoverCreatedAt = new Date().toISOString();

  await page.route('**/api/location/current', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: { latitude: 51.5074, longitude: -0.1278 } }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.route('**/api/journeys/nearby**', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: [
          {
            coordinates: [],
            coverImage: '/london.png',
            createdAt: discoverCreatedAt,
            description: 'City highlights',
            id: 'discover-journey-1',
            days: [{ places: [{ id: 'p1', latitude: 51.5007, longitude: -0.1246, name: 'Big Ben', type: 'landmark' }] }],
            title: 'London City Tour',
          },
        ],
      }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.goto('/discover');
  await page.getByRole('button', { name: 'Show filters' }).click();
  await page.locator('#discover-created-within').selectOption('month');
  await page.getByRole('button', { name: 'Hide filters' }).click();
  await page.getByText('London City Tour').first().click();
  await page.getByRole('button', { exact: true, name: 'View Full Journey' }).click();

  const journeyDetailsDialog = page.getByRole('dialog', { name: 'Journey details' });

  await expect(journeyDetailsDialog).toBeVisible();

  await page.getByRole('button', { name: 'Close journey details' }).click();

  await expect(journeyDetailsDialog).toBeHidden();

  guards.assertClean();
});

test('chat open conversation and send message smoke', async ({ context, page }) => {
  await setAuthenticatedCookie(context);
  const guards = installSafetyGuards(page);
  await mockSignedInAuthApis(page);

  await page.route('**/api/chat/conversations', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          conversations: [
            {
              id: 'chat-parity-conversation-1',
              lastMessage: {
                content: 'See you at the meetup point!',
                createdAt: '2026-02-01T10:15:00.000Z',
                id: 'chat-parity-message-1',
                isRead: true,
                receiverId: 'chat-parity-user-1',
                senderId: 'chat-parity-user-2',
              },
              unreadCount: 0,
              updatedAt: '2026-02-01T10:15:00.000Z',
              user: {
                email: 'aarav@example.com',
                id: 'chat-parity-user-2',
                isOnline: true,
                profileImage: '',
                username: 'Aarav Patel',
              },
            },
          ],
        },
      }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.route('**/api/chat/me', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          user: {
            email: 'me@example.com',
            id: 'chat-parity-user-1',
            isOnline: true,
            profileImage: '',
            username: 'Current User',
          },
        },
      }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.route('**/api/chat/conversations/*/messages**', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          messages: [
            {
              content: 'Welcome to chat',
              createdAt: '2026-02-01T10:00:00.000Z',
              id: 'msg-1',
              isRead: true,
              receiverId: 'chat-parity-user-1',
              senderId: 'chat-parity-user-2',
            },
          ],
        },
      }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.route('**/api/chat/conversations/*/read', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: { success: true } }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.route('**/api/chat/messages', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          message: {
            content: 'Smoke test message',
            createdAt: '2026-02-01T10:20:00.000Z',
            id: 'msg-2',
            isRead: false,
            receiverId: 'chat-parity-user-2',
            senderId: 'chat-parity-user-1',
          },
        },
      }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.goto('/messages?parityFixtures=1');
  await page.getByText('Aarav Patel').first().click();
  await page.getByPlaceholder('Type a message...').fill('Smoke test message');
  await page.keyboard.press('Enter');

  await expect(page.locator('section').getByText('Smoke test message').last()).toBeVisible();

  guards.assertClean();
});

test('profile tabs smoke', async ({ context, page }) => {
  await setAuthenticatedCookie(context);
  const guards = installSafetyGuards(page);
  await mockSignedInAuthApis(page);

  await page.goto('/profile?parityFixtures=1');
  await page.getByRole('button', { exact: true, name: 'Post' }).click();

  await expect(page.getByRole('heading', { name: 'Parity User\'s Posts' })).toBeVisible();

  await page.getByRole('button', { name: 'Map' }).click();

  await expect(page.getByText('Travel Map')).toBeVisible();

  await page.getByRole('button', { exact: true, name: 'Journey' }).click();

  await expect(page.getByRole('heading', { name: 'My Journeys' })).toBeVisible();

  guards.assertClean();
});

test('settings smoke (password feature disabled + logout)', async ({ context, page }) => {
  await setAuthenticatedCookie(context);
  const guards = installSafetyGuards(page);
  await mockSignedInAuthApis(page);

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: { message: 'Logged out' } }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.goto('/settings');

  await expect(page.getByText('Change Password')).toBeVisible();

  const changePasswordItem = page.locator('div.flex.items-center.justify-between.px-4.py-4').filter({
    has: page.getByText('Change Password', { exact: true }),
  }).first();

  await expect(changePasswordItem).toContainText('Coming soon');

  await page.getByRole('button', { name: 'Log Out' }).first().click();
  await page.getByRole('button', { name: 'Log Out' }).nth(1).click();

  await expect(page).toHaveURL('/');

  guards.assertClean();
});
