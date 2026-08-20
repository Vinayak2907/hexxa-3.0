// HoistingDemo Page - Interactive JavaScript hoisting demonstration

import { useState } from 'react';
import { 
  demonstrateVarHoisting, 
  demonstrateFunctionHoisting,
  demonstrateTDZ,
  getHoistingSummary 
} from '../demos/hoistingDemo.js';
import PageContainer from '../components/PageContainer.jsx';
import './DemoPages.css';

function HoistingDemo() {
  const [output, setOutput] = useState([]);
  const [summary, setSummary] = useState(null);

  const runVarDemo = () => {
    const results = demonstrateVarHoisting();
    setOutput(results);
  };

  const runFunctionDemo = () => {
    const results = demonstrateFunctionHoisting();
    setOutput(results);
  };

  const runTDZDemo = () => {
    const results = demonstrateTDZ();
    setOutput(results);
  };

  const showSummary = () => {
    setSummary(getHoistingSummary());
  };

  return (
    <PageContainer 
      title="JavaScript Hoisting Demo" 
      subtitle="Understanding how JavaScript handles variable and function declarations"
    >
      <div className="demo-page">
        <section className="demo-section">
          <h2>What is Hoisting?</h2>
          <p>
            Hoisting is JavaScript's behavior of moving declarations to the top 
            of their scope before code execution. All declarations (var, let, const, 
            function) are hoisted, but they behave differently.
          </p>
        </section>

        <section className="demo-section">
          <h3>Demo: var Hoisting</h3>
          <div className="code-example">
            <pre>{`// Before declaration - returns 'undefined'
console.log(typeof hoistedVar); // 'undefined'

var hoistedVar = 'Hexa';
console.log(hoistedVar); // 'Hexa'`}</pre>
          </div>
          <button onClick={runVarDemo} className="demo-button">
            Run var Demo
          </button>
        </section>

        <section className="demo-section">
          <h3>Demo: Function Declaration Hoisting</h3>
          <div className="code-example">
            <pre>{`// Can call before declaration - fully hoisted!
console.log(declaredFunction()); // 'works!'

function declaredFunction() {
  return 'Function declaration works!';
}`}</pre>
          </div>
          <button onClick={runFunctionDemo} className="demo-button">
            Run Function Demo
          </button>
        </section>

        <section className="demo-section">
          <h3>Demo: Temporal Dead Zone (let/const)</h3>
          <div className="code-example">
            <pre>{`// let and const are hoisted but in TDZ
// Accessing before declaration throws ReferenceError

let tdzVar = 'Now accessible'; // After TDZ
console.log(tdzVar); // Works`}</pre>
          </div>
          <button onClick={runTDZDemo} className="demo-button">
            Run TDZ Demo
          </button>
        </section>

        {output.length > 0 && (
          <section className="demo-output">
            <h3>Output:</h3>
            <div className="output-box">
              {output.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </section>
        )}

        <section className="demo-section">
          <button onClick={showSummary} className="demo-button secondary">
            Show Summary Table
          </button>
        </section>

        {summary && (
          <section className="demo-output">
            <h3>Hoisting Summary</h3>
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Hoisted?</th>
                  <th>Initial Value</th>
                  <th>Use Before Declaration?</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary).map(([key, value]) => (
                  <tr key={key}>
                    <td><strong>{key}</strong></td>
                    <td>{value.hoisted ? '✓' : '✗'}</td>
                    <td>{value.initialValue}</td>
                    <td>{value.canUseBeforeDeclaration ? '✓' : '✗ (TDZ)'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="demo-section explanation">
          <h3>Key Points</h3>
          <ul>
            <li><strong>var:</strong> Hoisted with value undefined, function scope</li>
            <li><strong>let:</strong> Hoisted but uninitialized (TDZ), block scope</li>
            <li><strong>const:</strong> Hoisted but uninitialized (TDZ), block scope, must be initialized</li>
            <li><strong>Function declarations:</strong> Fully hoisted with body</li>
            <li><strong>Function expressions:</strong> Only variable hoisted</li>
          </ul>
          <p className="note">
            <strong>Note:</strong> let and const ARE hoisted - they exist in the lexical 
            environment but cannot be accessed until the declaration is reached. This is 
            the Temporal Dead Zone.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}

export default HoistingDemo;