import { validateDeploymentConfig } from '../src/lib/config-parser';

const validConfig = {
  name: "test-app",
  projectType: "nextjs",
  runtime: { language: "nodejs", version: "22" },
  source: {
    type: "github",
    repoUrl: "https://github.com/user/repo",
    branch: "main"
  },
  build: { command: "npm run build" },
  start: { command: "npm start" }
};

try {
  console.log("Validating correct config...");
  validateDeploymentConfig(validConfig);
  console.log("✅ Valid config passed");

  console.log("Validating incorrect config...");
  try {
    validateDeploymentConfig({ name: "invalid" });
    console.error("❌ Invalid config should have failed");
  } catch (e: any) {
    console.log("✅ Invalid config correctly failed:", e.message);
  }

} catch (err) {
  console.error("Test failed", err);
  process.exit(1);
}
