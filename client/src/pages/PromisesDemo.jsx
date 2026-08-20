// PromisesDemo Page - Interactive Promise vs Callback demonstration

import { useState } from 'react';
import { 
  loadDataWithCallback, 
  loadDataWithPromise, 
  loadDataWithAsyncAwait,
  fetchDataWithCallbacks,
  fetchDataWithPromises,
  fetchDataWithAsyncAwait,
  getComparison
} from '../demos/promisesVsCallbacks.js';
import { getTasksPromise, getTasks } from '../api/taskApi.js';
import PageContainer from '../components/PageContainer.jsx';
import './DemoPages.css';

function PromisesDemo() {
  const [callbackOutput, setCallbackOutput] = useState('');
  const [promiseOutput, setPromiseOutput] = useState('');
  const [asyncOutput, setAsyncOutput] = useState('');
  const [chainingOutput, setChainingOutput] = useState({});
  const [comparison, setComparison] = useState(null);
  const [apiOutput, setApiOutput] = useState('');

  const runApiPromiseDemo = () => {
    setApiOutput('Loading live tasks from backend API via Promise Chaining (.then().catch())...');
    getTasksPromise()
      .then(tasks => {
        setApiOutput(`Success (Promise Chaining API) - Loaded ${tasks.length} tasks:\n` + JSON.stringify(tasks.slice(0, 2), null, 2));
      })
      .catch(error => {
        setApiOutput(`Error (Promise Chaining API): ${error.message}`);
      });
  };

  const runApiAsyncDemo = async () => {
    setApiOutput('Loading live tasks from backend API via Async/Await (try/catch)...');
    try {
      const tasks = await getTasks();
      setApiOutput(`Success (Async/Await API) - Loaded ${tasks.length} tasks:\n` + JSON.stringify(tasks.slice(0, 2), null, 2));
    } catch (error) {
      setApiOutput(`Error (Async/Await API): ${error.message}`);
    }
  };

  const runCallbackDemo = () => {
    setCallbackOutput('Loading...');
    loadDataWithCallback((error, data) => {
      if (error) {
        setCallbackOutput(`Error: ${error.message}`);
      } else {
        setCallbackOutput(`Data: ${JSON.stringify(data)}`);
      }
    });
  };

  const runPromiseDemo = () => {
    setPromiseOutput('Loading...');
    loadDataWithPromise()
      .then(data => {
        setPromiseOutput(`Data: ${JSON.stringify(data)}`);
      })
      .catch(error => {
        setPromiseOutput(`Error: ${error.message}`);
      });
  };

  const runAsyncAwaitDemo = async () => {
    setAsyncOutput('Loading...');
    try {
      const data = await loadDataWithAsyncAwait();
      setAsyncOutput(`Data: ${JSON.stringify(data)}`);
    } catch (error) {
      setAsyncOutput(`Error: ${error.message}`);
    }
  };

  const runChainingDemos = () => {
    // Callback hell
    setChainingOutput(prev => ({ ...prev, callback: 'Loading...' }));
    fetchDataWithCallbacks((error, data) => {
      if (error) {
        setChainingOutput(prev => ({ ...prev, callback: `Error: ${error.message}` }));
      } else {
        setChainingOutput(prev => ({ ...prev, callback: 'Completed (nested callbacks)' }));
      }
    });

    // Promise chaining
    setChainingOutput(prev => ({ ...prev, promise: 'Loading...' }));
    fetchDataWithPromises()
      .then(data => {
        setChainingOutput(prev => ({ ...prev, promise: 'Completed (promise chain)' }));
      })
      .catch(error => {
        setChainingOutput(prev => ({ ...prev, promise: `Error: ${error.message}` }));
      });

    // Async/await
    setChainingOutput(prev => ({ ...prev, async: 'Loading...' }));
    fetchDataWithAsyncAwait()
      .then(data => {
        setChainingOutput(prev => ({ ...prev, async: 'Completed (async/await)' }));
      })
      .catch(error => {
        setChainingOutput(prev => ({ ...prev, async: `Error: ${error.message}` }));
      });
  };

  const showComparison = () => {
    setComparison(getComparison());
  };

  return (
    <PageContainer 
      title="Promises vs Callbacks Demo" 
      subtitle="Comparing async patterns in JavaScript"
    >
      <div className="demo-page">
        <section className="demo-section">
          <h2>Basic Pattern Comparison</h2>
          <p>
            These three approaches achieve the same result - loading data asynchronously -
            but with different patterns and readability.
          </p>
        </section>

        <section className="demo-section">
          <h3>Callback Pattern</h3>
          <div className="code-example">
            <pre>{`loadDataWithCallback((error, data) => {
  if (error) handleError(error);
  else handleData(data);
});`}</pre>
          </div>
          <button onClick={runCallbackDemo} className="demo-button">
            Run Callback Demo
          </button>
          {callbackOutput && <div className="output-box small">{callbackOutput}</div>}
        </section>

        <section className="demo-section">
          <h3>Promise Pattern</h3>
          <div className="code-example">
            <pre>{`loadDataWithPromise()
  .then(data => handleData(data))
  .catch(error => handleError(error));`}</pre>
          </div>
          <button onClick={runPromiseDemo} className="demo-button">
            Run Promise Demo
          </button>
          {promiseOutput && <div className="output-box small">{promiseOutput}</div>}
        </section>

        <section className="demo-section">
          <h3>Async/Await Pattern</h3>
          <div className="code-example">
            <pre>{`async function load() {
  try {
    const data = await loadDataWithAsyncAwait();
    handleData(data);
  } catch (error) {
    handleError(error);
  }
}`}</pre>
          </div>
          <button onClick={runAsyncAwaitDemo} className="demo-button">
            Run Async/Await Demo
          </button>
          {asyncOutput && <div className="output-box small">{asyncOutput}</div>}
        </section>

        <section className="demo-section">
          <h2>Chaining Comparison</h2>
          <p>Compare how each pattern handles multiple sequential async operations.</p>
          <button onClick={runChainingDemos} className="demo-button">
            Run Chaining Demos
          </button>
          {chainingOutput.callback && (
            <div className="chaining-output">
              <div className="chaining-item">
                <h4>Callbacks</h4>
                <p>{chainingOutput.callback}</p>
              </div>
              <div className="chaining-item">
                <h4>Promises</h4>
                <p>{chainingOutput.promise}</p>
              </div>
              <div className="chaining-item">
                <h4>Async/Await</h4>
                <p>{chainingOutput.async}</p>
              </div>
            </div>
          )}
        </section>

        <section className="demo-section">
          <h2>Real Backend Integration (Hexa Tasks API)</h2>
          <p>
            Compare Promise chaining vs Async/Await patterns by fetching live tasks from the Hexa API. 
            Open `client/src/api/taskApi.js` to see the Promise-chaining fetch implementation side-by-side.
          </p>
          <div className="button-group" style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
            <button onClick={runApiPromiseDemo} className="demo-button">
              Fetch tasks via Promise Chain (.then())
            </button>
            <button onClick={runApiAsyncDemo} className="demo-button">
              Fetch tasks via Async/Await (try/catch)
            </button>
          </div>
          {apiOutput && <pre className="output-box" style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', textAlign: 'left' }}>{apiOutput}</pre>}
        </section>

        <section className="demo-section">
          <button onClick={showComparison} className="demo-button secondary">
            Show Comparison Table
          </button>
        </section>

        {comparison && (
          <section className="demo-output">
            <h3>Pattern Comparison</h3>
            <div className="comparison-grid">
              {Object.entries(comparison).map(([key, value]) => (
                <div key={key} className="comparison-card">
                  <h4>{key.toUpperCase()}</h4>
                  <p><strong>Pattern:</strong> {value.pattern}</p>
                  <p><strong>Error Handling:</strong> {value.errorHandling}</p>
                  <p><strong>Chaining:</strong> {value.chaining}</p>
                  <p><strong>Readability:</strong> {value.readability}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="demo-section explanation">
          <h3>Key Takeaways</h3>
          <ul>
            <li><strong>Callbacks:</strong> Original pattern, error-first convention, leads to callback hell</li>
            <li><strong>Promises:</strong> Better composability, chainable .then(), unified error handling</li>
            <li><strong>Async/Await:</strong> Most readable, looks like synchronous code, try/catch for errors</li>
            <li><strong>await does NOT block</strong> - it only pauses the async function execution</li>
          </ul>
        </section>
      </div>
    </PageContainer>
  );
}

export default PromisesDemo;