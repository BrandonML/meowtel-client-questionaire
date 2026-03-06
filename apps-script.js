// ============================================================
// MEOWTEL MEET & GREET — Google Apps Script
// Results saved to Google Sheets via Web App URL: https://docs.google.com/spreadsheets/d/180xGKM5pD0SAYXjtly51BOljjWJNy2XoeNseP-QG2AQ/edit?gid=0#gid=0
// ============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // If the sheet is brand new (no headers yet), write them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(buildHeaders(data.sections));
      // Style the header row
      var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
      headerRange.setBackground('#1a1208');
      headerRange.setFontColor('#faf6f0');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Build the data row
    var row = buildRow(data);
    sheet.appendRow(row);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, 6); // resize first 6 meta columns

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handles browser preflight CORS check
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildHeaders(sections) {
  var headers = ['Saved At', 'Client Name', 'Meet & Greet Date', 'Sitter Name', 'Cat Names'];
  sections.forEach(function(sec) {
    sec.questions.forEach(function(q) {
      headers.push('[' + sec.title + '] ' + q);
    });
  });
  return headers;
}

function buildRow(data) {
  var row = [
    new Date().toLocaleString(),
    data.clientName || '',
    data.meetDate || '',
    data.sitterName || '',
    data.catNames || ''
  ];
  data.sections.forEach(function(sec, si) {
    sec.questions.forEach(function(q, qi) {
      var key = si + '_' + qi;
      row.push(data.answers[key] || '');
    });
  });
  return row;
}
