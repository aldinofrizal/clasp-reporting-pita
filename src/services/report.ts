import DrugModel, { IDrug } from "../model/drug";
import SaleModel, { ISale } from "../model/sale";
import {DAILY_EMPLOYEE_SALARY, doctors, EMPLOYEE_PA_PAING, employees, PAYMENT_METHOD, REPORT_MONTHLY_BASE_SALARY, weeklyDateConstraint } from "../constant";
import ExpenseModel, { IExpense } from "../model/expense";
import AbsenceModel, { IAbsence } from "../model/absence";

export interface ReportSource {
  sales: ISale[],
  drugs: IDrug[]
}

export interface IWeeklyReport {
  nweek: number,
  treatment_list: ISale[],
  start_date: string|Date,
  end_date: string|Date,
  per_doctor: Record<string, number>,
  per_type: Record<string, Record<string,number>>,
  total: number,
}

export interface IMonthlyReport {
  salary: Record<string,number>,
  revenue_component: Record<string,number>,
  total_clinic_revenue: number,
  total_expense: number,
  net_worth: number,
}

class ReportService {
  static generateWeeklyReport(): IWeeklyReport[] {
    const report: IWeeklyReport[] = [];
    weeklyDateConstraint.forEach((constraint) => {
      const {start_date, end_date, nweek} = constraint;
      report.push(ReportService.generateBaseWeeklyReport(start_date, end_date, nweek));
    });
    const sales = SaleModel.findAll();
    const drugs = DrugModel.findAllAsObject();

    for (let i = 0; i < sales.length; i++) {
      const sale = sales[i];
      if (!sale.treatment_date || sale.treatment_date == '') continue;
      const treatmentDate = new Date(sale.treatment_date)
      for (let j = 0; j < report.length; j++) {
        const weeklyReport = report[j];
        const weeklyStartDate = new Date(weeklyReport.start_date);
        const weeklyEndDate = new Date(weeklyReport.end_date);

        if (weeklyStartDate <= treatmentDate && weeklyEndDate >= treatmentDate) {
          weeklyReport.per_doctor[sale.doctor] += Number(sale.treatment_amount);
          weeklyReport.per_type.treatment[sale.payment_source] += Number(sale.treatment_amount);
          weeklyReport.total += Number(sale.treatment_amount);
          weeklyReport.per_type.admin[sale.payment_source] += Number(this.getAdminFee(sale));
          weeklyReport.total += Number(ReportService.getAdminFee(sale));
          if (sale.drugs || sale.drugs != '') {
            weeklyReport.per_type.drug[sale.payment_source] += Number(ReportService.getDrugFee(sale.drugs, drugs))
            weeklyReport.total += Number(ReportService.getDrugFee(sale.drugs, drugs));
          }
        }
      }
    }
    return report;
  }
  static generateBaseWeeklyReport(start_date: string|Date, end_date: string|Date, nweek: number)
  : IWeeklyReport {
    const perDoctor = {} as Record<string, number>
    doctors.forEach((d) => perDoctor[d.name] = 0);
    const perTypeTreatment = {} as Record<string, number>; 
    PAYMENT_METHOD.forEach((p) => perTypeTreatment[p] = 0);
    const perTypeAdmin = {} as Record<string, number>; 
    PAYMENT_METHOD.forEach((p) => perTypeAdmin[p] = 0);
    const perTypeDrug = {} as Record<string, number>; 
    PAYMENT_METHOD.forEach((p) => perTypeDrug[p] = 0);

    return {
      nweek: nweek,
      treatment_list: [],
      start_date: start_date,
      end_date: end_date,
      per_doctor: perDoctor,
      per_type: {
        treatment: perTypeTreatment,
        admin: perTypeAdmin,
        drug: perTypeDrug,
      },
      total: 0,
    } as IWeeklyReport;
  };

  static generateMonthlyReport(): IMonthlyReport {
    const expenses = ExpenseModel.findAll();
    const absences = AbsenceModel.findAll();
    const weeklyReport = ReportService.generateWeeklyReport();
    const totalEmployeeAbsence = ReportService.calculateTotalAbsence(absences);
    const totalExpenses = ReportService.calculateExpenses(expenses);
    

    const result = ReportService.generateBaseMonthlyReport();
    console.log('initial result', result);
    for(let i = 0; i < weeklyReport.length; i++) {
      const totalRevenueAdmin = PAYMENT_METHOD.reduce((pv, cv) => {
        return pv + weeklyReport[i].per_type.admin[cv]
      }, 0)
      // calculate per payment method
      for (let j = 0; j < PAYMENT_METHOD.length; j++) {
        const paymentMethod = PAYMENT_METHOD[j]
        result.revenue_component[paymentMethod] += weeklyReport[i].per_type.admin[paymentMethod];
        result.revenue_component[paymentMethod] += weeklyReport[i].per_type.drug[paymentMethod];
        result.revenue_component[paymentMethod] += weeklyReport[i].per_type.treatment[paymentMethod];
      }
      result.salary.admin += totalRevenueAdmin;
      result.total_clinic_revenue += weeklyReport[i].total;

      doctors.forEach((d) => {
        result.salary[d.name] += weeklyReport[i].per_doctor[d.name] * 0.4;
      });
    }

    employees.forEach(e => {
      result.salary[e.name] += totalEmployeeAbsence[e.name] * DAILY_EMPLOYEE_SALARY;
    });
    result.total_expense = totalExpenses;
    const salary = [...doctors, ...employees].reduce((pv, cv) => pv + result.salary[cv.name], 0);
    result.net_worth = result.total_clinic_revenue - (salary + result.salary[EMPLOYEE_PA_PAING] + totalExpenses);
    return result;
  }
  static generateBaseMonthlyReport(): IMonthlyReport {
    const revenueComponent = PAYMENT_METHOD.reduce((pv, cv) => {
      return {...pv, [cv]: 0};
    }, {})
    return {
      salary: REPORT_MONTHLY_BASE_SALARY,
      revenue_component: revenueComponent,
      total_clinic_revenue: 0,
      total_expense: 0,
      net_worth: 0,
    }
  }

  static getAdminFee(sale: ISale): number {
    if (sale.patient_type == 'Lama') {
      return 5000;
    } 
    return 10000;
  };
  static getDrugFee(saleDrug: string, drugList: Record<string,any>) {
    const drugArr = saleDrug.split(',');
    let amount = 0
    for(let i = 0; i < drugArr.length; i++) {
      amount += drugList[drugArr[i].trim()]
    }
    return amount;
  };
  static calculateTotalAbsence(absences: IAbsence[]): Record<string,number> {
    const result = {} as Record<string,number>;
    for (let i = 0; i < absences.length; i++) {
      const absence = absences[i];
      if (!absence.name) continue
      
      const name = absence.name.trim() 
      if (!result[name]) {
        result[name] = 1;
      } else {
        result[name]++;
      }
    }
    return result;
  };
  static calculateExpenses(expenses: IExpense[]): number {
    return expenses.reduce((pv, cv) => pv + cv.price, 0);
  }
}

export default ReportService;
