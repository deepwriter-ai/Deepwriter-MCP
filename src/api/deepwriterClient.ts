// Using native fetch and FormData (available in Node.js 18+)

// TODO: Make base URL configurable (e.g., via environment variables)
const DEEPWRITER_API_BASE_URL = 'https://api.deepwriter.com';

interface ApiErrorResponse {
  message: string;
  // Add other potential error fields if known
}

// Generic function to handle API requests
async function makeApiRequest<T>(
  endpoint: string,
  apiKey: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: object
): Promise<T> {
  const url = `${DEEPWRITER_API_BASE_URL}${endpoint}`;
  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  console.error(`Making API request: ${method} ${url}`); // Log request details (excluding body/key for security)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let errorBodyText = await response.text(); // Get raw response text first
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      console.error(`API Error ${response.status}: Raw Body ->`, errorBodyText); // Log raw body

      try {
        // Try parsing as JSON to get a structured message if available
        const errorJson = JSON.parse(errorBodyText) as ApiErrorResponse;
        if (errorJson && errorJson.message) {
          errorMessage += ` - ${errorJson.message}`;
        } else if (errorBodyText) {
           errorMessage += ` - ${errorBodyText}`; // Use raw text if no JSON message
        }
      } catch (jsonError) {
         // If JSON parsing fails, use the raw text if available
         if (errorBodyText) {
            errorMessage += ` - ${errorBodyText}`;
         }
      }
       // TODO: Implement more specific error mapping based on status codes (401, 403, 404, etc.)
      throw new Error(errorMessage);
    }

    // Handle cases where the response might be empty (e.g., DELETE success)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T; // Or return a specific success indicator if needed
    }

    return await response.json() as T;

  } catch (error) {
    console.error(`Network or fetch error: ${error}`);
    throw new Error(`Failed to connect to DeepWriter API: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// --- API Client Functions ---

// Define proper types for API responses
interface ProjectListItem {
  id: string;
  title: string;
  created_at: string; // Assuming ISO string format
}

interface ListProjectsResponse {
  projects: ProjectListItem[];
  // Add other potential fields like pagination info if applicable
}

export async function listProjects(apiKey: string): Promise<ListProjectsResponse> {
  console.error("Calling actual listProjects API");
  if (!apiKey) {
    throw new Error("API key is required for listProjects");
  }
  // Actual implementation:
  return makeApiRequest<ListProjectsResponse>('/api/listProjects', apiKey, 'GET');
}

// --- getProjectDetails ---

interface ProjectDetails {
  id: string;
  title: string;
  author?: string; // Optional fields based on schema
  email?: string;
  model?: string;
  outline_text?: string;
  prompt?: string;
  style_text?: string;
  supplemental_info?: string;
  work_description?: string;
  work_details?: string;
  work_vision?: string;
  created_at: string;
  updated_at: string;
}

export interface GetProjectDetailsResponse {
  project: ProjectDetails;
}

export async function getProjectDetails(apiKey: string, projectId: string): Promise<GetProjectDetailsResponse> {
  console.error(`Calling actual getProjectDetails API for project ID: ${projectId}`);
  if (!apiKey) {
    throw new Error("API key is required for getProjectDetails");
  }
  if (!projectId) {
    throw new Error("Project ID is required for getProjectDetails");
  }
  const endpoint = `/api/getProjectDetails?projectId=${encodeURIComponent(projectId)}`;
  return makeApiRequest<GetProjectDetailsResponse>(endpoint, apiKey, 'GET');
}

// --- createProject ---

// Input body structure expected by the API (only newProjectName based on demo script)
interface CreateProjectApiInput {
  newProjectName: string; // API expects only project name
}

export interface CreateProjectResponse {
  id: string; // ID of the newly created project
}

export async function createProject(apiKey: string, title: string, email: string): Promise<CreateProjectResponse> {
  console.error(`Calling actual createProject API with title: ${title}`);
  if (!apiKey) {
    throw new Error("API key is required for createProject");
  }
  if (!title || title.trim() === '') {
    throw new Error("Project title is required for createProject");
  }
  // Note: email parameter accepted for MCP interface compatibility but not sent to API

  // Use the correct field name 'newProjectName' for the API request body (email not needed)
  const body: CreateProjectApiInput = { newProjectName: title };
  return makeApiRequest<CreateProjectResponse>('/api/createProject', apiKey, 'POST', body);
}

// --- updateProject ---

// Interface for the 'updates' object based on the schema
interface ProjectUpdates {
  author?: string;
  email?: string;
  model?: string;
  outline_text?: string;
  prompt?: string;
  style_text?: string;
  supplemental_info?: string;
  title?: string;
  work_description?: string;
  work_details?: string;
  work_vision?: string;
}

export interface UpdateProjectResponse {
  id: string; // ID of the updated project
}

export async function updateProject(
  apiKey: string,
  projectId: string,
  updates: ProjectUpdates
): Promise<UpdateProjectResponse> {
  console.error(`Calling actual updateProject API for project ID: ${projectId}`);
  if (!apiKey) {
    throw new Error("API key is required for updateProject");
  }
  if (!projectId) {
    throw new Error("Project ID is required for updateProject");
  }
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("Updates object cannot be empty for updateProject");
  }

  const endpoint = `/api/updateProject?projectId=${encodeURIComponent(projectId)}`;
  return makeApiRequest<UpdateProjectResponse>(endpoint, apiKey, 'PATCH', updates);
}

// --- deleteProject ---

export interface DeleteProjectResponse {
  message: string; // Success message
}

export async function deleteProject(apiKey: string, projectId: string): Promise<DeleteProjectResponse> {
  console.error(`Calling actual deleteProject API for project ID: ${projectId}`);
  if (!apiKey) {
    throw new Error("API key is required for deleteProject");
  }
  if (!projectId) {
    throw new Error("Project ID is required for deleteProject");
  }

  const endpoint = `/api/deleteProject?projectId=${encodeURIComponent(projectId)}`;
  // Use a temporary type that allows for an empty object from makeApiRequest on 204
  type TempDeleteResponse = DeleteProjectResponse | {};
  const response = await makeApiRequest<TempDeleteResponse>(endpoint, apiKey, 'DELETE');

  // If API returns 204 (empty object), construct the standard success message
  if (typeof response === 'object' && Object.keys(response).length === 0) {
      return { message: `Project ${projectId} deleted successfully.` };
  }
  // Otherwise, assume the API returned the expected { message: ... } structure
  return response as DeleteProjectResponse;
}

// --- generateWizardWork ---

interface GenerateWizardWorkInputBody {
  projectId: string;
  prompt: string;
  author: string;
  email: string;
  outline_text?: string;
  has_technical_diagrams?: 'auto' | 'on' | 'off';
  has_tableofcontents?: 'auto' | 'on' | 'off';
  use_web_research?: 'auto' | 'on' | 'off';
  page_length?: string;
  questions_and_answers?: string; // JSON string
  mode?: 'deepwriter' | 'benchmark' | 'romance' | 'homework' | 'deepseek' | 'skunkworks';
  isDefault?: boolean;
  max_pages?: number;
  free_trial_mode?: 'true' | 'false';
}

export interface GenerateWizardWorkResponse {
  message: string;
  jobId: string; // ID of the generated job
}

export async function generateWizardWork(
  apiKey: string,
  params: GenerateWizardWorkInputBody
): Promise<GenerateWizardWorkResponse> {
  console.error(`Calling actual generateWizardWork API for project ID: ${params.projectId}`);
  if (!apiKey) {
    throw new Error("API key is required for generateWizardWork");
  }
  if (!params.projectId) {
    throw new Error("Project ID is required for generateWizardWork");
  }
  if (!params.prompt) {
    throw new Error("Prompt is required for generateWizardWork");
  }
  if (!params.author) {
    throw new Error("Author is required for generateWizardWork");
  }
  if (!params.email) {
    throw new Error("Email is required for generateWizardWork");
  }

  // Add isDefault: true as required by the API (from demo script)
  const requestBody = {
    ...params,
    isDefault: true
  };

  return makeApiRequest<GenerateWizardWorkResponse>('/api/generateWizardWork', apiKey, 'POST', requestBody);
}

// --- formatPrompt ---

interface FormatPromptInputBody {
  prompt: string;
  projectId?: string;
}

export interface FormatPromptResponse {
  enhanced_prompt: string;
  formatted_prompt?: string; // Legacy field name for compatibility
  questions?: string[];
}

export async function formatPrompt(
  apiKey: string,
  prompt: string,
  projectId?: string
): Promise<FormatPromptResponse> {
  console.error(`Calling actual formatPrompt API`);
  if (!apiKey) {
    throw new Error("API key is required for formatPrompt");
  }
  if (!prompt) {
    throw new Error("Prompt is required for formatPrompt");
  }

  const body: FormatPromptInputBody = {
    prompt: prompt,
    ...(projectId && { projectId: projectId })  // Note: API expects projectId not project_id
  };
  return makeApiRequest<FormatPromptResponse>('/api/formatPrompt', apiKey, 'POST', body);
}

// --- uploadProjectFiles ---

export interface ProjectFileResponse {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url?: string;
  storage_path: string;
  uploaded_at: string;
}

export interface UploadProjectFilesResponse {
  success: boolean;
  files: ProjectFileResponse[];
  summary: {
    total_files: number;
    successful_uploads: number;
    failed_uploads: number;
    errors: Array<{
      file_name: string;
      error: string;
    }>;
  };
}

export async function uploadProjectFiles(
  apiKey: string,
  projectId: string,
  files: File[]
): Promise<UploadProjectFilesResponse> {
  console.error(`Calling actual uploadProjectFiles API for project ID: ${projectId}`);
  if (!apiKey) {
    throw new Error("API key is required for uploadProjectFiles");
  }
  if (!projectId) {
    throw new Error("Project ID is required for uploadProjectFiles");
  }
  if (!files || files.length === 0) {
    throw new Error("At least one file is required for uploadProjectFiles");
  }

  const formData = new FormData();
  formData.append('projectId', projectId);
  
  // Add all files to the FormData
  files.forEach((file) => {
    formData.append('file', file);
  });

  const url = `${DEEPWRITER_API_BASE_URL}/api/uploadProjectFiles`;
  const headers = {
    'x-api-key': apiKey,
    'Origin': DEEPWRITER_API_BASE_URL,
    // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
  };

  console.error(`Making file upload request: POST ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorBodyText = await response.text();
      let errorMessage = `File upload failed: ${response.status} ${response.statusText}`;
      console.error(`Upload Error ${response.status}: Raw Body ->`, errorBodyText);

      try {
        const errorJson = JSON.parse(errorBodyText) as ApiErrorResponse;
        if (errorJson && errorJson.message) {
          errorMessage += ` - ${errorJson.message}`;
        } else if (errorBodyText) {
           errorMessage += ` - ${errorBodyText}`;
        }
      } catch (jsonError) {
         if (errorBodyText) {
            errorMessage += ` - ${errorBodyText}`;
         }
      }
      throw new Error(errorMessage);
    }

    return await response.json() as UploadProjectFilesResponse;

  } catch (error) {
    console.error(`Network or fetch error during file upload: ${error}`);
    throw new Error(`Failed to upload files to DeepWriter API: ${error instanceof Error ? error.message : String(error)}`);
  }
}
