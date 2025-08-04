import { RESPONSE_SALES_SHEET } from "../constant";
import SpreadSheetClient from "./spreadsheet";

export interface ISale {
  form_created_at: string|Date,
  treatment_date: string|Date,
  name: string,
  gender: string,
  patient_type: string,
  treatment: string,
  treatment_amount: number,
  drugs: string,
  doctor: string,
  payment_source: string,
}

class SaleModel {
  static getRawData(): any[][] {
    const sheet = SpreadSheetClient.getSheet(RESPONSE_SALES_SHEET);
    var responseRange = sheet.getDataRange();
    return responseRange.getValues();
  }

  static findAll(): ISale[] {
    const responseValues = SaleModel.getRawData();
    return responseValues.map((row) => {
      return {
        form_created_at: row[0],
        treatment_date: row[1],
        name: row[2],
        gender: row[3],
        patient_type: row[4],
        treatment: row[5],
        treatment_amount: row[6],
        drugs: row[7],
        doctor: row[8],
        payment_source: row[9],
      } as ISale;
    });
  }
}

export default SaleModel;