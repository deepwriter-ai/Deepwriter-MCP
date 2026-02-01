import { listJobsTool } from './dist/tools/listJobs.js';
import * as dotenv from 'dotenv';

dotenv.config();

console.log("Testing listJobs tool...");

async function run() {
  try {
    // Mock the environment if needed, or rely on .env
    if (!process.env.DEEPWRITER_API_KEY) {
        console.error("Error: DEEPWRITER_API_KEY not found in environment.");
        process.exit(1);
    }

    const result = await listJobsTool.execute({});
    console.log("Tool Execution Result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Test Failed:", error);
  }
}

run();
