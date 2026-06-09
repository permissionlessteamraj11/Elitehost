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
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(this.filePath, JSON.stringify([]));
      }
    }

    async read(): Promise<any[]> {
      await this.ensureFile();
      const content = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(content);
    }

    async write(data: any[]): Promise<void> {
      await this.ensureFile();
      const tempPath = `${this.filePath}.tmp`;
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
      await fs.rename(tempPath, this.filePath);
    }

    async find(filter: (item: any) => boolean): Promise<any[]> {
      const data = await this.read();
      return data.filter(filter);
    }

    async findOne(filter: (item: any) => boolean): Promise<any | null> {
      const data = await this.read();
      return data.find(filter) || null;
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
      const newData = data.map((item: any) => {
        if (filter(item)) {
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
      return newData.filter(filter);
    }

    async delete(filter: (item: any) => boolean): Promise<void> {
      const data = await this.read();
      const newData = data.filter((item: any) => !filter(item));
      await this.write(newData);
    }

    from() {
      return {
        select: async (query?: string) => {
          const data = await this.read();
          return { data, error: null };
        },
        eq: async (column: string, value: any) => {
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
    banned_ips: new JsonDB('banned_ips'),
    banned_users: new JsonDB('banned_users'),
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
        banned_ips: new JsonDB('banned_ips'),
        banned_users: new JsonDB('banned_users'),
    };
}

export { db, JsonDB };
