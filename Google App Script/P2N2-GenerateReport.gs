function generateClientDoc() {

  // Get the active Row
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Get the row number where the user's cursor is currently positioned
  const activeRowIndex = sheet.getActiveCell().getRow(); 
  const totalColumns = sheet.getLastColumn();
  
  // Grab the data from that active row
  const rowRange = sheet.getRange(activeRowIndex, 1, 1, totalColumns);
  const rowData = rowRange.getValues()[0]; // [
  
  const itemNames = sheet.getRange(1,1,1,totalColumns).getValues()[0]
  const locations = sheet.getRange(5,1,1,totalColumns).getValues()[0]
  
  // Get today's data for the report
  const today = new Date();
  const isoDate = today.toISOString().split('T')[0];

  const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const docName = rowData[0] + " " + isoDate
  const doc = DocumentApp.create(docName)
  const body = doc.getBody();
  body.editAsText().setFontFamily("Ariel")
  body.editAsText().setFontSize(14)
  body.editAsText().setBold(true)

  //const footer = doc.getFooter()
  

   body.appendParagraph(formattedDate + "  HAMILTON PK UMC  Path 2 Nourishment 2 (P2N2)").setLineSpacing(1.5)
   body.appendParagraph("ORDER # _______").setLineSpacing(1.5)
   body.appendParagraph("Family Name: " + rowData[0] ).setLineSpacing(1.5)
   body.appendParagraph("Number in Family:  " + rowData[1]).setLineSpacing(1.5)

   for(i=3;i<totalColumns;i++) {
     sectionHeadings(i, body)
     qty = String(rowData[i]).padStart(4, ' ').padEnd(8, ' '); // qty will be 8 characters after
     p = body.appendParagraph(qty + locations[i] + ".  " + itemNames[i])
     p.editAsText().setUnderline(false)
     p.editAsText().setUnderline(1,8,true)
   }

   body.appendParagraph("PRODUCE (circle one)           YES           NO")
   body.appendParagraph("")
   body.appendParagraph("VOLUNTEER INITIALS          ____________            __________")

   body.appendParagraph("NEIGHBORS!")
   body.appendParagraph("OUR NEXT PATH 2 NOURISHMENT 2(P2N2) FOOD DISTRIBUTION WILL BE 2ND SATURDAY, JULY 11, 2026 FROM " +
                        "8:30 AM - 11:30 AM")

    body.appendParagraph("PLEASE CALL 214-870-3314 or 214-563-7504 IF YOU HAVE ANY QUESTIONS OR CONCERNS. PLEASE LET US " +
                         "KNOW IF YOU ARE NOT ABLE TO PICK UP YOUR FOOD ITEMS. THANK YOU FOR ALLOWING US TO SERVE YOUR FAMILY")
  
}

function sectionHeadings(line, body) {
  var p;
  switch (line) {
    case 3:       body.appendParagraph(""); p = body.appendParagraph("Quantity FROZEN FOOD ITEMS"); break;
    case 8:       body.appendParagraph(""); p = body.appendParagraph("Quantity REFRIGERATED FOOD ITEMS"); break;
    case 10:      body.appendParagraph(""); p = body.appendParagraph("Quantity FRUITS"); break;
    case 15:      body.appendParagraph(""); p = body.appendParagraph("Quantity VEGETABLES"); break;
    case 23:      body.appendParagraph(""); p = body.appendParagraph("Quantity PASTAS. CEREALS, GRAINS"); break;
    case 29:      body.appendParagraph(""); p = body.appendParagraph("Quantity SAUCES"); break;
    case 32:      body.appendParagraph(""); p = body.appendParagraph("Quantity SNACKS"); break;
    case 36:      body.appendParagraph(""); p = body.appendParagraph("Quantity BEVERAGES"); break;
    case 38:      body.appendParagraph(""); p = body.appendParagraph("Quantity KITCHEN"); break;
    default: return
  }
  p.setLineSpacing(1.5)
  p.editAsText().setUnderline(true)
}
