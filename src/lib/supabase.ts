import { db, JsonDB } from './db/json-db';

// Mock Supabase client that uses JsonDB
// We only expose a limited set of functions to the client
export const supabase = {
  auth: {
    getUser: async () => {
        return { data: { user: null }, error: { message: 'Use auth-service on server' } };
    },
    signInWithPassword: async ({ email, password }: any) => {
      return { data: null, error: { message: 'Use login action' } };
    },
    signOut: async () => {
      return { error: null };
    }
  },
  from: (collection: string) => {
    if (typeof window !== 'undefined') {
        return {
            select: async () => ({ data: [], error: null }),
            eq: () => ({
                single: () => ({ data: null, error: null }),
                select: async () => ({ data: [], error: null }),
                eq: () => ({
                    single: () => ({ data: null, error: null })
                })
            }),
            insert: async () => ({ data: null, error: null }),
            update: () => ({ eq: async () => ({ data: [], error: null }) }),
            upsert: async () => ({ data: null, error: null })
        };
    }

    const table = (db as any)[collection];
    if (table) {
      return table.from();
    }
    return new JsonDB(collection).from();
  },
  removeChannel: (channel: any) => {},
  channel: (name: string) => ({
    on: () => ({
        subscribe: () => ({})
    })
  })
};
