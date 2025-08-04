

class SpreadSheetClient {
  private static instance: GoogleAppsScript.Spreadsheet.Spreadsheet;

  public static getInstance(): GoogleAppsScript.Spreadsheet.Spreadsheet {
    if (!SpreadSheetClient.instance) {
      SpreadSheetClient.instance = SpreadsheetApp.getActiveSpreadsheet();
    }

    return SpreadSheetClient.instance;
  }

  public static getSheet(name: string): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet = SpreadSheetClient.getInstance().getSheetByName(name)
    if (!sheet) {
      throw new Error('sheet not found')
    }

    return sheet;
  }
}

export default SpreadSheetClient;