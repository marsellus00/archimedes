import type { EngineeringRequestCategory } from "@/lib/ai/types";

export function getContextualEngineeringNotice(
  category: EngineeringRequestCategory,
  requiresProfessionalReview: boolean,
): string {
  if (category === "out_of_scope") {
    return "I can only help with engineering and technical project topics. Provide engineering context if this relates to equipment, calculations, documentation, safety, maintenance, construction, or technical workflows.";
  }

  if (category === "engineering_concept") {
    return "Engineering concept explanation. No project-specific context is required unless the user asks for design, sizing, approval, or field application.";
  }

  if (category === "marine_offshore_naval_architecture") {
    return "Marine/offshore/naval-architecture engineering support. Project-specific design, classification, vessel/offshore operation, and navigation-safety decisions require qualified review and applicable authority verification.";
  }

  if (category === "simulation_or_fea") {
    return "Simulation and numerical-analysis support. Treat FEA/CFD/optimization outputs as engineering support only; validate inputs, mesh sensitivity, load cases, and assumptions before use.";
  }

  if (category === "standards_or_code") {
    return "Treat standards and code discussion as informational support only. Confirm the latest applicable edition, jurisdiction, project specification, and authority having jurisdiction.";
  }

  if (category === "safety_critical" || requiresProfessionalReview) {
    return "This is preliminary engineering support. Safety-critical, regulated, construction-ready, or final design work should be verified by a qualified professional before use.";
  }

  if (category === "engineering_calculation") {
    return "This is a preliminary calculation workflow. Verify inputs, units, assumptions, formulas, and limitations before using results.";
  }

  if (category === "engineering_documentation") {
    return "This is draft engineering documentation support and should be reviewed by the responsible project reviewer before issue.";
  }

  return "This is engineering support only and does not constitute final design, construction, regulatory, or operational approval.";
}
