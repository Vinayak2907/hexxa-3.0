// EventLoopDemo Page - Interactive JavaScript event loop demonstration

import { useState } from 'react';
import { demonstrateEventLoop, detailedEventLoopDemo, asyncAwaitDemo } from '../demos/eventLoopDemo.js';
import PageContainer from '../components/PageContainer.jsx';
import './DemoPages.css';

function EventLoopDemo() {
  const [output, setOutput] = useState([]);
  const [asyncOutput, setAsyncOutput] = useState([]);

  const runBasicDemo = () => {
    const result = demonstrateEventLoop();
    setOutput([
      `Sync code executed: ${result.syncExecuted.join(', ')}`,
      `Expected order: ${result.expectedOrder}`,
      `Explanation: ${result.explanation}`
    ]);
  };

  const runDetailedDemo = () => {
    const logs = detailedEventLoopDemo();
    setOutput(logs);
  };

  const runAsyncAwaitDemo = async () => {
    const logs = await asyncAwaitDemo();
    setAsyncOutput(logs);
  };

  return (
    <PageContainer 
      title="JavaScript Event Loop Demo" 
      subtitle="Understanding call stack, microtasks, and macrotasks"
    >
      <div className="demo-page">
        <section className="demo-section">
          <h2>Event Loop Basics</h2>
          <p>
            The event loop continuously checks if the call stack is empty and 
            executes tasks from the task queue. Microtasks (Promises) are executed 
            before macrotasks (setTimeout).
          </p>
          
          <div className="code-example">
            <pre>{`console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');

// Expected output: A, D, C, B`}</pre>
          </div>
          
          <button onClick={runBasicDemo} className="demo-button">
            Run Basic Demo
          </button>
          
          <button onClick={runDetailedDemo} className="demo-button">
            Run Detailed Demo
          </button>

          <button onClick={runAsyncAwaitDemo} className="demo-button">
            Run Async/Await Demo
          </button>
        </section>

        {output.length > 0 && (
          <section className="demo-output">
            <h3>Output:</h3>
            <div className="output-box">
              {output.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              {asyncOutput.length > 0 && asyncOutput.map((line, i) => (
                <p key={`async-${i}`}>{line}</p>
              ))}
            </div>
          </section>
        )}

        <section className="demo-section explanation">
          <h3>Key Concepts</h3>
          <ul>
            <li><strong>Call Stack:</strong> Executes synchronous code immediately</li>
            <li><strong>Microtask Queue:</strong> Promise callbacks, queueMicrotask() - HIGH PRIORITY</li>
            <li><strong>Task Queue:</strong> setTimeout, setInterval, I/O - LOWER PRIORITY</li>
            <li><strong>Event Loop:</strong> Checks if call stack is empty, then runs microtasks, then one task</li>
          </ul>
          
          <p className="note">
            <strong>Important:</strong> await does NOT block the JavaScript runtime. 
            It only pauses the async function execution. Other code can run while waiting.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}

export default EventLoopDemo;