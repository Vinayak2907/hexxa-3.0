# Concept 22: OAuth / 3rd-Party Login

## Overview
OAuth 2.0 is the industry-standard protocol for authorization. It allows third-party applications (like Hexa) to grant limited access to an HTTP service (like Google) without exposing user credentials.

Hexa implements the **Authorization Code Flow**, which is the most secure OAuth flow for server-side web applications.

## The Authorization Code Flow

Our implementation simulates the 5-step OAuth process:

1. **Authorization Request (`GET /api/auth/oauth/google`)**
   The client requests authorization from the user by redirecting them to the OAuth provider (Google).
   *Security Feature*: We generate a `state` token (CSRF prevention) and store it in an in-memory map.

2. **User Consent**
   The user logs into Google and grants Hexa permission to view their profile.

3. **Callback (`GET /api/auth/oauth/google/callback`)**
   Google redirects the user back to our server with an `authorization code` and the original `state` token.
   *Security Check*: We verify the `state` token matches what we generated in Step 1 to prevent Cross-Site Request Forgery.

4. **Token Exchange (Server-to-Server)**
   Our backend makes a secure, server-to-server POST request to Google, exchanging the short-lived `authorization code` (along with our Client Secret) for an `access_token`.

5. **Profile Fetch & Session Creation**
   We use the Google `access_token` to fetch the user's profile data, then issue our own Hexa JWT session (Access + Refresh tokens).

## Implementation Details

```javascript
// server/src/routes/oauthRoutes.js
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;

  // 1. Validate CSRF state token
  if (!oauthStateStore.has(state)) throw new Error('Invalid state');

  // 2. Exchange code for tokens (simulated server-to-server)
  const tokenExchange = await simulateTokenExchange(code);

  // 3. Fetch user profile
  const userProfile = await simulateProfileFetch(tokenExchange.access_token);

  // 4. Create Hexa session
  const accessToken = generateToken({ id: userProfile.id, email: userProfile.email });
  res.cookie('refreshToken', generateRefreshToken(...));

  res.json({ accessToken, user: userProfile });
});
```

## Security Best Practices Demonstrated
1. **CSRF Protection**: The `state` parameter ensures the authorization response wasn't forged by a malicious site.
2. **Backend Token Exchange**: The Client Secret is never exposed to the browser. The exchange happens securely server-to-server.
3. **Session Translation**: We don't use Google's token for our API auth; we translate it into our own JWT session.

## Verification / Demo
- API Endpoint: `GET /api/auth/oauth/google` — See the authorization URL construction and state generation.
- API Endpoint: `GET /api/auth/oauth/google/callback?code=mock_code&state=<state_from_step_1>` — See the token exchange and session creation process.
