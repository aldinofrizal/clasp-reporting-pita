import { EXPENSE_SHEET } from "../constant";
import SpreadSheetClient from "./spreadsheet";

export interface IExpense {
  timestamp: string,
  name: string,
  price: number,
}

class ExpenseModel {
  static getRawData(): any[][] {
    const sheet = SpreadSheetClient.getSheet(EXPENSE_SHEET);
    var responseRange = sheet.getDataRange();
    return responseRange.getValues();
  }

  static findAll(): IExpense[] {
    const responseValues = ExpenseModel.getRawData();
    return responseValues.filter((row) => row[0] != 'Timestamp').map((row) => {
      return {
        timestamp: row[0],
        name: row[1], 
        price: Number(row[3]),
      } as IExpense
    });
  }
}

export default ExpenseModel