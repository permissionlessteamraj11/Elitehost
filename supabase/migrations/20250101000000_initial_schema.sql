-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    credit_balance DECIMAL(10,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    framework TEXT,
    github_repo TEXT,
    branch TEXT DEFAULT 'main',
    deploy_type TEXT CHECK (deploy_type IN ('git', 'zip', 'raw', 'json')),
    build_command TEXT,
    start_command TEXT,
    install_command TEXT,
    output_directory TEXT,
    custom_domain TEXT UNIQUE,
    subdomain TEXT UNIQUE,
    status TEXT DEFAULT 'idle',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deployments Table
CREATE TABLE IF NOT EXISTS public.deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    deployment_id TEXT UNIQUE, -- External provider ID if any
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'ready', 'error', 'stopped')),
    logs TEXT,
    commit_hash TEXT,
    deployed_url TEXT,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Environment Variables
CREATE TABLE IF NOT EXISTS public.environment_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    encrypted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, key)
);

-- Domains
CREATE TABLE IF NOT EXISTS public.domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    domain TEXT UNIQUE NOT NULL,
    ssl_enabled BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Stats
CREATE TABLE IF NOT EXISTS public.usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    cpu_usage DECIMAL(5,2),
    ram_usage DECIMAL(10,2), -- In MB
    bandwidth DECIMAL(15,2), -- In bytes
    deployments_count INTEGER DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environment_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for now, will be refined in Step 3)
CREATE POLICY "Users can see their own data" ON public.users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Users can see their own projects" ON public.projects FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can see their own deployments" ON public.deployments FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())));
CREATE POLICY "Users can see their own env vars" ON public.environment_variables FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())));
CREATE POLICY "Users can see their own domains" ON public.domains FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())));
CREATE POLICY "Users can see their own stats" ON public.usage_stats FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
