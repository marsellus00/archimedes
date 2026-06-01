# Active Calculator Page Fixes

This update extends Active from a single Fluid Dynamics implementation into a calculator-page-wide integration.

## Completed

- Updated `/calculators` so every visible calculator card links to an implemented page.
- Removed placeholder calculator links that previously routed unrelated tools into the fluid calculator.
- Added shared deterministic modules and pages for:
 - Fluid Dynamics / pipe pressure drop
 - Reynolds Number
 - Hydraulic Flow / Manning open-channel flow
 - Retaining Wall stability screening
 - Column Buckling screening
 - Thermal Transfer / flat-wall conduction
 - Voltage Drop screening
- Added matching API endpoints for the implemented calculators.
- Added a reusable `CalculationWorkspace` UI for calculation pages with:
 - editable inputs
 - validation messages
 - calculated results
 - formulas
 - calculation trace
 - assumptions
 - missing or optional data
 - warnings and limitations
- Updated dashboard links so recently used calculator cards route to implemented pages.
- Updated the sidebar New Calculation action to route to `/calculators`.

## Safe boundary

The modules remain preliminary engineering support tools. They are not final design approval, code compliance certification, construction approval, or operational approval.

Database persistence, authentication, project permissions, audit logging, AI tool-calling, and exports remain deferred to future roadmap items.
