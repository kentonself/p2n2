function GenerateAllReports() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rangeString
  var targetRange
  for (let i=14;i<177;i++) {
    rangeString = "A"+i +":A"+ i
     Logger.log("i = "+ i)
    Logger.log(rangeString)
    targetRange = sheet.getRange(rangeString);
    sheet.setActiveRange(targetRange);
    generateClientDoc()
    Logger.log("i = "+ i)
  } 
}
