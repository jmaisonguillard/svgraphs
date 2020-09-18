import { VitalsCheckerInterface } from "../interfaces/vitals-checker.interface";

export enum BloodPressureCategory {
  SYSTOLIC = "systolic",
  DIASTOLIC = "diastolic",
}

export class VitalsChecker implements VitalsCheckerInterface {
  bloodPresureCheck(
    type: BloodPressureCategory,
    value: number,
    opacity = 1
  ): string {
    const SEVERITY = {
      none: `rgba(1,213,101, ${opacity})`,
      below: `rgba(255,59,48, ${opacity})`,
      normal: `rgba(1,213,101, ${opacity})`,
      mild: `rgba(254,194,69, ${opacity})`,
      medium: `rgba(255,139,47, ${opacity})`,
      high: `rgba(255,59,48, ${opacity})`,
    };

    // Check Systolic First....
    if (type === "systolic") {
      if (value < 80) {
        return SEVERITY.below;
      } else if (value >= 80 && value < 120) {
        return SEVERITY.normal;
      } else if (value >= 120 && value <= 139) {
        return SEVERITY.mild;
      } else if (value >= 140 && value <= 159) {
        return SEVERITY.medium;
      } else if (value >= 160) {
        return SEVERITY.high;
      }
    }

    // Check Diastolic
    if (type === "diastolic") {
      if (value < 60) {
        return SEVERITY.below;
      } else if (value >= 60 && value < 80) {
        return SEVERITY.normal;
      } else if (value >= 80 && value <= 89) {
        return SEVERITY.mild;
      } else if (value >= 90 && value <= 99) {
        return SEVERITY.medium;
      } else if (value >= 100) {
        return SEVERITY.high;
      }
    }

    return SEVERITY.normal;
  }
}
