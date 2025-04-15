import fetch from 'node-fetch'; // Using node-fetch for consistency across Node versions
import { Response } from 'node-fetch';

// TODO: Make base URL configurable (e.g., via environment variables)
const DEEPWRITER_API_BASE_URL = 'https://www.deepwriter.com/api';

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
  return makeApiRequest<ListProjectsResponse>('/listProjects', apiKey, 'GET');
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
  const endpoint = `/getProjectDetails?projectId=${encodeURIComponent(projectId)}`;
  return makeApiRequest<GetProjectDetailsResponse>(endpoint, apiKey, 'GET');
}

// --- createProject ---

// Input body structure expected by the API
interface CreateProjectApiInput {
  newProjectName: string; // API expects 'name', not 'title'
  email: string;
}

export interface CreateProjectResponse {
  id: string; // ID of the newly created project
}

export async function createProject(apiKey: string, title: string, email: string): Promise<CreateProjectResponse> {
  console.error(`Calling actual createProject API with title: ${title}, email: ${email}`);
  if (!apiKey) {
    throw new Error("API key is required for createProject");
  }
  if (!title || title.trim() === '') {
    throw new Error("Project title is required for createProject");
  }
    if (!email || title.trim() === '') {
    throw new Error("Project email is required for createProject");
  }

  // Use the correct field name 'newProjectName' for the API request body
  const body: CreateProjectApiInput = { newProjectName: title, email: email };
  return makeApiRequest<CreateProjectResponse>('/createProject', apiKey, 'POST', body);
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

  const endpoint = `/updateProject?projectId=${encodeURIComponent(projectId)}`;
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

  const endpoint = `/deleteProject?projectId=${encodeURIComponent(projectId)}`;
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

// --- generateWork ---

interface GenerateWorkInputBody {
  projectId: string;
  is_default?: boolean; // Optional based on schema, default is true
}

export interface GenerateWorkResponse {
  jobId: string; // ID of the generated job
}

export async function generateWork(
  apiKey: string,
  projectId: string,
  isDefault: boolean = true // Default value from schema
): Promise<GenerateWorkResponse> {
  console.error(`Calling actual generateWork API for project ID: ${projectId}`);
  if (!apiKey) {
    throw new Error("API key is required for generateWork");
  }
  if (!projectId) {
    throw new Error("Project ID is required for generateWork");
  }

  const body: GenerateWorkInputBody = {
    projectId: projectId,
    is_default: isDefault,
  };
  return makeApiRequest<GenerateWorkResponse>('/generateWork', apiKey, 'POST', body);
}
