import { BloodPressureCategory } from "../classes/vitals-checker.class";

export interface VitalsCheckerInterface {
  bloodPresureCheck(
    type: BloodPressureCategory,
    value: number,
    opacity: number
  ): string;
}
