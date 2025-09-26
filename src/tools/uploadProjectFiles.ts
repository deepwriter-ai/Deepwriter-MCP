import * as apiClient from '../api/deepwriterClient.js';

// Define input/output types based on schema
interface UploadProjectFilesInputArgs {
  api_key: string;
  project_id: string;
  files: File[]; // Array of File objects
}

// Define the MCP-compliant output structure
interface UploadProjectFilesMcpOutput {
  content: { type: 'text'; text: string }[];
}

export const uploadProjectFilesTool = {
  name: "uploadProjectFiles",
  description: "Upload multiple files to a project with enhanced support for 20+ file types including PDF, Word, text, code, and data files",
  async execute(args: UploadProjectFilesInputArgs): Promise<UploadProjectFilesMcpOutput> {
    console.error(`Executing uploadProjectFiles tool for project ID: ${args.project_id}...`);

    if (!args.api_key) {
      throw new Error("Missing required argument: api_key");
    }
    if (!args.project_id) {
      throw new Error("Missing required argument: project_id");
    }
    if (!args.files || !Array.isArray(args.files) || args.files.length === 0) {
      throw new Error("Missing required argument: files (must be a non-empty array of File objects)");
    }

    try {
      // Call the actual API client function
      const apiResponse = await apiClient.uploadProjectFiles(args.api_key, args.project_id, args.files);
      console.error(`API call successful for uploadProjectFiles. Uploaded ${apiResponse.summary.successful_uploads} files.`);

      // Generate a detailed response message
      let responseText = `File upload completed for project ${args.project_id}:\n`;
      responseText += `Total files: ${apiResponse.summary.total_files}\n`;
      responseText += `Successful uploads: ${apiResponse.summary.successful_uploads}\n`;
      responseText += `Failed uploads: ${apiResponse.summary.failed_uploads}\n`;

      if (apiResponse.files.length > 0) {
        responseText += '\nSuccessfully uploaded files:\n';
        apiResponse.files.forEach((file, index) => {
          responseText += `${index + 1}. ${file.file_name} (${file.file_type}, ${file.file_size} bytes)\n`;
        });
      }

      if (apiResponse.summary.errors.length > 0) {
        responseText += '\nUpload errors:\n';
        apiResponse.summary.errors.forEach((error, index) => {
          responseText += `${index + 1}. ${error.file_name}: ${error.error}\n`;
        });
      }

      // Transform the API response into MCP format
      const mcpResponse: UploadProjectFilesMcpOutput = {
        content: [
          { type: 'text', text: responseText.trim() }
        ]
      };

      return mcpResponse;
    } catch (error) {
      console.error(`Error executing uploadProjectFiles tool: ${error}`);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to upload files to project ${args.project_id}: ${errorMessage}`);
    }
  }
};