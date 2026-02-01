# Deepwriter MCP Tool Expansion Plan

## Objective
Implement 2 distinct workflows (3 tools total) to reduce friction in the Deepwriter job submission process.

## 1. `autoprompter` (The "One-Shot" Tool)
**Goal:** Zero-friction submission. AI assumes the role of the user for the Q&A phase.
**Steps Chain:**
1. `createProject` -> Get `projectId`
2. `formatPrompt` -> Get enhanced prompt + 9 questions
3. **Auto-Answer Logic:** The MCP tool itself (or a sub-call to an LLM if available, otherwise generic "Proceed" answers) generates simple answers to the questions to unblock the flow. 
   *(Note: Since MCP tools typically don't call LLMs themselves easily without loopback, we might need to use simple default answers or just pass the enhanced prompt back without specific Q&A if the API allows emptiness? Or we generate "strategic filler" answers based on the prompt keywords.)*
4. `updateProject` -> Inject enhanced prompt + auto-generated answers.
5. `generateWizardWork` -> Fire the job.
**Return:** Job ID and Status.

## 2. `projectPrep` (Interactive Phase 1)
**Goal:** Setup the project and get the Deepwriter questions for the human.
**Steps Chain:**
1. `createProject` -> Get `projectId`
2. `formatPrompt` -> Get enhanced prompt + 9 questions
**Return:** `projectId` and the list of Questions for the user to answer.

## 3. `projectLaunch` (Interactive Phase 2)
**Goal:** Take human answers and fire the job.
**Steps Chain:**
1. `updateProject(projectId, answers)` -> Save state.
2. `generateWizardWork(projectId)` -> Fire job.
**Return:** Job ID and Status.

## File Structure Changes
- `src/tools/autoprompter.ts`
- `src/tools/projectPrep.ts`
- `src/tools/projectLaunch.ts`
- Update `src/index.ts` to register new tools.

## Development Steps
1. Implement `projectPrep` first (easiest, foundation).
2. Implement `projectLaunch` (completes the interactive loop).
3. Implement `autoprompter` (combines logic + auto-answer heuristic).
4. Test with the internal `test-scripts`.
