import { DOCTOR_DRG_NOVITA, doctors, EMPLOYEE_PA_PAING, employees, MONTHLY_COLUMN_WITH_CURRENCY, MONTHLY_REPORT_SHEET_NAME, PAYMENT_METHOD, WEEKLY_COLUMN_WITH_CURRENCY, WEEKLY_REPORT_SHEET_NAME } from "../constant";
import SpreadSheetClient from "../model/spreadsheet";
import {IMonthlyReport, IWeeklyReport} from "../services/report";

const spreadsheetInstance = SpreadSheetClient.getInstance();

class SpreadsheetView {
  static printWeeklyReport(reports: IWeeklyReport[]): void {
    let sheet = spreadsheetInstance.getSheetByName(WEEKLY_REPORT_SHEET_NAME);
    // If the sheet doesn't exist, create it
    if (!sheet) {
      sheet = spreadsheetInstance.insertSheet(WEEKLY_REPORT_SHEET_NAME);
    } else {
      sheet.clear(); // Clear old data
    }

    for(let i = 0; i < reports.length; i++) {
      const weeklyReport = reports[i]
      sheet.appendRow([`Weekly Report: Week ${weeklyReport.nweek}`])
      sheet.appendRow(['start date']);
      sheet.appendRow([weeklyReport.start_date]);
      sheet.appendRow(['end date']);
      sheet.appendRow([weeklyReport.end_date]);
      sheet.appendRow([' ', 'TREATMENT', 'ADMIN', 'DRUG', 'TOTAL']);
    
      for (let j = 0; j < PAYMENT_METHOD.length; j++) {
        const paymentMethod = PAYMENT_METHOD[j];
        const totalRevenuePerPaymentMethod = weeklyReport.per_type.treatment[paymentMethod] + weeklyReport.per_type.admin[paymentMethod]
          + weeklyReport.per_type.drug[paymentMethod];
        
        sheet.appendRow([
          paymentMethod, 
          weeklyReport.per_type.treatment[paymentMethod], 
          weeklyReport.per_type.admin[paymentMethod], 
          weeklyReport.per_type.drug[paymentMethod], 
          totalRevenuePerPaymentMethod
        ]);
      }

      const totalRevenueTreatment = PAYMENT_METHOD.reduce((pv, cv) => {
        return pv + weeklyReport.per_type.treatment[cv]
      }, 0)
      const totalRevenueAdmin = PAYMENT_METHOD.reduce((pv, cv) => {
        return pv + weeklyReport.per_type.admin[cv]
      }, 0)
      const totalRevenueDrug = PAYMENT_METHOD.reduce((pv, cv) => {
        return pv + weeklyReport.per_type.drug[cv]
      }, 0)
      const totalRevenue = totalRevenueTreatment+totalRevenueAdmin+totalRevenueDrug
      sheet.appendRow(['TOTAL', totalRevenueTreatment, totalRevenueAdmin, totalRevenueDrug, totalRevenue]);
      
      sheet.appendRow([' '])
      sheet.appendRow(['DOCTOR', 'CLINIC REVENUE', 'DOCTOR PERCENTAGE'])

      doctors.forEach(d => {
        sheet.appendRow([d.name, weeklyReport.per_doctor[d.name], weeklyReport.per_doctor[d.name] * 0.4]);
      });

      sheet.appendRow([' '])
      sheet.appendRow([' '])
    }

    SpreadsheetView.formatSheet(sheet, WEEKLY_COLUMN_WITH_CURRENCY);
  }

  static printMonthlyReport(report: IMonthlyReport): void {
    let sheet = spreadsheetInstance.getSheetByName(MONTHLY_REPORT_SHEET_NAME);
    // If the sheet doesn't exist, create it
    if (!sheet) {
      sheet = spreadsheetInstance.insertSheet(MONTHLY_REPORT_SHEET_NAME);
    } else {
      sheet.clear(); // Clear old data
    }

    sheet.appendRow(['Monthly Report'])
    sheet.appendRow([' '])
    sheet.appendRow(['SALARY'])

    doctors.forEach((d) => {
      const appendedCell = [d.name, report.salary[d.name]];
      if (d.name == DOCTOR_DRG_NOVITA) appendedCell.push('include admin');
      sheet.appendRow(appendedCell);
    });
    employees.forEach((e) => {
      sheet.appendRow([e.name, report.salary[e.name]]);
    });
    sheet.appendRow([EMPLOYEE_PA_PAING, report.salary[EMPLOYEE_PA_PAING]]);
    const totalSalary = [...doctors, ...employees].reduce((pv, cv) => pv + report.salary[cv.name], 0) + report.salary[EMPLOYEE_PA_PAING]
    
    sheet.appendRow(['Total Salary', totalSalary])
    sheet.appendRow([' '])

    sheet.appendRow(['CLINIC SUMMARY'])
    sheet.appendRow(['Total Clinic Revenue', report.total_clinic_revenue])
    sheet.appendRow(['Total Clinic Expense', report.total_expense])
    sheet.appendRow(['Total Treatment Admin Fee', report.salary.admin, 'will be calculated manually for odon and amel'])
    sheet.appendRow(['Net Worth', report.net_worth - (report.salary.admin)])

    sheet.appendRow([' '])
    sheet.appendRow(['BETA: REVENUE PER PAYMENT METHOD'])
    PAYMENT_METHOD.forEach((paymentMethod) => {
      sheet.appendRow([paymentMethod, report.revenue_component[paymentMethod]])
    });

    SpreadsheetView.formatSheet(sheet, MONTHLY_COLUMN_WITH_CURRENCY);
  }

  static formatSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet, currencyColumns: number[]): void {
    var lastRow = sheet.getLastRow();

    currencyColumns.forEach(col => {
      var range = sheet.getRange(1, col, lastRow - 1, 1); // Start from row 2 (skip headers)
      range.setNumberFormat('"Rp"#,##'); // Ensure it's in currency format
    });
    // Auto-resize columns based on content
    sheet.autoResizeColumns(1, sheet.getLastColumn());

    // Add extra width to improve readability (increase by 20 pixels)
    for (var col = 1; col <= sheet.getLastColumn(); col++) {
      sheet.setColumnWidth(col, 120);
    }
  }
}

export default SpreadsheetView;