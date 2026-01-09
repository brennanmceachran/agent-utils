### 1) Draft a PRD (validator-required sections)

Ralph validates the prompt file. These headings are required and must be non-empty:

- Goal
- Acceptance Criteria
- Verification
- Progress

The format below is a shortened version of PRD.assistant.md. Copy it and keep it tight:

````md
# PRD: <Feature name>

## TL;DR

- One sentence: what are we shipping?

## Goal

- What outcome should exist when done?

## Constraints

- Tech constraints, deadlines, guardrails.

## Acceptance Criteria

- [ ] Observable success conditions
- [ ] Edge cases you care about

## Verification

- Tests or manual checks that prove it works

## Notes

- Anything the loop should remember each iteration

## Progress

It's your job to update the progress field every time you make a change. The purpose of this is to ensure the next developer knows what you did, what's done, any decisions or assumptions you made, and is able to continue working. If you've made changes, please copy and paste this template to the bottom of the progress and edit to add your notes.

```template
### {{Title}} - {{Date}}

- {{Summary}}
- {{Decisions}}
- {{Assumptions}}
- {{Risks}}
- {{Status}}
- Best guess at what comes next & why:
  - {{Next}}
  - {{Next?}}
```

Add entries below this line:
````

### 2) Set the model

Pick a model that can grind:

- gpt-5.2-codex (extra high reasoning)
- Opus 4.5

### 3) Switch to the Ralph agent

Tab through agents until the status reads `ralph`.

### 4) Run the loop

Start with 10 iterations until you get the hang of it:

```bash
/ralph @docs/feature-x.prd.md 10
```

The second argument is the max-iterations cap.

### 5) How the loop behaves

It will keep smashing your prompt back into the loop until it outputs `RALPH_DONE` or hits the max iteration cap.
That is the point: run the happy path for hours without babysitting.
Each iteration writes Progress back into the PRD.

### 6) Steer the next iteration

Queue a message in OpenCode. It will be inserted into the next loop turn.

### 7) Stop the loop

- Press Ctrl+C
- Or run `/ralph stop`
