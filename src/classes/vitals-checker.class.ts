import { VitalsCheckerInterface } from "../interfaces/vitals-checker.interface";

export enum BloodPressureCategory {
  SYSTOLIC = "systolic",
  DIASTOLIC = "diastolic",
}

enum SeverityEnum {
  None,
  Below,
  Normal,
  Mild,
  Medium,
  High,
}

export class VitalsChecker implements VitalsCheckerInterface {
  getClassNameFromVitalSeverity(severity: SeverityEnum): string {
    return SeverityEnum[severity].toLowerCase();
  }

  bloodPresureCheck(type: BloodPressureCategory, value: number): string {
    // Check Systolic First....
    if (type === "systolic") {
      if (value < 80) {
        return this.getClassNameFromVitalSeverity(SeverityEnum.Below);
      } else if (value >= 80 && value < 120) {
        return this.getClassNameFromVitalSeverity(SeverityEnum.Normal);
      } else if (value >= 120 && value <= 139) {
        return this.getClassNameFromVitalSeverity(SeverityEnum.Mild);
      } else if (value >= 140 && value <= 159) {
        return this.getClassNameFromVitalSeverity(SeverityEnum.Medium);
      } else if (value >= 160) {
        return this.getClassNameFromVitalSeverity(SeverityEnum.High);
      }
    }

    // Check Diastolic
    if (type === "diastolic") {
      if (value < 60) {
        return this.getClassNameFromVitalSeverity(SeverityEnum.Below);
      } else if (value >= 60 && value < 80) {
        return this.getClassNameFromVitalSeverity(SeverityEnum.Normal);
      } else if (value >= 80 && value <= 89) {
        return this.getClassNameFromVitalSeverity(SeverityEnum.Mild);
      } else if (value >= 90 && value <= 99) {
        return this.getClassNameFromVitalSeverity(SeverityEnum.Medium);
      } else if (value >= 100) {
        return this.getClassNameFromVitalSeverity(SeverityEnum.High);
      }
    }

    return this.getClassNameFromVitalSeverity(SeverityEnum.Normal);
  }

  bloodPressurePrioritySeverity(
    systolicNumber: string | number,
    diastolicNumber: string | number
  ): string {
    let systolic = this.bloodPresureCheck(
      BloodPressureCategory.SYSTOLIC,
      parseInt(`${systolicNumber}`, 10)
    );
    let diastolic = this.bloodPresureCheck(
      BloodPressureCategory.DIASTOLIC,
      parseInt(`${diastolicNumber}`, 10)
    );

    systolic =
      SeverityEnum[systolic.charAt(0).toUpperCase() + systolic.slice(1)];
    diastolic =
      SeverityEnum[diastolic.charAt(0).toUpperCase() + diastolic.slice(1)];

    return SeverityEnum[
      systolic > diastolic ? systolic : diastolic
    ].toLowerCase();
  }
}
