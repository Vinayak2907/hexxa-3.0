// NoSQL Concepts Demonstration
// Illustrates embedding vs referencing relationships and aggregation pipelines
// Using JavaScript objects to simulate MongoDB-like concepts

/**
 * Embedding vs Referencing Relationships
 *
 * In NoSQL databases like MongoDB, you have two primary ways to model relationships:
 *
 * 1. EMBEDDING: Store related data directly within a document
 * 2. REFERENCING: Store references (IDs) to related documents in separate collections
 */

// ============================================
// EMBEDDING EXAMPLE
// ============================================

/**
 * In an embedded model, related data is stored within the same document
 * Good for: Data that is always accessed together, one-to-few relationships
 */
const embeddedBlogPost = {
  _id: 'post_123',
  title: 'Understanding NoSQL Relationships',
  author: {
    // Embedded author information
    _id: 'user_456',
    name: 'Jane Doe',
    email: 'jane@example.com',
    profile: {
      bio: 'Software developer passionate about databases',
      avatar: 'https://example.com/avatar.jpg'
    }
  },
  // Embedded comments (array of sub-documents)
  comments: [
    {
      _id: 'comment_789',
      author: {
        _id: 'user_123',
        name: 'John Smith',
        email: 'john@example.com'
      },
      content: 'Great explanation! Really helped me understand the concepts.',
      createdAt: new Date('2023-05-15T10:30:00Z'),
      likes: 5
    },
    {
      _id: 'comment_790',
      author: {
        _id: 'user_456', // Same as post author
        name: 'Jane Doe',
        email: 'jane@example.com'
      },
      content: 'Thanks for the feedback!',
      createdAt: new Date('2023-05-15T11:15:00Z'),
      likes: 2
    }
  ],
  // Embedded tags
  tags: ['NoSQL', 'MongoDB', 'Database Design'],
  createdAt: new Date('2023-05-15T09:00:00Z'),
  updatedAt: new Date('2023-05-15T09:00:00Z')
};

// ============================================
// REFERENCING EXAMPLE
// ============================================

/**
 * In a referencing model, related data is stored in separate documents
 * Good for: Data that is large, frequently updated, or shared across multiple documents
 * Uses DBRefs or manual references (ObjectIDs)
 */
const referencingCollections = {
  users: [
    {
      _id: 'user_456',
      name: 'Jane Doe',
      email: 'jane@example.com',
      profile: {
        bio: 'Software developer passionate about databases',
        avatar: 'https://example.com/avatar.jpg'
      },
      createdAt: new Date('2023-01-15T08:00:00Z')
    },
    {
      _id: 'user_123',
      name: 'John Smith',
      email: 'john@example.com',
      createdAt: new Date('2023-02-20T14:30:00Z')
    }
  ],

  posts: [
    {
      _id: 'post_123',
      title: 'Understanding NoSQL Relationships',
      // Reference to user (manual reference)
      authorId: 'user_456',
      content: 'In this post, we explore...',
      tags: ['NoSQL', 'MongoDB', 'Database Design'],
      createdAt: new Date('2023-05-15T09:00:00Z'),
      updatedAt: new Date('2023-05-15T09:00:00Z')
    }
  ],

  comments: [
    {
      _id: 'comment_789',
      postId: 'post_123', // Reference to post
      authorId: 'user_123', // Reference to user
      content: 'Great explanation! Really helped me understand the concepts.',
      createdAt: new Date('2023-05-15T10:30:00Z'),
      likes: 5
    },
    {
      _id: 'comment_790',
      postId: 'post_123', // Reference to post
      authorId: 'user_456', // Reference to user (post author)
      content: 'Thanks for the feedback!',
      createdAt: new Date('2023-05-15T11:15:00Z'),
      likes: 2
    }
  ]
};

// ============================================
// AGGREGATION PIPELINES EXAMPLE
// ============================================

/**
 * Aggregation pipelines process data records and return computed results.
 * They group values from multiple documents together and perform various operations.
 */
class AggregationPipelineDemo {
  /**
   * Sample dataset for demonstration
   */
  static getSampleData() {
    return [
      { _id: 1, item: 'apple', quantity: 5, price: 1.2, store: 'A', date: new Date('2023-05-01') },
      { _id: 2, item: 'banana', quantity: 3, price: 0.5, store: 'A', date: new Date('2023-05-01') },
      { _id: 3, item: 'apple', quantity: 10, price: 1.2, store: 'B', date: new Date('2023-05-02') },
      { _id: 4, item: 'orange', quantity: 2, price: 1.8, store: 'A', date: new Date('2023-05-03') },
      { _id: 5, item: 'banana', quantity: 6, price: 0.5, store: 'B', date: new Date('2023-05-03') },
      { _id: 6, item: 'apple', quantity: 3, price: 1.2, store: 'A', date: new Date('2023-05-04') }
    ];
  }

  /**
   * Example 1: $match - Filter documents
   * Equivalent to WHERE clause in SQL
   */
  static matchExample() {
    const data = this.getSampleData();
    return data.filter(item => item.store === 'A' && item.quantity > 4);
  }

  /**
   * Example 2: $group - Group documents by field
   * Equivalent to GROUP BY in SQL
   */
  static groupExample() {
    const data = this.getSampleData();
    const grouped = {};

    data.forEach(item => {
      const key = item.store;
      if (!grouped[key]) {
        grouped[key] = { totalQuantity: 0, totalSales: 0, count: 0 };
      }
      grouped[key].totalQuantity += item.quantity;
      grouped[key].totalSales += item.quantity * item.price;
      grouped[key].count += 1;
    });

    return Object.entries(grouped).map(([store, stats]) => ({
      _id: store,
      totalQuantity: stats.totalQuantity,
      totalSales: parseFloat(stats.totalSales.toFixed(2)),
      avgPricePerItem: parseFloat((stats.totalSales / stats.totalQuantity).toFixed(2)),
      transactionCount: stats.count
    }));
  }

  /**
   * Example 3: $lookup - Join data from another collection
   * Equivalent to JOIN in SQL
   */
  static lookupExample() {
    const orders = [
      { _id: 1, item: 'apple', quantity: 2, store: 'A' },
      { _id: 2, item: 'banana', quantity: 1, store: 'B' },
      { _id: 3, item: 'orange', quantity: 3, store: 'A' }
    ];

    const inventory = [
      { _id: 'a', item: 'apple', stock: 50, location: 'Warehouse 1' },
      { _id: 'b', item: 'banana', stock: 30, location: 'Warehouse 2' },
      { _id: 'c', item: 'orange', stock: 20, location: 'Warehouse 1' }
    ];

    // Simulate $lookup
    return orders.map(order => {
      const inventoryItem = inventory.find(inv => inv.item === order.item);
      return {
        ...order,
        inventoryInfo: inventoryItem || null
      };
    });
  }

  /**
   * Example 4: $sort - Sort documents
   * Equivalent to ORDER BY in SQL
   */
  static sortExample() {
    const data = this.getSampleData();
    return [...data].sort((a, b) => b.quantity - a.quantity); // Descending by quantity
  }

  /**
   * Example 5: Complex pipeline - Multiple stages
   * Calculate daily sales totals by store, sorted by revenue
   */
  static complexPipelineExample() {
    const data = this.getSampleData();

    // Stage 1: $match - Filter for last 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const matchedData = data.filter(item => item.date >= threeDaysAgo);

    // Stage 2: $group - Group by store and date
    const groupedByStoreAndDate = {};
    matchedData.forEach(item => {
      const dateKey = item.date.toISOString().split('T')[0];
      const storeKey = item.store;
      const key = `${storeKey}|${dateKey}`;

      if (!groupedByStoreAndDate[key]) {
        groupedByStoreAndDate[key] = { totalQuantity: 0, totalSales: 0 };
      }
      groupedByStoreAndDate[key].totalQuantity += item.quantity;
      groupedByStoreAndDate[key].totalSales += item.quantity * item.price;
    });

    // Stage 3: $project - reshape documents
    const projected = Object.entries(groupedByStoreAndDate).map(([key, stats]) => {
      const [store, date] = key.split('|');
      return {
        store,
        date,
        totalQuantity: stats.totalQuantity,
        totalSales: parseFloat(stats.totalSales.toFixed(2))
      };
    });

    // Stage 4: $sort - Sort by totalSales descending
    return [...projected].sort((a, b) => b.totalSales - a.totalSales);
  }

  /**
   * Get explanation of aggregation pipeline benefits
   */
  static getBenefits() {
    return [
      'Process data in stages, each transforming the documents',
      'Can filter, group, reshape, and sort data efficiently',
      'Eliminates need for multiple queries and client-side processing',
      'Optimized for performance on large datasets',
      'Can include complex expressions and conditional logic',
      'Supports operations like $lookup (joins), $facet (multi-pipeline), etc.'
    ];
  }
}

// ============================================
// EXPORT FUNCTIONS FOR DEMONSTRATION
// ============================================

export function getEmbeddingExample() {
  return {
    title: 'Embedding Relationships Example',
    description: 'Related data stored within the same document',
    data: embeddedBlogPost,
    benefits: [
      'Atomic reads - all related data retrieved in one query',
      'Better performance for frequently accessed together data',
      'Simpler querying for hierarchical data',
      'Reduces need for joins'
    ],
    tradeoffs: [
      'Can lead to large documents if overused',
      'Data duplication if same embedded data appears in multiple places',
      'Updating embedded data requires updating all parent documents',
      'Document size limits (16MB in MongoDB)'
    ],
    useCases: [
      'One-to-few relationships (comments on a blog post)',
      'Hierarchical data (categories with subcategories)',
      'Data that is always accessed together (user profile with preferences)',
      'Embedded documents that are small and infrequently updated'
    ]
  };
}

export function getReferencingExample() {
  return {
    title: 'Referencing Relationships Example',
    description: 'Related data stored in separate documents with references',
    data: referencingCollections,
    benefits: [
      'Normalized data structure reduces duplication',
      'Easier to maintain and update referenced data',
      'Supports many-to-many relationships naturally',
      'No document size limitations',
      'References can be shared across multiple documents'
    ],
    tradeoffs: [
      'Requires multiple queries or joins to retrieve related data',
      'More complex querying for hierarchical data',
      'Potential for orphaned references if not managed properly',
      'May require application-level join logic'
    ],
    useCases: [
      'One-to-many or many-to-many relationships (users and posts)',
      'Large sub-documents that grow indefinitely (activity logs)',
      'Shared reference data (categories, tags, reference lists)',
      'When related data is accessed independently'
    ]
  };
}

export function getAggregationPipelineExample() {
  return {
    title: 'Aggregation Pipeline Example',
    description: 'Data processing pipeline that transforms and computes results',
    sampleData: AggregationPipelineDemo.getSampleData(),
    examples: {
      match: {
        title: '$match - Filter Documents',
        description: 'Equivalent to SQL WHERE clause',
        code: 'db.collection.find({ store: "A", quantity: { $gt: 4 } })',
        result: AggregationPipelineDemo.matchExample()
      },
      group: {
        title: '$group - Group Documents',
        description: 'Equivalent to SQL GROUP BY with aggregates',
        code: 'db.collection.aggregate([ { $group: { _id: "$store", totalQuantity: { $sum: "$quantity" }, totalSales: { $sum: { $multiply: ["$quantity", "$price"] } } } } ])',
        result: AggregationPipelineDemo.groupExample()
      },
      lookup: {
        title: '$lookup - Join Collections',
        description: 'Equivalent to SQL LEFT JOIN',
        code: 'db.orders.aggregate([ { $lookup: { from: "inventory", localField: "item", foreignField: "item", as: "inventoryInfo" } } ])',
        result: AggregationPipelineDemo.lookupExample()
      },
      sort: {
        title: '$sort - Sort Documents',
        description: 'Equivalent to SQL ORDER BY',
        code: 'db.collection.find().sort({ quantity: -1 })',
        result: AggregationPipelineDemo.sortExample()
      },
      complex: {
        title: 'Complex Pipeline - Multiple Stages',
        description: 'Daily sales totals by store, sorted by revenue',
        result: AggregationPipelineDemo.complexPipelineExample()
      }
    },
    benefits: AggregationPipelineDemo.getBenefits(),
    pipelineStages: [
      '$match - Filter documents',
      '$group - Group documents by key',
      '$project - Reshape documents',
      '$sort - Sort documents',
      '$lookup - Join with another collection',
      '$unwind - Deconstruct arrays',
      '$facet - Multiple pipelines in one stage',
      '$count - Count documents',
      '$addFields - Add new fields',
      '$replaceRoot - Replace input document'
    ]
  };
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// In a service layer, you might use these concepts like:

// For embedding:
async function getPostWithComments(postId) {
  // Single query gets post, author, and all comments
  return await db.posts.findOne({ _id: postId });
  // Returns the embedded structure shown above
}

// For referencing:
async function getPostWithComments(postId) {
  // First get the post
  const post = await db.posts.findOne({ _id: postId });
  // Then get comments separately (or use $lookup in aggregation)
  const comments = await db.comments.find({ postId: postId });
  // Combine in application logic
  return { ...post, comments };
}

// For aggregation pipelines:
async function getStoreSalesReport() {
  // Single aggregation query does all the work
  return await db.sales.aggregate([
    { $match: { date: { $gte: startDate } } },
    { $group: {
        _id: { store: "$store", date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
        totalQuantity: { $sum: "$quantity" },
        totalSales: { $sum: { $multiply: ["$quantity", "$price"] } }
      }
    },
    { $sort: { "totalSales.totalSales": -1 } }
  ]);
*/