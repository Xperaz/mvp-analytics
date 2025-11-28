// Suppress console.error during tests to keep output clean
// Error cases are tested by checking thrown exceptions, not console output

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});
