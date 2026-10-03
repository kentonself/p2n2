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
  today.setDate(today.getDate() + 6 - today.getDay());  // Set to following Saturday
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
   text = "Family Name:     " + rowData[0] + "\u2008\u2008\u2008\u2008"
   p = body.appendParagraph(text )
   p.setLineSpacing(1.5)
   p.editAsText().setUnderline(0, text.length-1, true)
   p.editAsText().setUnderline(0,13,false)

   text = "Number in Family:    " + rowData[1] + "\u2008\u2008\u2008\u2008"
   p = body.appendParagraph(text).setLineSpacing(1.5)
   p.editAsText().setUnderline(0, text.length-1, true)
   p.editAsText().setUnderline(0, 18, false)
   for(i=3;i<totalColumns;i++) {
     sectionHeadings(i, body)

     qty = String(rowData[i])
     if(qty.includes('posted')) {
           p = body.appendParagraph(qty + "    " + locations[i] + ".  " + itemNames[i]).setLineSpacing(2)
           p.editAsText().setUnderline(false)
           p.editAsText().setUnderline(1,10,true)

     } else{ 
           qty = qty.padStart(11, ' ').padEnd(18, ' '); // qty will be 7 characters after
           p = body.appendParagraph(qty + "    " + locations[i] + ".  " + itemNames[i]).setLineSpacing(2)
           p.editAsText().setUnderline(false)
           p.editAsText().setUnderline(1,18,true)
     }
   }

   body.appendParagraph("PRODUCE (circle one)           YES           NO")
   body.appendParagraph("")
   body.appendParagraph("VOLUNTEER INITIALS          ____________            __________")
   body.appendParagraph("")
   body.appendParagraph("NEIGHBORS!")
   body.appendParagraph("OUR NEXT PATH 2 NOURISHMENT 2(P2N2) FOOD DISTRIBUTION WILL BE 1ST SATURDAY, OCTOBER 3, 2026 FROM " +
                        "8:30 AM - 11:30 AM")

    body.appendParagraph("PLEASE CALL 214-870-3314 or 214-563-7504 IF YOU HAVE ANY QUESTIONS OR CONCERNS. PLEASE LET US " +
                         "KNOW IF YOU ARE NOT ABLE TO PICK UP YOUR FOOD ITEMS. THANK YOU FOR ALLOWING US TO SERVE YOUR FAMILY")
  
}

function sectionHeadings(line, body) {
  var p;
  switch (line) {
    case 3:  body.appendParagraph(""); p = body.appendParagraph("Quantity     FROZEN, REFRIGERATED AND PROTEIN"); break;
    //case 14: body.appendParagraph(""); p = body.appendParagraph("Quantity     FRUITS"); break;
    case 19: body.appendParagraph(""); p = body.appendParagraph("Quantity     VEGETABLES"); break;
    case 25: body.appendParagraph(""); p = body.appendParagraph("Quantity     PASTAS. CEREALS, GRAINS"); break;
    case 32: body.appendParagraph(""); p = body.appendParagraph("Quantity     SAUCES"); break;
    case 33: body.appendParagraph(""); p = body.appendParagraph("Quantity     SNACKS"); break;
    case 39: body.appendParagraph(""); p = body.appendParagraph("Quantity     BEVERAGES"); break;
    //case 37: body.appendParagraph(""); p = body.appendParagraph("Quantity     MISCELLANEOUS"); break;
    case 46: body.appendParagraph(""); p = body.appendParagraph("Quantity     KITCHEN"); break;
    default: return
  }
  p.setLineSpacing(1.5)
  p.editAsText().setUnderline(true)
}

