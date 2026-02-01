import { 
  listProjects, 
  createProject, 
  getProjectDetails, 
  updateProject, 
  deleteProject, 
  formatPrompt, 
  generateWizardWork,
  uploadProjectFiles
} from '../api/deepwriterClient.js';
import dotenv from 'dotenv';

// Polyfill File for Node.js < 20 compatibility
if (typeof global.File === 'undefined') {
  const { File } = await import('node:buffer');
  global.File = File as any;
}

dotenv.config();

const apiKey = process.env.DEEPWRITER_API_KEY || '';

describe('Deepwriter MCP Live Integration', () => {
  let createdProjectId: string;

  beforeAll(() => {
    if (!apiKey) {
      console.warn('DEEPWRITER_API_KEY is missing, skipping live tests');
    }
  });

  afterAll(async () => {
    if (createdProjectId && apiKey) {
      try {
        console.log(`Cleaning up project: ${createdProjectId}`);
        await deleteProject(apiKey, createdProjectId);
      } catch (e) {
        console.error('Cleanup failed:', e);
      }
    }
  });

  const testFn = apiKey ? test : test.skip;

  testFn('Full Lifecycle Integration Test', async () => {
    // 1. List Projects (Pre-check)
    console.log('Step 1: Listing projects...');
    const initialProjects = await listProjects(apiKey);
    expect(initialProjects).toBeDefined();
    expect(Array.isArray(initialProjects.projects)).toBe(true);

    // 2. Create Project
    console.log('Step 2: Creating project...');
    const testProjectName = `Integration Test ${Date.now()}`;
    const createResponse = await createProject(apiKey, testProjectName, 'test@example.com');
    createdProjectId = createResponse.id;
    expect(createdProjectId).toBeDefined();
    console.log(`Created project ID: ${createdProjectId}`);

    // 3. Get Details
    console.log('Step 3: Getting project details...');
    const details = await getProjectDetails(apiKey, createdProjectId);
    expect(details.project.title).toBe(testProjectName);

    // 4. Update Project
    console.log('Step 4: Updating project...');
    const updatedDescription = 'Updated description for integration test';
    await updateProject(apiKey, createdProjectId, { work_description: updatedDescription });
    const updatedDetails = await getProjectDetails(apiKey, createdProjectId);
    expect(updatedDetails.project.work_description).toBe(updatedDescription);

    // 5. Format Prompt
    console.log('Step 5: Formatting prompt...');
    const promptResponse = await formatPrompt(apiKey, 'Write a story about a robot', createdProjectId);
    expect(promptResponse.enhanced_prompt).toBeDefined();

    // 6. Generate Work (Job Start)
    console.log('Step 6: Generating work...');
    const generateResponse = await generateWizardWork(apiKey, {
      projectId: createdProjectId,
      prompt: 'Write a short story about a robot learning to paint.',
      author: 'Test Author',
      email: 'test@example.com'
    });
    expect(generateResponse.message).toBeDefined();
    expect(generateResponse.jobId).toBeDefined();

    // 7. Upload Files
    console.log('Step 7: Uploading files...');
    // Use global File if available, otherwise we might need a polyfill for Node < 20
    // But the task is to ensure Node 20+ or polyfill.
    const dummyFile = new File(['This is a test file content'], 'test.txt', { type: 'text/plain' });
    const uploadResponse = await uploadProjectFiles(apiKey, createdProjectId, [dummyFile]);
    expect(uploadResponse.success).toBe(true);

    // 8. Delete Project
    console.log('Step 8: Deleting project...');
    const deleteResponse = await deleteProject(apiKey, createdProjectId);
    expect(deleteResponse.message).toContain(createdProjectId);
    
    // Reset createdProjectId so afterAll doesn't try to delete it again
    const deletedId = createdProjectId;
    createdProjectId = '';

    // 9. Verify Deletion
    console.log('Step 9: Verifying deletion...');
    await expect(getProjectDetails(apiKey, deletedId)).rejects.toThrow(/404/);
  });
});
