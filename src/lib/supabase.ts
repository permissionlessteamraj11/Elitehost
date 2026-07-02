import { prisma } from './prisma';

// Mock Supabase client that uses Prisma
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
    // This is a very basic mock to prevent breaking frontend if it still uses supabase.from()
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
  },
  removeChannel: (channel: any) => {},
  channel: (name: string) => ({
    on: () => ({
        subscribe: () => ({})
    })
  })
};
