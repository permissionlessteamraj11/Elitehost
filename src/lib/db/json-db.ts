/* eslint-disable @typescript-eslint/no-require-imports */
let db: any = {};
let JsonDB: any = class {
  filePath: string = "";
  async ensureFile() {}
  async read(): Promise<any[]> { return []; }
  async write(data: any[]): Promise<void> {}
  async find(filter: (item: any) => boolean): Promise<any[]> { return []; }
  async findOne(filter: (item: any) => boolean): Promise<any | null> { return null; }
  async insert(item: any): Promise<any> { return {}; }
  async update(filter: (item: any) => boolean, updates: any): Promise<any[]> { return []; }
  async delete(filter: (item: any) => boolean): Promise<void> {}
  from(): any { return {}; }
};

if (typeof window === 'undefined') {
  const fs = require('fs/promises');
  const path = require('path');
  const crypto = require('crypto');

  const DATA_DIR = path.join(process.cwd(), 'data');

  JsonDB = class JsonDB {
    filePath: string;
    constructor(collection: string) {
      this.filePath = path.join(DATA_DIR, `${collection}.json`);
    }

    async ensureFile() {
      try {
        await fs.access(this.filePath);
      } catch {
        try {
          await fs.mkdir(DATA_DIR, { recursive: true });
          await fs.writeFile(this.filePath, JSON.stringify([]));
        } catch (error) {
          console.error(`Critical error ensuring database file ${this.filePath}:`, error);
          throw error;
        }
      }
    }

    async read(): Promise<any[]> {
      try {
        await this.ensureFile();
        const content = await fs.readFile(this.filePath, 'utf-8');
        if (!content || content.trim() === '') return [];
        try {
            return JSON.parse(content);
        } catch (parseError) {
            console.error(`Corrupted database file: ${this.filePath}. Manual recovery required.`);
            throw parseError; // Re-throw to prevent overwriting with []
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') return [];
        console.error(`Error reading ${this.filePath}:`, error);
        throw error;
      }
    }

    async write(data: any[]): Promise<void> {
      try {
        await this.ensureFile();
        const tempPath = `${this.filePath}.tmp`;
        // Prevent DoS by limiting total file size to 100MB
        const content = JSON.stringify(data, null, 2);
        if (content.length > 100 * 1024 * 1024) {
          throw new Error("Database size limit exceeded");
        }
        await fs.writeFile(tempPath, content);
        await fs.rename(tempPath, this.filePath);
      } catch (error) {
        console.error(`Error writing to ${this.filePath}:`, error);
        throw error;
      }
    }

    // Security Hardening: NoSQL Injection Protection
    private sanitizeFilter(filter: any): (item: any) => boolean {
        if (typeof filter !== 'function') {
            return () => false;
        }
        return filter;
    }

    async find(filter: (item: any) => boolean): Promise<any[]> {
      const data = await this.read();
      return data.filter(this.sanitizeFilter(filter));
    }

    async findOne(filter: (item: any) => boolean): Promise<any | null> {
      const data = await this.read();
      return data.find(this.sanitizeFilter(filter)) || null;
    }

    async insert(item: any): Promise<any> {
      const data = await this.read();
      const newItem = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...item,
      };
      data.push(newItem);
      await this.write(data);
      return newItem;
    }

    async update(filter: (item: any) => boolean, updates: any): Promise<any[]> {
      const data = await this.read();
      let updatedCount = 0;
      const sanitizedFilter = this.sanitizeFilter(filter);
      const newData = data.map((item: any) => {
        if (sanitizedFilter(item)) {
          updatedCount++;
          return {
            ...item,
            ...updates,
            updated_at: new Date().toISOString(),
          };
        }
        return item;
      });
      if (updatedCount > 0) {
        await this.write(newData);
      }
      return newData.filter(sanitizedFilter);
    }

    async delete(filter: (item: any) => boolean): Promise<void> {
      const data = await this.read();
      const sanitizedFilter = this.sanitizeFilter(filter);
      const newData = data.filter((item: any) => !sanitizedFilter(item));
      await this.write(newData);
    }

    from() {
      return {
        select: async (query?: string) => {
          const data = await this.read();
          return { data, error: null };
        },
        eq: async (column: string, value: any) => {
          // Prevent NoSQL injection by ensuring value is a primitive
          if (value !== null && typeof value === 'object') {
            return { data: [], error: { message: 'Invalid query value' } };
          }
          const data = await this.find((item: any) => item[column] === value);
          return {
            data,
            error: null,
            single: () => ({ data: data[0] || null, error: data[0] ? null : { message: 'Not found' } }),
          };
        },
        insert: async (item: any) => {
          const data = await this.insert(item);
          return { data, error: null };
        },
        update: async (updates: any) => {
          return {
            eq: async (column: string, value: any) => {
              if (value !== null && typeof value === 'object') {
                return { data: [], error: { message: 'Invalid query value' } };
              }
              const data = await this.update((item: any) => item[column] === value, updates);
              return { data, error: null };
            }
          };
        },
        upsert: async (item: any) => {
          const data = await this.read();
          const existingIndex = data.findIndex((i: any) => (item.id && i.id === item.id) || (item.key && i.key === item.key));
          if (existingIndex > -1) {
            data[existingIndex] = { ...data[existingIndex], ...item, updated_at: new Date().toISOString() };
          } else {
            data.push({ id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...item });
          }
          await this.write(data);
          return { data: item, error: null };
        }
      };
    }
  };

  db = {
    users: new JsonDB('users'),
    projects: new JsonDB('projects'),
    deployments: new JsonDB('deployments'),
    env_vars: new JsonDB('env_vars'),
    platform_settings: new JsonDB('platform_settings'),
    withdrawals: new JsonDB('withdrawals'),
    referrals: new JsonDB('referrals'),
    payment_requests: new JsonDB('payment_requests'),
    messages: new JsonDB('messages'),
    broadcasts: new JsonDB('broadcasts'),
    banned_ips: new JsonDB('banned_ips'),
    banned_users: new JsonDB('banned_users'),
    admin_attempts: new JsonDB('admin_attempts'),
  };
} else {
    db = {
        users: new JsonDB('users'),
        projects: new JsonDB('projects'),
        deployments: new JsonDB('deployments'),
        env_vars: new JsonDB('env_vars'),
        platform_settings: new JsonDB('platform_settings'),
        withdrawals: new JsonDB('withdrawals'),
        referrals: new JsonDB('referrals'),
        payment_requests: new JsonDB('payment_requests'),
        messages: new JsonDB('messages'),
        broadcasts: new JsonDB('broadcasts'),
        banned_ips: new JsonDB('banned_ips'),
        banned_users: new JsonDB('banned_users'),
        admin_attempts: new JsonDB('admin_attempts'),
    };
}

export { db, JsonDB };
