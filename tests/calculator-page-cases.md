# Active Calculator Page Test Cases

## Navigation

- `/calculators` displays all implemented calculation cards.
- Each visible calculator card opens its own calculator route.
- Sidebar `New Calculation` opens `/calculators`.
- Dashboard recently used calculator cards route to implemented calculator pages.

## Implemented pages

- `/calculators/fluid-dynamics`
- `/calculators/reynolds-number`
- `/calculators/hydraulic-flow`
- `/calculators/retaining-wall`
- `/calculators/column-buckling`
- `/calculators/thermal-transfer`
- `/calculators/voltage-drop`

Each page should show:

- editable numeric input fields
- live calculated results
- formula panel
- calculation trace panel
- assumptions
- missing or optional data
- warnings and limitations

## API endpoints

- `GET /api/calculations`
- `POST /api/calculations/fluid/pressure-drop`
- `POST /api/calculations/fluid/reynolds`
- `POST /api/calculations/hydraulic/open-channel-flow`
- `POST /api/calculations/structural/retaining-wall`
- `POST /api/calculations/structural/column-buckling`
- `POST /api/calculations/thermal/conduction`
- `POST /api/calculations/electrical/voltage-drop`

Invalid inputs should return `calculation_validation_failed` with field-level validation issues.

Safety-critical pages should include professional-review and no-final-approval language.
