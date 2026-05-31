# Fluid Pressure Drop Calculation

## Purpose

This module provides a preliminary deterministic calculation for internal pipe flow. It supports traceable engineering output for Phase 4 and avoids embedding engineering math directly inside React components.

## Location

- Main calculation: `lib/calculations/fluid/pressureDrop.ts`
- Validation and input normalization: `lib/calculations/fluid/schemas.ts`
- Reynolds number: `lib/calculations/fluid/reynolds.ts`
- Friction factor: `lib/calculations/fluid/frictionFactor.ts`
- API endpoint: `app/api/calculations/fluid/pressure-drop/route.ts`

## Inputs

Required:

- `diameter_m` or `diameter_mm`
- `length_m`
- `velocity_m_s`
- `density_kg_m3`
- `viscosity_pa_s`

Optional:

- `roughness_m` or `roughness_mm`
- `minorLossCoefficient`
- `fluidName`
- `pipeMaterial`
- `temperature_C`

## Methods

- Area: `A = πD² / 4`
- Flow rate: `Q = Av`
- Reynolds number: `Re = ρvD / μ`
- Laminar friction factor: `f = 64 / Re`
- Turbulent friction factor: Swamee-Jain correlation
- Pressure drop: `ΔP = f(L/D)(ρv²/2) + K(ρv²/2)`

## Limitations

This module is preliminary. It does not include elevation change, pumps, heat transfer, compressibility, non-Newtonian fluids, multiphase flow, pipe aging, fouling, or detailed fitting-by-fitting system modeling unless those are added later.

For safety-critical, regulated, final design, or construction-ready work, results must be verified by qualified professionals against project specifications and applicable standards.
