export const autoprompterTool = {
  name: "autoprompter",
  description: "Fully automated Deepwriter flow: Create -> Format -> Auto-Answer -> Update -> Generate. Skips human interaction.",
  inputSchema: {
    type: "object",
    properties: {
      prompt: { type: "string" },
      title: { type: "string" },
      email: { type: "string" }
    },
    required: ["prompt", "title", "email"]
  }
};

export const projectPrepTool = {
  name: "projectPrep",
  description: "Phase 1 of Deepwriter interactive flow: Create Project -> Format Prompt -> Return Questions to User.",
  inputSchema: {
    type: "object",
    properties: {
      prompt: { type: "string" },
      title: { type: "string" },
      email: { type: "string" }
    },
    required: ["prompt", "title", "email"]
  }
};

export const projectLaunchTool = {
  name: "projectLaunch",
  description: "Phase 2 of Deepwriter interactive flow: Receive User Answers -> Update Project -> Generate Work.",
  inputSchema: {
    type: "object",
    properties: {
      projectId: { type: "string" },
      answers: { type: "array", description: "Array of {question, answer} objects" },
      email: { type: "string" }
    },
    required: ["projectId", "answers", "email"]
  }
};
