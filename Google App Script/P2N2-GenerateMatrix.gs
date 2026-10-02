/**
 * Google Apps Script for P2N2
 * Populates the "Matrix" sheet using data from "Simplified Food Bank Order",
 * "Previous Inventory", and "Client List" sheets.
 */
function generateMatrix() {
  var LogLevel = "DEBUG"
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get required sheets
  var matrixSheet = ss.getSheetByName("Matrix");
  var orderSheet = ss.getSheetByName("Simplified Food Bank Order");
  var inventorySheet = ss.getSheetByName("Previous Inventory");
  var clientSheet = ss.getSheetByName("Client List");
  
  if (!matrixSheet || !orderSheet || !clientSheet) {
    throw new Error("Missing one or more required sheets: Matrix, Simplified Food Bank Order, or Client List.");
  }
  
  // Clear existing content in Matrix sheet
  matrixSheet.clear();
  
  // 1. Process "Simplified Food Bank Order"
  var orderData = orderSheet.getDataRange().getValues();
  if (orderData.length <= 1) {
    Logger.log("No order data found to process.");
    return;
  }
  
  // Separate header and rows
  var orderHeader = orderData[0];
  var orderRows = orderData.slice(1);
  
  // Sort order rows by column D (Location) ascending.
  // We assume column D is index 3 (0-indexed). If index 3 doesn't exist, we fall back to sorting by index 0.
  orderRows.sort(function(a, b) {
    if(LogLevel == "DEBUG") {
          Logger.log("Sorting.");
    }
    var valA = a.length > 3 ? parseFloat(a[3]) : 0;
    var valB = b.length > 3 ? parseFloat(b[3]) : 0;
    if (isNaN(valA)) valA = 0;
    if (isNaN(valB)) valB = 0;
    return valA - valB;
  });
  
  // Prepare Matrix headers (Row 1: Item Names, Row 2: Quantities, Row 3: Locations, starting at Column D)
  var itemNames = [];
  var quantities = [];
  var locations = [];
  var orderItemMap = {}; // Maps item name to its column index (0-indexed, where 0 is Column D)
  
  var writeIdx = 0;
  for (var i = 0; i < orderRows.length; i++) {
    var row = orderRows[i];
    var loc = row.length > 3 ? String(row[3]).trim() : "";
    
    // Check if location is blank or 0
    if (loc === "" || loc === "0" || parseFloat(loc) === 0) {
      continue;
    }
    
    if(LogLevel == "DEBUG") {
      Logger.log("Pusshing Qty and Location")
    }

    var itemName = row[0]; // Column A (Item Name)
    var qty = row[1];      // Column B (Qty)
    itemNames.push(itemName);
    quantities.push(qty);
    locations.push(loc);
    orderItemMap[itemName] = writeIdx;
    writeIdx++;
  }
  
  // Write labels in Column C
  matrixSheet.getRange("C1").setValue("Item Name");
  matrixSheet.getRange("C2").setValue("Food Bank Qty");
  matrixSheet.getRange("C3").setValue("Previous Inventory");
  matrixSheet.getRange("C5").setValue("Location");

  // Write Item Names (Row 1) starting at Column D (column 4)
  if (itemNames.length > 0) {
    matrixSheet.getRange(1, 4, 1, itemNames.length).setValues([itemNames]);
  }
  
  // Write Quantities (Row 2) starting at Column D
  if (quantities.length > 0) {
    matrixSheet.getRange(2, 4, 1, quantities.length).setValues([quantities]);
  }
  
  // 2. Process "Previous Inventory" (matching items and placing in Row 3)
  if (inventorySheet && itemNames.length > 0) {
    var inventoryData = inventorySheet.getDataRange().getValues();
    var inventoryRow = new Array(itemNames.length).fill(0); // Default to 0 inventory
    
    // We assume Column A is Item Name, and Column B is Inventory Qty
    if (inventoryData.length > 1) {
      for (var j = 1; j < inventoryData.length; j++) {
        var invItemName = inventoryData[j][0];
        if(LogLevel == "DEBUG") {
            Logger.log("Item name: " + invItemName)
        }
        var invQty = inventoryData[j][1];
        if (invItemName && orderItemMap.hasOwnProperty(invItemName)) {
          var colIdx = orderItemMap[invItemName];
          inventoryRow[colIdx] = invQty;
        }
      }
    }
    // Write Previous Inventory (Row 3) starting at Column D
    matrixSheet.getRange(3, 4, 1, inventoryRow.length).setValues([inventoryRow]);
  }
  
  // Write Locations (Row 5) starting at Column D (leaving Row 4 blank)
  if (locations.length > 0) {
    matrixSheet.getRange(5, 4, 1, locations.length).setValues([locations]);
  }
  
  // 3. Process "Client List"
  var clientData = clientSheet.getDataRange().getValues();
  if (clientData.length > 1) {
    var clientRowsToWrite = [];
    
    // Read Client rows (excluding header)
    for (var k = 1; k < clientData.length; k++) {
      var clientName = clientData[k][1]; // Column B (Name)
      var familySize = clientData[k][3]; // Column D (Number in family)
      if (clientName) {
        clientRowsToWrite.push([clientName, familySize]);
      }
    }
    
    // Write Client names and family sizes starting at Row 7, Columns A and B
    if (clientRowsToWrite.length > 0) {
      matrixSheet.getRange(7, 1, clientRowsToWrite.length, 2).setValues(clientRowsToWrite);
    }
  }
  
  Logger.log("Matrix sheet populated successfully!");
}

