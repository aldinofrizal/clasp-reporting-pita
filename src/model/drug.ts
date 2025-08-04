import { DRUG_DATABASE_SHEET } from "../constant";
import SpreadSheetClient from "./spreadsheet";

export interface IDrug {
  name: string,
  price: string
}

class DrugModel {
  static getRawData(): any[][] {
    const sheet = SpreadSheetClient.getSheet(DRUG_DATABASE_SHEET);
    var responseRange = sheet.getDataRange();
    return responseRange.getValues();
  }

  static findAllAsObject(): Record<string, any> {
    const data = DrugModel.getRawData();
    const result = {} as Record<string, any>;
    for (let i = 1; i < data.length; i++) {
      const drug = data[i];
      result[drug[0]] = drug[1];
    }
    return result
  }

  static findAll(): IDrug[] {
    const responseValues = DrugModel.getRawData();
    return responseValues.map((row) => {
      return {
        name: row[0], price: row[1]
      } as IDrug
    });
  }
}

export default DrugModel;