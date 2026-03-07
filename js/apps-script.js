// ============================================================
// MEOWTEL MEET & GREET — Google Apps Script
// Results saved to Google Sheets via Web App URL: https://docs.google.com/spreadsheets/d/180xGKM5pD0SAYXjtly51BOljjWJNy2XoeNseP-QG2AQ/edit?gid=0#gid=0
// UPSERT LOGIC:
//   - If a reservation # is present and a matching row is found,
//     that row is overwritten (updated).
//   - If no match is found, or no reservation # was provided,
//     a new row is appended (inserted).
// ============================================================

// Column index (1-based) where Reservation # lives in the sheet.
// If you ever reorder the header columns, update this value.
var RES_NUM_COL = 2;

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data  = JSON.parse(e.postData.contents);
    var row   = buildRow(data);

    // Write headers if this is a brand-new sheet
    if (sheet.getLastRow() === 0) {
      var headers = buildHeaders(data.sections);
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#1a3a5c');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var resNum      = (data.reservationNum || '').toString().trim();
    var existingRow = resNum ? findRowByResNum(sheet, resNum) : -1;

    if (existingRow > 0) {
      // UPDATE — overwrite every cell in that row
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      // INSERT — append as a new row
      sheet.appendRow(row);
    }

    // Keep the first several meta columns readable
    sheet.autoResizeColumns(1, 8);

    return jsonResponse({ success: true, action: existingRow > 0 ? 'updated' : 'inserted' });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// Handles GET requests:
//   ?action=list  → returns all sheet rows as JSON for the Saved Clients panel
//   (no params)   → health check
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;

  if (action === 'list') {
    var sheet   = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      return jsonResponse({ headers: [], rows: [] });
    }

    var lastCol  = sheet.getLastColumn();
    var headers  = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var rowData  = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    return jsonResponse({ headers: headers, rows: rowData });
  }

  return jsonResponse({ status: 'ok' });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Scans the RES_NUM_COL column for a matching reservation number.
// Returns the 1-based row index if found, or -1 if not.
function findRowByResNum(sheet, resNum) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1; // only a header row or empty

  var colValues = sheet.getRange(2, RES_NUM_COL, lastRow - 1, 1).getValues();
  for (var i = 0; i < colValues.length; i++) {
    if (colValues[i][0].toString().trim() === resNum) {
      return i + 2; // +2 accounts for 1-based index and the header row
    }
  }
  return -1;
}

function buildHeaders(sections) {
  var headers = [
    'Last Updated',
    'Reservation #',
    'First Name',
    'Last Name',
    'Cat Name(s)',
    'Date Start',
    'Date End',
    'Address'
  ];
  sections.forEach(function(sec) {
    sec.questions.forEach(function(q) {
      headers.push('[' + sec.title + '] ' + q.q);
      if (q.notes) {
        headers.push('[' + sec.title + '] ' + q.q + ' — notes');
      }
    });
  });
  return headers;
}

function buildRow(data) {
  var address = [data.addrStreet, data.addrCity, data.addrState, data.addrZip]
    .filter(Boolean).join(', ');

  var row = [
    new Date().toLocaleString(),
    data.reservationNum || '',
    data.firstName      || '',
    data.lastName       || '',
    data.catNames       || '',
    data.dateStart      || '',
    data.dateEnd        || '',
    address
  ];

  data.sections.forEach(function(sec, si) {
    sec.questions.forEach(function(q, qi) {
      var key = si + '_' + qi;
      row.push(data.answers[key] || '');
      if (q.notes) {
        row.push(data.answers[key + '_n'] || '');
      }
    });
  });

  return row;
}
