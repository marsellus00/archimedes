export type CalculationConfidenceLevel =
  | "rough_estimate"
  | "preliminary"
  | "detailed";

export type InputValue = {
  label: string;
  value: number | string;
  unit?: string;
  source?: "user" | "default" | "assumed" | "calculated";
};

export type ResultValue = {
  label: string;
  value: number | string;
  unit?: string;
  precision?: number;
};

export type FormulaStep = {
  label: string;
  formula: string;
  description?: string;
};

export type CalculationStep = {
  label: string;
  expression: string;
  result: string;
};

export type ValidationIssue = {
  field: string;
  message: string;
};

export type CalculationResult = {
  calculationType: string;
  objective: string;
  confidenceLevel: CalculationConfidenceLevel;
  inputs: Record<string, InputValue>;
  assumptions: string[];
  missingData: string[];
  formulas: FormulaStep[];
  steps: CalculationStep[];
  results: Record<string, ResultValue>;
  warnings: string[];
  limitations: string[];
  requiresProfessionalReview: boolean;
  generatedAt: string;
};

export type CalculationSuccess<T extends CalculationResult = CalculationResult> = {
  ok: true;
  result: T;
};

export type CalculationFailure = {
  ok: false;
  issues: ValidationIssue[];
};

export type CalculationOutcome<T extends CalculationResult = CalculationResult> =
  | CalculationSuccess<T>
  | CalculationFailure;
