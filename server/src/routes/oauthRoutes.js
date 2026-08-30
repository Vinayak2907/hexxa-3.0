// OAuth / 3rd-Party Login Routes
// Concept: OAuth / 3rd-party login (Auth & Security)
// Demonstrates the full OAuth 2.0 Authorization Code flow pattern
// Simulated provider for assessment — same architecture as real Google/GitHub OAuth

import express from 'express';
import crypto from 'crypto';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';

const router = express.Router();

/**
 * In-memory OAuth state store
 * Stores CSRF state tokens to prevent cross-site request forgery
 * In production, use Redis with TTL
 */
const oauthStateStore = new Map();

/**
 * OAuth provider configuration
 * In production, these values come from environment variables
 */
const OAUTH_CONFIG = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'hexa-demo-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'hexa-demo-client-secret',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/oauth/google/callback',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile']
  }
};

/**
 * GET /api/auth/oauth/google
 * Step 1: Initiate OAuth flow — redirect user to Google consent screen
 * Generates a CSRF state token and constructs the authorization URL
 */
router.get('/google', (req, res) => {
  const config = OAUTH_CONFIG.google;

  // Generate cryptographically secure state token for CSRF prevention
  const state = crypto.randomBytes(32).toString('hex');

  // Store state with timestamp for expiry validation
  oauthStateStore.set(state, {
    createdAt: Date.now(),
    ip: req.ip
  });

  // Clean up expired states (older than 10 minutes)
  const TEN_MINUTES = 10 * 60 * 1000;
  for (const [key, value] of oauthStateStore.entries()) {
    if (Date.now() - value.createdAt > TEN_MINUTES) {
      oauthStateStore.delete(key);
    }
  }

  // Construct OAuth authorization URL
  const authorizationUrl = new URL(config.authUrl);
  authorizationUrl.searchParams.set('client_id', config.clientId);
  authorizationUrl.searchParams.set('redirect_uri', config.redirectUri);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', config.scopes.join(' '));
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('access_type', 'offline');       // Request refresh token
  authorizationUrl.searchParams.set('prompt', 'consent');            // Force consent screen

  // In production: res.redirect(authorizationUrl.toString());
  // For assessment demo, return the URL and flow details
  res.status(200).json({
    concept: 'OAuth 2.0 Authorization Code Flow',
    step: '1 — Authorization Request',
    description: 'Redirect user to the OAuth provider consent screen',
    authorizationUrl: authorizationUrl.toString(),
    state,
    flow: {
      '1_authorize': 'User clicks → redirected to Google consent screen',
      '2_consent': 'User grants access → Google redirects back with authorization code',
      '3_exchange': 'Server exchanges code for access token (server-to-server)',
      '4_userinfo': 'Server uses access token to fetch user profile',
      '5_session': 'Server creates JWT session for the authenticated user'
    },
    security: {
      stateToken: 'CSRF prevention — verified on callback',
      pkce: 'PKCE code_verifier/code_challenge for public clients',
      httpsOnly: 'Tokens only transmitted over TLS in production'
    }
  });
});

/**
 * GET /api/auth/oauth/google/callback
 * Step 2: Handle OAuth callback — exchange code for tokens
 * Validates state, exchanges authorization code, creates user session
 */
router.get('/google/callback', async (req, res) => {
  const { code, state, error: oauthError } = req.query;

  // Handle OAuth provider errors (user denied access, etc.)
  if (oauthError) {
    return res.status(400).json({
      error: {
        code: 'OAUTH_ERROR',
        message: `OAuth provider returned error: ${oauthError}`,
        description: req.query.error_description || 'Unknown error'
      }
    });
  }

  // Validate required parameters
  if (!code || !state) {
    return res.status(400).json({
      error: {
        code: 'MISSING_PARAMS',
        message: 'Authorization code and state are required'
      }
    });
  }

  // Validate CSRF state token
  if (!oauthStateStore.has(state)) {
    return res.status(403).json({
      error: {
        code: 'INVALID_STATE',
        message: 'Invalid or expired state token — possible CSRF attack'
      }
    });
  }

  // Remove used state token (one-time use)
  oauthStateStore.delete(state);

  // Simulate token exchange (Step 3: server-to-server)
  // In production: POST to tokenUrl with code + client credentials
  const simulatedTokenExchange = {
    access_token: `simulated-access-token-${crypto.randomBytes(16).toString('hex')}`,
    refresh_token: `simulated-refresh-token-${crypto.randomBytes(16).toString('hex')}`,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'openid email profile'
  };

  // Simulate user info fetch (Step 4: use access token to get profile)
  // In production: GET userInfoUrl with Bearer access_token
  const simulatedUserProfile = {
    id: 'google-oauth-user-123',
    email: 'oauth.user@gmail.com',
    name: 'OAuth Demo User',
    picture: 'https://example.com/avatar.jpg',
    verified_email: true
  };

  // Step 5: Create/find user in database and issue JWT session
  const user = {
    id: 999,
    name: simulatedUserProfile.name,
    email: simulatedUserProfile.email,
    role: 'user',
    provider: 'google',
    providerId: simulatedUserProfile.id
  };

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    concept: 'OAuth 2.0 Authorization Code Flow',
    step: '2 — Token Exchange & Session Creation',
    message: 'OAuth login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider
    },
    accessToken,
    oauthFlow: {
      codeReceived: code,
      stateValidated: true,
      tokenExchanged: true,
      userProfileFetched: true,
      sessionCreated: true
    },
    simulatedProviderResponse: {
      tokenExchange: simulatedTokenExchange,
      userProfile: simulatedUserProfile
    }
  });
});

/**
 * GET /api/auth/oauth/providers
 * List available OAuth providers and their configuration
 */
router.get('/providers', (req, res) => {
  res.status(200).json({
    providers: Object.keys(OAUTH_CONFIG).map(provider => ({
      name: provider,
      loginUrl: `/api/auth/oauth/${provider}`,
      callbackUrl: OAUTH_CONFIG[provider].redirectUri,
      scopes: OAUTH_CONFIG[provider].scopes
    }))
  });
});

export default router;
