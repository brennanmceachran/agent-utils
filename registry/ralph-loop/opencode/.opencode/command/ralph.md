---
description: Start/stop a Ralph loop on a prompt file
agent: ralph
---

RALPH_CONTROL: {"arg1":"$1","arg2":"$2","arg3":"$3"}

This command sends a control message that the Ralph loop plugin listens for.

- If `$1` is `stop`, stop the Ralph loop.
- Otherwise, treat `$1` as the prompt file reference and `$2` as an optional max-iterations number.

Respond with a brief acknowledgement only. Do not run tools in response to this control message.
