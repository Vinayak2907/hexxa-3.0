// JavaScript Hoisting Demonstration
// Shows how var, function declarations, and let/const behave differently

// ============================================
// VAR HOISTING
// ============================================

// Before hoisting, typeof returns 'undefined' for var (not undeclared)
export function demonstrateVarHoisting() {
  const results = [];
  
  // Accessing variable before declaration - returns undefined (not error)
  // The variable is hoisted to the top of the function scope
  results.push(`typeof hoistedVar: ${typeof hoistedVar}`); // 'undefined'
  
  // Variable declaration is hoisted, but not initialization
  var hoistedVar = 'Hexa';
  
  results.push(`After assignment: ${hoistedVar}`); // 'Hexa'
  
  return results;
}

// ============================================
// FUNCTION DECLARATION HOISTING
// ============================================

// Function declarations are fully hoisted - both declaration and body
export function demonstrateFunctionHoisting() {
  const results = [];
  
  // Can call function before its declaration - works!
  results.push(declaredFunction()); // 'works!'
  
  // This is because function declarations are fully hoisted
  function declaredFunction() {
    return 'Function declaration works!';
  }
  
  return results;
}

// ============================================
// FUNCTION EXPRESSION HOISTING
// ============================================

export function demonstrateFunctionExpression() {
  const results = [];
  
  // Function expression - only variable is hoisted
  // Calling before assignment throws TypeError
  try {
    results.push(typeof functionExpression); // 'undefined'
    // results.push(functionExpression()); // Would throw: functionExpression is not a function
  } catch (e) {
    results.push(`Error: ${e.message}`);
  }
  
  var functionExpression = function() {
    return 'Function expression';
  };
  
  results.push(functionExpression()); // Works now
  
  return results;
}

// ============================================
// LET AND CONST HOISTING (TEMPORAL DEAD ZONE)
// ============================================

export function demonstrateTDZ() {
  const results = [];
  
  // let and const ARE hoisted - they exist in lexical environment
  // But they cannot be accessed before initialization (Temporal Dead Zone)
  
  // results.push(typeof tdzVar); // ReferenceError in TDZ!
  // This is because let/const are in "temporal dead zone" from 
  // start of block until declaration
  
  let tdzVar = 'Now accessible';
  results.push(tdzVar); // Works
  
  // const also has TDZ
  const tdzConst = 'Const value';
  results.push(tdzConst); // Works
  
  return results;
}

// ============================================
// SUMMARY
// ============================================

export function getHoistingSummary() {
  return {
    var: {
      hoisted: true,
      initialValue: 'undefined',
      scope: 'function scope',
      canUseBeforeDeclaration: true,
      explanation: 'var declarations are hoisted to the top of their function scope with initial value undefined'
    },
    functionDeclaration: {
      hoisted: true,
      initialValue: 'entire function',
      scope: 'function scope',
      canUseBeforeDeclaration: true,
      explanation: 'Function declarations are fully hoisted - both name and body are available'
    },
    functionExpression: {
      hoisted: true,
      initialValue: 'undefined',
      scope: 'function scope',
      canUseBeforeDeclaration: false,
      explanation: 'Only the variable declaration is hoisted, not the function value'
    },
    let: {
      hoisted: true,
      initialValue: 'uninitialized (TDZ)',
      scope: 'block scope',
      canUseBeforeDeclaration: false,
      explanation: 'let is hoisted but remains uninitialized in Temporal Dead Zone until declaration'
    },
    const: {
      hoisted: true,
      initialValue: 'uninitialized (TDZ)',
      scope: 'block scope',
      canUseBeforeDeclaration: false,
      explanation: 'const is hoisted but remains uninitialized in TDZ, must be initialized at declaration'
    }
  };
}

/*
Key Points About Hoisting:
===========================

1. ALL declarations (var, let, const, function, class) are hoisted
2. var: hoisted with value undefined
3. let/const: hoisted but in TDZ (Temporal Dead Zone)
4. Function declarations: fully hoisted with body
5. Function expressions: only variable hoisted

Important: "hoisted" doesn't mean the code is physically moved.
It means the JavaScript engine parses declarations first before execution.

The Temporal Dead Zone (TDZ):
- let and const exist in lexical scope before their declaration
- Accessing them before declaration throws ReferenceError
- This helps catch bugs early
*/