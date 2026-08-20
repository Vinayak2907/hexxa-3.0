// NoSQL Concepts Demo Page
// Demonstrates embedding vs referencing and aggregation pipelines

import { useState } from 'react';
import PageContainer from '../components/PageContainer.jsx';
import './NoSQLDemo.css';

function NoSQLDemo() {
  const [activeTab, setActiveTab] = useState('embedding');
  const nosqlConcepts = require('../demos/nosqlConcepts.js');

  const tabs = [
    { id: 'embedding', label: 'Embedding vs Referencing' },
    { id: 'aggregation', label: 'Aggregation Pipelines' }
  ];

  return (
    <PageContainer
      title="NoSQL Concepts Demo"
      subtitle="Explore MongoDB-style data modeling and aggregation"
    >
      <div className="nosql-demo-page">
        {/* Tabs */}
        <div className="demo-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'embedding' && (
            <div className="embedding-section">
              <h2>Embedding vs Referencing Relationships</h2>

              <div className="concept-box">
                <h3>Embedding Example</h3>
                <p><strong>Description:</strong> Related data stored within the same document</p>
                <div className="code-title">Blog Post with Embedded Author and Comments</div>
                <pre className="code-block">{JSON.stringify(nosqlConcepts.getEmbeddingExample().data, null, 2)}</pre>
                <div className="benefits-tradeoffs">
                  <div className="benefits">
                    <h4>Benefits:</h4>
                    <ul>
                      {nosqlConcepts.getEmbeddingExample().benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="tradeoffs">
                    <h4>Trade-offs:</h4>
                    <ul>
                      {nosqlConcepts.getEmbeddingExample().tradeoffs.map((tradeoff, index) => (
                        <li key={index}>{tradeoff}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="use-cases">
                  <h4>Use Cases:</h4>
                  <ul>
                    {nosqlConcepts.getEmbeddingExample().useCases.map((useCase, index) => (
                      <li key={index}>{useCase}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="concept-box">
                <h3>Referencing Example</h3>
                <p><strong>Description:</strong> Related data stored in separate documents with references</p>
                <div className="code-title">Separate Collections for Users, Posts, and Comments</div>
                <pre className="code-block">{JSON.stringify(nosqlConcepts.getReferencingExample().data, null, 2)}</pre>
                <div className="benefits-tradeoffs">
                  <div className="benefits">
                    <h4>Benefits:</h4>
                    <ul>
                      {nosqlConcepts.getReferencingExample().benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="tradeoffs">
                    <h4>Trade-offs:</h4>
                    <ul>
                      {nosqlConcepts.getReferencingExample().tradeoffs.map((tradeoff, index) => (
                        <li key={index}>{tradeoff}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="use-cases">
                  <h4>Use Cases:</h4>
                  <ul>
                    {nosqlConcepts.getReferencingExample().useCases.map((useCase, index) => (
                      <li key={index}>{useCase}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'aggregation' && (
            <div className="aggregation-section">
              <h2>Aggregation Pipelines</h2>

              <div className="concept-box">
                <h3>Sample Dataset</h3>
                <p><strong>Description:</strong> Sample sales data for demonstration</p>
                <div className="code-title">Sales Collection Documents</div>
                <pre className="code-block">{JSON.stringify(nosqlConcepts.getAggregationPipelineExample().sampleData, null, 2)}</pre>
              </div>

              <div className="concept-box">
                <h3>Aggregation Pipeline Examples</h3>

                {/* Match Example */}
                <div className="pipeline-example">
                  <h4>$match - Filter Documents</h4>
                  <p><strong>Description:</strong> Equivalent to SQL WHERE clause</p>
                  <div className="code-title">Find items in store A with quantity &gt; 4</div>
                  <pre className="code-block">{'db.collection.find({ store: "A", quantity: { $gt: 4 } })'}</pre>
                  <div className="result-title">Result:</div>
                  <pre className="code-block result">{JSON.stringify(nosqlConcepts.getAggregationPipelineExample().examples.match.result, null, 2)}</pre>
                </div>

                {/* Group Example */}
                <div className="pipeline-example">
                  <h4>$group - Group Documents</h4>
                  <p><strong>Description:</strong> Equivalent to SQL GROUP BY with aggregates</p>
                  <div className="code-title">Group by store and calculate totals</div>
                  <pre className="code-block">{`db.collection.aggregate([
  { $group: {
    _id: "$store",
    totalQuantity: { $sum: "$quantity" },
    totalSales: { $sum: { $multiply: ["$quantity", "$price"] } }
  } }
])`}</pre>
                  <div className="result-title">Result:</div>
                  <pre className="code-block result">{JSON.stringify(nosqlConcepts.getAggregationPipelineExample().examples.group.result, null, 2)}</pre>
                </div>

                {/* Lookup Example */}
                <div className="pipeline-example">
                  <h4>$lookup - Join Collections</h4>
                  <p><strong>Description:</strong> Equivalent to SQL LEFT JOIN</p>
                  <div className="code-title">Join orders with inventory information</div>
                  <pre className="code-block">{`db.orders.aggregate([
  { $lookup: {
    from: "inventory",
    localField: "item",
    foreignField: "item",
    as: "inventoryInfo"
  } }
])`}</pre>
                  <div className="result-title">Result:</div>
                  <pre className="code-block result">{JSON.stringify(nosqlConcepts.getAggregationPipelineExample().examples.lookup.result, null, 2)}</pre>
                </div>

                {/* Sort Example */}
                <div className="pipeline-example">
                  <h4>$sort - Sort Documents</h4>
                  <p><strong>Description:</strong> Equivalent to SQL ORDER BY</p>
                  <div className="code-title">Sort by quantity descending</div>
                  <pre className="code-block">{'db.collection.find().sort({ quantity: -1 })'}</pre>
                  <div className="result-title">Result:</div>
                  <pre className="code-block result">{JSON.stringify(nosqlConcepts.getAggregationPipelineExample().examples.sort.result, null, 2)}</pre>
                </div>

                {/* Complex Pipeline Example */}
                <div className="pipeline-example">
                  <h4>Complex Pipeline - Multiple Stages</h4>
                  <p><strong>Description:</strong> Daily sales totals by store, sorted by revenue</p>
                  <div className="result-title">Result:</div>
                  <pre className="code-block result">{JSON.stringify(nosqlConcepts.getAggregationPipelineExample().examples.complex.result, null, 2)}</pre>
                  <div className="pipeline-stages">
                    <h5>Pipeline Stages:</h5>
                    <ol>
                      {nosqlConcepts.getAggregationPipelineExample().pipelineStages.map((stage, index) => (
                        <li key={index}>{stage}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              <div className="concept-box">
                <h3>Benefits of Aggregation Pipelines</h3>
                <ul>
                  {nosqlConcepts.getAggregationPipelineExample().benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default NoSQLDemo;