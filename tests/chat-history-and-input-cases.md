# Chat history and calculator input update Manual Test Cases — Chat History and Calculator Inputs

## Calculator number inputs

- Given a numeric calculator field currently displays `0`
- When the user focuses the field and types `5`
- Then the field should display `5`, not `05`

Repeat for:

- Fluid Dynamics calculator
- Reynolds Number calculator
- Hydraulic Flow calculator
- Retaining Wall calculator
- Column Buckling calculator
- Thermal Transfer calculator
- Voltage Drop calculator

## Free chat persistence after navigation

- Open `/assistant`
- Send: `What is thermodynamics?`
- Confirm the assistant answers and the response badge shows database persistence when the database is configured
- Navigate to `/calculators`
- Return to `/assistant`
- Confirm the same chat messages are restored

## Recent free chat history

- Open `/assistant`
- Send a prompt in one chat
- Click **New chat**
- Send a different prompt
- Confirm both chats appear under Recent free chat history
- Click the first chat history item
- Confirm the earlier messages load

## Project access boundary

- Send a free chat without `projectId`
- Confirm it does not require project access
- Send a project chat with an invalid `projectId`
- Confirm the API still rejects the request with project access error

## GPT-style response formatting regression

Prompt: `Calculate the coefficient of waterplane area and LCF from these ordinates...`
Expected behavior:
- Assistant answer should render as Markdown with headings, paragraphs, formula blocks, and tables.
- The visible chat should not appear as a flat block of raw notes.
- Metadata panels should remain separate and concise.

## GPT-style response formatting regression

Prompt: `Calculate the coefficient of waterplane area and LCF from these ordinates...`
Expected behavior:
- Assistant answer should render as Markdown with headings, paragraphs, formula blocks, and tables.
- The visible chat should not appear as a flat block of raw notes.
- Metadata panels should remain separate and concise.
