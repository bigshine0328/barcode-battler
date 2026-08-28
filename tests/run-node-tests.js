/**
 * Node.js Test Runner for Barcode Battler Engine
 */

// Simple LocalStorage Mock
class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}
global.localStorage = new LocalStorageMock();

import { runAllTests } from './unit-tests.js';

console.log("=== Running Barcode Battler Unit Tests (v4.4.0) ===");
const results = runAllTests();

let passed = 0;
let failed = 0;

results.forEach(r => {
  if (r.status === 'PASSED') {
    console.log(`✅ [PASSED] ${r.name}`);
    passed++;
  } else {
    console.error(`❌ [FAILED] ${r.name}`);
    failed++;
  }
});

console.log(`\n===================================`);
console.log(`Test Summary: ${passed} Passed, ${failed} Failed, Total ${results.length}`);
console.log(`===================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
