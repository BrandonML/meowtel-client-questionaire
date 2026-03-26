const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');
const { ContentService, SpreadsheetApp } = require('./mocks.js');

const code = fs.readFileSync('js/apps-script.js', 'utf8');

function setupContext() {
  const context = {
    ContentService,
    SpreadsheetApp,
    console,
    JSON,
    Date
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context;
}

test('doPost handles malformed JSON correctly', () => {
  const context = setupContext();
  const e = {
    postData: {
      contents: 'invalid-json'
    }
  };

  const response = context.doPost(e);
  const content = JSON.parse(response.getContent());

  assert.strictEqual(content.success, false);
  assert.ok(content.error, 'Response should contain an error message');
  assert.ok(content.error.includes('Unexpected token'), 'Error message should describe JSON parsing error');
});

test('doPost handles missing postData gracefully', () => {
    const context = setupContext();
    const e = {}; // Missing postData

    const response = context.doPost(e);
    const content = JSON.parse(response.getContent());

    assert.strictEqual(content.success, false);
    assert.ok(content.error, 'Response should contain an error message');
});
