# Phase 4 Calculation Test Cases

## API status

```bash
curl http://localhost:3000/api/calculations
```

Expected:

- `status = phase_4_calculation_engine_ready`
- Implemented calculation includes `fluid_pressure_drop`

## Fluid calculation happy path

```bash
curl -X POST http://localhost:3000/api/calculations/fluid/pressure-drop \
  -H "Content-Type: application/json" \
  -d '{
    "diameter_mm": 100,
    "length_m": 20,
    "velocity_m_s": 2,
    "density_kg_m3": 998,
    "viscosity_pa_s": 0.001,
    "roughness_mm": 0.046,
    "minorLossCoefficient": 0,
    "fluidName": "Water",
    "pipeMaterial": "Commercial steel"
  }'
```

Expected:

- `status = phase_4_calculation_complete`
- Reynolds number is about 199,600
- Flow regime is turbulent
- Friction factor is calculated by Swamee-Jain
- Result includes formulas, steps, assumptions, missing data, warnings, and limitations

## Validation failure

```bash
curl -X POST http://localhost:3000/api/calculations/fluid/pressure-drop \
  -H "Content-Type: application/json" \
  -d '{
    "diameter_mm": 0,
    "length_m": 20,
    "velocity_m_s": 2,
    "density_kg_m3": 998,
    "viscosity_pa_s": 0.001
  }'
```

Expected:

- HTTP 400
- Validation issue for pipe diameter

## Scope calibration regression

The chat endpoint should not block these simple engineering concepts:

- `What is fluid dynamics?`
- `Explain Reynolds number.`
- `What is cavitation in pumps?`
- `What is voltage drop?`

Expected:

- `classification.scopeStatus = engineering`
- concept prompts should not be answered with a missing project-context request
