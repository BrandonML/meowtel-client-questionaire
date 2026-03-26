const ContentService = {
  MimeType: { JSON: 'JSON' },
  createTextOutput: (content) => {
    let _mimeType;
    const output = {
      setMimeType: (mimeType) => {
        _mimeType = mimeType;
        return output;
      },
      getContent: () => content,
      getMimeType: () => _mimeType
    };
    return output;
  }
};

const SpreadsheetApp = {
  getActiveSpreadsheet: () => ({
    getActiveSheet: () => ({
      getLastRow: () => 0,
      appendRow: () => {},
      getRange: () => ({
        setBackground: () => {},
        setFontColor: () => {},
        setFontWeight: () => {},
        setValues: () => {},
        getValues: () => [[]]
      }),
      setFrozenRows: () => {},
      getLastColumn: () => 0,
      autoResizeColumns: () => {}
    })
  })
};

module.exports = {
  ContentService,
  SpreadsheetApp
};
