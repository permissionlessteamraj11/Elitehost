import { DOCKER_TEMPLATES } from "../templates/dockerfiles";
import { DeploymentConfig } from "@/lib/config-parser";

export class DockerBuilder {
  static generate(config: DeploymentConfig): string {
    const template = DOCKER_TEMPLATES[config.framework as keyof typeof DOCKER_TEMPLATES] || DOCKER_TEMPLATES.nextjs;

    const dockerfile = template
      .replace(/{{nodeVersion}}/g, config.nodeVersion || "22")
      .replace(/{{pythonVersion}}/g, "3.11")
      .replace(/{{buildCommand}}/g, config.buildCommand ? `RUN ${config.buildCommand}` : "RUN npm run build")
      .replace(/{{startCommand}}/g, config.startCommand ? (config.startCommand.includes('[') ? config.startCommand : `["${config.startCommand.split(' ').join('", "')}"]`) : '["npm", "start"]')
      .replace(/{{outputDirectory}}/g, config.outputDirectory || ".next")
      .replace(/{{port}}/g, (config.port || 3000).toString());

    return dockerfile;
  }
}
