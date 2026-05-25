import { z } from "zod";

export const deploymentConfigSchema = z.object({
  framework: z.enum([
    "nextjs", "react", "vue", "nuxt", "express", "nodejs",
    "python", "flask", "fastapi", "django", "static", "astro", "remix"
  ]),
  installCommand: z.string().optional(),
  buildCommand: z.string().optional(),
  startCommand: z.string().optional(),
  outputDirectory: z.string().optional(),
  nodeVersion: z.string().default("22"),
  autoDeploy: z.boolean().default(true),
  port: z.number().default(3000),
  env: z.record(z.string(), z.string()).optional(),
});

export type DeploymentConfig = z.infer<typeof deploymentConfigSchema>;

export function parseDeploymentConfig(json: string): DeploymentConfig {
  try {
    const obj = JSON.parse(json);
    return deploymentConfigSchema.parse(obj);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid configuration: ${err.issues.map(e => e.path.join('.') + ': ' + e.message).join(', ')}`);
    }
    throw new Error("Invalid JSON format");
  }
}
