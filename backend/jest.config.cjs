/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  // No transform needed – Jest runs the ESM files natively via
  // the --experimental-vm-modules flag in the test script.
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  // Allow up to 30 s per test for DB round-trips.
  testTimeout: 30000,
};
