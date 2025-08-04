import { ABSENCE_SHEET } from "../constant";
import SpreadSheetClient from "./spreadsheet";

export interface IAbsence {
  timestamp: string,
  name: string,
  shift: string,
}

class AbsenceModel {
  static getRawData(): any[][] {
    const sheet = SpreadSheetClient.getSheet(ABSENCE_SHEET);
    var responseRange = sheet.getDataRange();
    return responseRange.getValues();
  }

  static findAll(): IAbsence[] {
    const responseValues = AbsenceModel.getRawData();
    return responseValues.map((row) => {
      return {
        timestamp: row[0],
        name: row[1], 
        shift: row[2]
      } as IAbsence
    });
  }
}

export default AbsenceModel