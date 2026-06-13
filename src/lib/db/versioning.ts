import { db, JsonDB } from './json-db';
import { validateDeploymentConfig } from '../config-parser';

const versionsDb = new JsonDB('deployment_versions');

export async function createDeploymentVersion(deploymentId: string, userId: string, config: any, changes?: string) {
  // Validate config
  const validatedConfig = validateDeploymentConfig(config);

  // Get current versions count to increment version number
  const existingVersions = await versionsDb.find((v: any) => v.deployment_id === deploymentId);
  const nextVersion = existingVersions.length + 1;

  const versionRecord = {
    deployment_id: deploymentId,
    user_id: userId,
    version: nextVersion,
    config: validatedConfig,
    changes: changes || `Version ${nextVersion}`,
    created_at: new Date().toISOString()
  };

  return await versionsDb.insert(versionRecord);
}

export async function getDeploymentVersions(deploymentId: string) {
  return await versionsDb.find((v: any) => v.deployment_id === deploymentId);
}

export async function getDeploymentVersion(deploymentId: string, version: number) {
  return await versionsDb.findOne((v: any) => v.deployment_id === deploymentId && v.version === version);
}

export async function rollbackDeployment(deploymentId: string, version: number) {
  const versionRecord = await getDeploymentVersion(deploymentId, version);
  if (!versionRecord) {
    throw new Error(`Version ${version} not found for deployment ${deploymentId}`);
  }

  // Update the deployment's main config
  await db.deployments.update((d: any) => d.id === deploymentId, {
    config: versionRecord.config,
    updated_at: new Date().toISOString()
  });

  return versionRecord;
}
