import { DOCKER_TEMPLATES } from "../templates/dockerfiles";
import { DeploymentConfig } from "@/lib/config-parser";

export class DockerBuilder {
  static generate(config: DeploymentConfig): string {
    const template = DOCKER_TEMPLATES[config.projectType as keyof typeof DOCKER_TEMPLATES] || DOCKER_TEMPLATES.nextjs;

    const dockerfile = template
      .replace(/{{nodeVersion}}/g, config.runtime.version || "22")
      .replace(/{{pythonVersion}}/g, "3.11")
      .replace(/{{buildCommand}}/g, config.build.command ? `RUN ${config.build.command}` : "RUN npm run build")
      .replace(/{{startCommand}}/g, config.start.command ? (config.start.command.includes('[') ? config.start.command : `["${config.start.command.split(' ').join('", "')}"]`) : '["npm", "start"]')
      .replace(/{{outputDirectory}}/g, config.build.outputDir || ".next")
      .replace(/{{port}}/g, (config.start.port || 3000).toString());

    return dockerfile;
  }
}
