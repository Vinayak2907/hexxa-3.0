// Server-Side Rendering Demo Page
// Demonstrates SSR capabilities for improved SEO and performance

import React from 'react';
import PageContainer from '../components/PageContainer.jsx';
import './SSRDemo.css';

function SSRDemo() {
  return (
    <PageContainer
      title="Server-Side Rendering Demo"
      subtitle="Explore how SSR improves initial load performance and SEO"
    >
      <div className="ssr-demo-page">
        <h2>Understanding Server-Side Rendering</h2>

        <div className="concept-box">
          <h3>What is Server-Side Rendering?</h3>
          <p>
            Server-Side Rendering (SSR) is a technique where React components are rendered on the server
            and sent to the client as fully formed HTML, rather than sending an empty HTML shell and
            waiting for JavaScript to populate the content.
          </p>
        </div>

        <div className="concept-box">
          <h3>Benefits of SSR</h3>
          <div className="benefits-list">
            <ul>
              <li><strong>Improved SEO:</strong> Search engine crawlers can easily index content since it's present in the initial HTML</li>
              <li><strong>Faster Initial Paint:</strong> Users see content immediately without waiting for JavaScript bundle download and execution</li>
              <li><strong>Better Performance on Slow Devices:</strong> Less work required on client-side, especially beneficial for mobile devices</li>
              <li><strong>Social Media Sharing:</strong> Proper meta tags and content are available when links are shared</li>
            </ul>
          </div>
        </div>

        <div className="concept-box">
          <h3>How Hexa Implements SSR</h3>
          <p>
            Hexa uses a custom SSR implementation in <code>server/src/ssr.js</code> that:
          </p>
          <ol>
            <li>Renders React components to string on the server using ReactDOMServer</li>
            <li>Injects the rendered HTML into a template with proper meta tags</li>
            <li>Sends the complete HTML response to the client</li>
            <li>Hydrates the client-side React application for interactivity</li>
          </ol>
        </div>

        <div className="concept-box">
          <h3>SSR Demo Route</h3>
          <p>
            Visit <a href="/ssr-demo" target="_blank" rel="noopener noreferrer">/ssr-demo</a> to see the SSR endpoint in action.
            View the page source to observe the fully rendered HTML content.
          </p>
          <div className="demo-note">
            Note: This is a demonstration endpoint showing SSR capabilities.
            In a production SSR implementation, individual routes would be rendered on demand.
          </div>
        </div>

        <div className="concept-box">
          <h3>Client-Side Hydration</h3>
          <p>
            After the server-rendered HTML is received, React "hydrates" the application by attaching
            event listeners to the existing markup, making it interactive without requiring a full re-render.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

export default SSRDemo;