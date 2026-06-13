import { z } from "zod";

export const deploymentConfigSchema = z.object({
  deploymentId: z.string().optional(),
  name: z.string(),
  projectType: z.enum([
    "nextjs", "react", "vue", "nuxt", "express", "nodejs",
    "python", "flask", "fastapi", "django", "static", "astro", "remix",
    "go", "php", "laravel", "java", "spring-boot", "rust", "bun", "deno"
  ]),
  runtime: z.object({
    language: z.string(),
    version: z.string().default("latest")
  }),
  source: z.object({
    type: z.enum(["github", "zip", "raw", "json"]),
    provider: z.string().optional(),
    repoUrl: z.string().optional(),
    branch: z.string().optional(),
    commit: z.string().nullable().optional(),
    accessMode: z.enum(["oauth", "github_app", "ssh_deploy_key", "public"]).optional(),
    autoDeploy: z.boolean().default(true),
    privateRepo: z.boolean().default(false)
  }),
  build: z.object({
    command: z.string().nullable().optional(),
    installCommand: z.string().nullable().optional(),
    outputDir: z.string().nullable().optional(),
    dockerfilePath: z.string().nullable().optional()
  }),
  start: z.object({
    command: z.string().nullable().optional(),
    healthCheckPath: z.string().default("/"),
    port: z.number().default(3000)
  }),
  env: z.object({
    public: z.record(z.string(), z.string()).default({}),
    secret: z.record(z.string(), z.string()).default({}),
    groups: z.array(z.string()).default([])
  }).default({ public: {}, secret: {}, groups: [] }),
  resources: z.object({
    cpu: z.string().default("0.5"),
    ram: z.string().default("512MB"),
    storage: z.string().default("1GB"),
    replicas: z.number().default(1)
  }).default({ cpu: "0.5", ram: "512MB", storage: "1GB", replicas: 1 }),
  networking: z.object({
    customDomain: z.string().nullable().optional(),
    ssl: z.boolean().default(true),
    ports: z.array(z.number()).default([3000])
  }).default({ ssl: true, ports: [3000] }),
  scaling: z.object({
    enabled: z.boolean().default(false),
    horizontal: z.boolean().default(false),
    vertical: z.boolean().default(false),
    minReplicas: z.number().default(1),
    maxReplicas: z.number().default(1)
  }).default({ enabled: false, horizontal: false, vertical: false, minReplicas: 1, maxReplicas: 1 }),
  security: z.object({
    rateLimit: z.boolean().default(true),
    firewall: z.boolean().default(true),
    secretEncryption: z.boolean().default(true)
  }).default({ rateLimit: true, firewall: true, secretEncryption: true }),
  metadata: z.object({
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    version: z.number().default(1)
  }).optional()
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

export function validateDeploymentConfig(config: any): DeploymentConfig {
  return deploymentConfigSchema.parse(config);
}
