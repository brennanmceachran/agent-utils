**What this gives you**
- A bounded loop that advances one useful step per iteration.
- A progress log written back into the prompt file after each run.
- The ability to let an agent grind through the happy path for hours.
- Inspired by the Claude Code Ralph Wiggum loop technique.

I have run this for 4-5 hours on gpt-5.2-codex (extra high reasoning) without babysitting.

**Try it**
1. Create a PRD file (template in Usage).
2. Switch to the Ralph agent and run:

```bash
/ralph @docs/feature-x.prd.md 10
```

3. Review Progress until `RALPH_DONE`, then re-run or stop with `/ralph stop`.
