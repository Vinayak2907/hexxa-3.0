// Server-Side Rendering (SSR) Utility
// Demonstrates how to render React components on the server
// Note: This is a simplified example. In production, you'd use frameworks like Next.js

import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// This would typically import your actual React app component
// For demonstration, we'll create a simple component

/**
 * Render a React component to HTML string with server-side routing
 * @param {React.Component} Component - The component to render
 * @param {Object} props - Props to pass to the component
 * @param {string} url - The current URL for routing context
 * @returns {Object} Rendered HTML and head metadata
 */
export async function renderComponentToString(Component, props = {}, url = '/') {
  try {
    // In a real implementation, you would import your actual app component
    // For now, we'll return a placeholder indicating SSR capability

    // This is where you would do:
    // const html = renderToString(
    //   <StaticRouter location={url} context={{}}>
    //     <Component {...props} />
    //   </StaticRouter>
    // );

    // And extract helmet data:
    // const helmet = Helmet.renderStatic();

    // For demonstration purposes, we'll return a simplified result
    return {
      html: `<div data-ssr="true">Server-side rendered content for ${url}</div>`,
      head: `
        <meta name="renderer" content="webkit">
        <meta name="force-rendering" content="true">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
        <meta name="referrer" content="no-referrer-when-downgrade">
      `,
      redirectUrl: null // Would be set if StaticRouter context indicates a redirect
    };
  } catch (error) {
    console.error('SSR rendering error:', error.message);
    throw error;
  }
}

/**
 * Middleware for server-side rendering
 * This would be used in Express routes to serve SSR content
 * @returns {Express Middleware Function}
 */
export function ssrMiddleware() {
  return async (req, res, next) => {
    try {
      // Skip SSR for API routes and static assets
      if (req.path.startsWith('/api/') ||
          req.path.startsWith('/static/') ||
          req.path.includes('.')) {
        return next();
      }

      // In a real implementation:
      // 1. Determine which component to render based on URL
      // 2. Fetch any required data for the component
      // 3. Render the component to string
      // 4. Inject the rendered HTML into a template
      // 5. Send the response

      // For demonstration, we'll just pass through to client-side rendering
      // In production with React Router, you'd typically let the client handle routing
      // and use SSR only for initial page load or specific routes

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Get SSR configuration
 * @returns {Object} SSR configuration
 */
export function getSSRConfig() {
  return {
    // Whether to enable SSR
    enabled: process.env.SSR_ENABLED === 'true',

    // Which routes to render server-side
    routes: ['/', '/about', '/contact', '/dashboard'],

    // Cache SSR responses (in seconds)
    cacheTTL: 60,

    // Maximum age for cached SSR content
    maxAge: 300
  };
}

export default {
  renderComponentToString,
  ssrMiddleware,
  getSSRConfig
};