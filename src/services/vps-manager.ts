import { execFile } from 'child_process';
import { promisify } from 'util';
import net from 'net';

const execFileAsync = promisify(execFile);

export interface ContainerConfig {
  name: string;
  image: string;
  memoryLimit: string;
  cpuLimit: number;
  ports: { container: number; host: number };
  env?: Record<string, string>;
}

export class VPSManager {
  /**
   * Check if a host port is in use
   */
  static async isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer()
        .once('error', () => resolve(true))
        .once('listening', () => {
          server.close();
          resolve(false);
        })
        .listen(port);
    });
  }

  /**
   * Find an available port in the range
   */
  static async findAvailablePort(start: number, end: number): Promise<number> {
    for (let port = start; port <= end; port++) {
      if (!(await this.isPortInUse(port))) {
        return port;
      }
    }
    throw new Error("No available ports in range");
  }

  /**
   * Create and start a new container with resource limits
   */
  static async createContainer(config: ContainerConfig): Promise<string> {
    const { name, image, memoryLimit, cpuLimit, ports, env } = config;

    const args = [
      'run', '-d',
      '--name', name,
      '--memory', memoryLimit,
      '--cpus', cpuLimit.toString(),
      '-p', `${ports.host}:${ports.container}`,
      '--restart', 'unless-stopped'
    ];

    if (env) {
      for (const [key, value] of Object.entries(env)) {
        args.push('-e', `${key}=${value}`);
      }
    }

    args.push(image);

    try {
      const { stdout } = await execFileAsync('docker', args);
      return stdout.trim();
    } catch (error: any) {
      console.error(`Failed to create container ${name}:`, error.message);
      throw new Error(`Docker error: ${error.message}`);
    }
  }

  static async stopContainer(containerId: string): Promise<void> {
    try {
      await execFileAsync('docker', ['stop', containerId]);
    } catch (error: any) {
      console.error(`Failed to stop container ${containerId}:`, error.message);
    }
  }

  static async startContainer(containerId: string): Promise<void> {
    try {
      await execFileAsync('docker', ['start', containerId]);
    } catch (error: any) {
      throw new Error(`Docker error: ${error.message}`);
    }
  }

  static async restartContainer(containerId: string): Promise<void> {
    try {
      await execFileAsync('docker', ['restart', containerId]);
    } catch (error: any) {
      throw new Error(`Docker error: ${error.message}`);
    }
  }

  static async deleteContainer(containerId: string): Promise<void> {
    try {
      await execFileAsync('docker', ['rm', '-f', containerId]);
    } catch (error: any) {
      console.error(`Failed to delete container ${containerId}:`, error.message);
    }
  }

  static async getStats(containerId: string) {
    try {
      const { stdout } = await execFileAsync('docker', [
        'stats', containerId,
        '--no-stream',
        '--format', '{{.CPUPerc}},{{.MemUsage}},{{.NetIO}},{{.BlockIO}}'
      ]);
      const [cpu, mem, net, block] = stdout.trim().split(',');
      return { cpu, mem, net, block };
    } catch (error: any) {
      return null;
    }
  }

  static async getLogs(containerId: string, tail: number = 100): Promise<string> {
    try {
      const { stdout } = await execFileAsync('docker', ['logs', '--tail', tail.toString(), containerId]);
      return stdout;
    } catch (error: any) {
      return `Error retrieving logs: ${error.message}`;
    }
  }
}
