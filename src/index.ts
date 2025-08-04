import SpreadSheetClient from "./model/spreadsheet";
import ReportService from "./services/report"
import SpreadsheetView from "./view";

const generateWeeklyReport = () => {
  const report = ReportService.generateWeeklyReport();
  SpreadsheetView.printWeeklyReport(report);
}

const generateMonthlyReport = () => {
  const report = ReportService.generateMonthlyReport();
  SpreadsheetView.printMonthlyReport(report);
}

const createMenu = () => {
  const menu = SpreadsheetApp.getUi().createMenu('Automation')
  menu.addItem('Generate Weekly Report', 'generateWeeklyReport')
  menu.addItem('Generate Monthly Report', 'generateMonthlyReport')
  menu.addToUi();
}


const onOpen = () => {
  createMenu();
  const ss = SpreadSheetClient.getInstance();
  
  ScriptApp.newTrigger('generateWeeklyReport')
    .forSpreadsheet(ss)
    .onFormSubmit();
  
  ScriptApp.newTrigger('generateMonthlyReport')
    .forSpreadsheet(ss)
    .onFormSubmit();

  generateWeeklyReport();
  generateMonthlyReport();
}