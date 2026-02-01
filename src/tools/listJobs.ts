import * as apiClient from '../api/deepwriterClient.js';

interface ListJobsInput {
  // No parameters needed - API key from environment
}

interface ListJobsOutput {
  content: { type: 'text'; text: string }[];
}

export const listJobsTool = {
  name: "listJobs",
  description: "List all writing jobs for the authenticated user",
  async execute(args: ListJobsInput): Promise<ListJobsOutput> {
    console.error(`Executing listJobs tool...`);

    const apiKey = process.env.DEEPWRITER_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPWRITER_API_KEY environment variable is required");
    }

    try {
      const apiResponse = await apiClient.listJobs(apiKey);
      console.error(`API call successful. Received ${apiResponse.jobs.length} jobs.`);

      const mcpResponse: ListJobsOutput = {
        content: apiResponse.jobs.map(job => ({
          type: 'text',
          text: `Job ID: ${job.id}, Project: ${job.title || job.project_id}, Status: ${job.status}, Progress: ${Math.round((job.percent_complete || 0) * 100)}%`
        }))
      };

      if (mcpResponse.content.length === 0) {
        mcpResponse.content.push({ type: 'text', text: 'No jobs found.' });
      }

      return mcpResponse;
    } catch (error) {
      console.error(`Error executing listJobs tool: ${error}`);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list jobs: ${errorMessage}`);
    }
  }
};
