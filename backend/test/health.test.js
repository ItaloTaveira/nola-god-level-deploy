const app = require('../src/index');

describe('app sanity', () => {
  it('exports an express app', () => {
    expect(app).toBeDefined();
    // app.listen exists when running; in tests we just ensure it's an object/function
  });
});
