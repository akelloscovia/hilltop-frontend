# continue-from-yesterday.prompt.md

## purpose
Help the agent continue an interrupted frontend development task by reconciling the previous state and listing next adjustments.

## input
- `contextSummary` (string, optional): brief bullet list of what was done in previous session.
- `pendingWork` (string, optional): list of known issues/features still open.
- `targetFiles` (string, optional): files or components that should be revisited (e.g., "src/components/Dashboardlayout.js").
- `userMessage` (string, required): a prompt phrase such as "hey from where we ended yesterday, what else needs to be adjusted".

## output
Return JSON object with keys:
- `status`: "ok" or "clarify"
- `summary`: concise session sync
- `nextSteps`: array of concrete tasks
- `changes`: optional high-level diff-like suggestions (file + line focus + description)
- `questions`: (if `status` = "clarify") follow-up data needed from user

## instructions
1. Interpret userMessage to determine if session state is clear.
2. If state is unclear, set `status` to "clarify" and ask:
   - "Which exact feature or file should I continue from?"
   - "Do you have the previous plan or TODOs from yesterday?"
3. If state is clear, set `status` to "ok" and produce:
   - a short review (1-2 lines) of likely done work
   - a prioritized 3-5 item `nextSteps`
   - one or two candidate code snippets for the most impactful edit
4. Keep output concise and action-oriented.

## example invocation
`{
  "userMessage": "hey from where we ended yesterday, what else needs to be adjusted",
  "contextSummary": "Loaded dashboard routes, fixed navbar collapse, pending validation on admission form",
  "targetFiles": "src/pages/Admissions.js, src/components/Navbar.js"
}`

## example output
`{
  "status": "ok",
  "summary": "You finished routing and navbar layout; admissions form data validation is still pending.",
  "nextSteps": [
    "Implement field-level validation in src/utils/validation.js and tie into Admissions.js submit",
    "Add error message UI in src/pages/Admissions.css",
    "Write unit tests in src/__tests__/Admissions.test.js"
  ],
  "changes": [
    "Admissions.js: add submit handler with preventDefault and validation call",
    "validation.js: add validateAdmission() for required fields and email format"
  ]
}`
