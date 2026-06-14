import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(50),
  password: z.string().min(8).max(10),
  username: z.string().min(3).max(30),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits").optional(),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1).max(50),
  password: z.string().min(1).max(10),
});

export const deploymentSchema = z.object({
  name: z.string().min(1).max(100),
  method: z.enum(['github', 'github_public', 'zip', 'raw', 'json']).optional(),
  repoUrl: z.string().url().optional(),
  branch: z.string().max(50).optional(),
  framework: z.string().max(50).optional(),
  build_command: z.string().max(200).nullable().optional(),
  deploy_command: z.string().max(200).nullable().optional(),
  env_vars: z.array(z.object({
    key: z.string().min(1).max(100),
    value: z.string().max(1000),
  })).optional(),
  rawCode: z.string().max(100000).optional(),
});

export const zipDeploymentSchema = z.object({
    name: z.string().max(100).optional(),
    build_command: z.string().max(200).optional(),
    deploy_command: z.string().max(200).optional(),
    env_vars: z.string().optional(),
});
