"use server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const MODEL_MAP: Record<string, string> = {
  "elite-v4": "google/gemini-2.0-flash-001",
  "elite-ultra": "anthropic/claude-3-5-sonnet",
  "architect-v1": "openai/gpt-4o",
};

const SYSTEM_PROMPT = `You are a Senior Software Architect, Staff Engineer, UI/UX Designer, DevOps Engineer, Security Expert and QA Engineer combined.
Rules:
- Never generate partial code.
- Always generate production-ready code.
- Always create complete project structure.
- Generate every required file.
- Write full implementation, never use placeholders.
- Maintain clean architecture and scalable design patterns.
- Follow industry best practices.
- Add comments where necessary.
- Handle all edge cases.
- Include security, validation, error handling and logging.
- Generate responsive and modern UI.
- Use latest stable technologies.
- Maintain modular codebase.
- Optimize performance and database queries.
- Create reusable components.
- Generate deployment configuration.
- Generate environment variables setup.
- Generate API documentation.
- Generate database schema and migrations.
- Generate admin panel if required.
- Generate testing files.
- SECURITY: Implement CSRF protection, input sanitization (using DOMPurify for HTML), and avoid common vulnerabilities like SQL Injection, XSS, or RCE. Use environment variables for sensitive data.
- OUTPUT FORMAT: You must return ONLY a JSON object with a "files" key. The value of "files" must be an array of objects. Each object must have:
  "name": (string) The full path to the file.
  "language": (string) The programming language (e.g., "typescript", "javascript", "json", "python").
  "content": (string) The full content of the file.
- DO NOT wrap the JSON in markdown code blocks. Just return the raw JSON object.`;

export async function generateCode(prompt: string, framework: string, modelId: string = "elite-v4") {
  console.log(`[AI Persona Active] Generating elite code for: ${prompt} using ${modelId}`);

  if (!OPENROUTER_API_KEY) {
      console.warn("OPENROUTER_API_KEY is missing. Falling back to mock data.");
      return mockGenerate(prompt, framework);
  }

  const model = MODEL_MAP[modelId] || MODEL_MAP["elite-v4"];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          {"role": "system", "content": SYSTEM_PROMPT},
          {"role": "user", "content": `Generate a full production-ready ${framework} project for the following request: ${prompt}`}
        ],
        "temperature": 0.3
      })
    });

    if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.files && Array.isArray(parsed.files)) {
        return parsed.files;
    }

    return parsed;
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    throw new Error(`Generation failed: ${error.message}`);
  }
}

export async function diagnoseCode(code: string, fileName: string = "unknown") {
  if (!OPENROUTER_API_KEY) {
    return { status: "issues", message: "Diagnosis unavailable (API Key missing).", details: ["Configure OPENROUTER_API_KEY to enable AI Audit."] };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": [
          {"role": "system", "content": "You are a Senior Security Auditor. Analyze the provided code for security flaws, bugs, and architectural anti-patterns. Return a JSON object with 'status' ('clean' or 'issues'), 'message' (a brief summary), and 'details' (an array of specific findings)."},
          {"role": "user", "content": `Analyze this file: ${fileName}\n\nCode:\n${code}`}
        ],
        "temperature": 0.1
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error: any) {
    return { status: "error", message: "Diagnosis failed.", details: [error.message] };
  }
}

async function mockGenerate(prompt: string, framework: string) {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("ecommerce") || lowerPrompt.includes("shop")) {
    return [
      {
        name: "src/app/page.tsx",
        language: "typescript",
        content: `"use client";\nimport { useState } from "react";\nimport { ShoppingCart, Search, User, Menu, ChevronRight, Star } from "lucide-react";\nimport { motion } from "framer-motion";\n\nconst products = [\n  { id: 1, name: "Elite Watch", price: 299, rating: 4.8, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30" },\n  { id: 2, name: "Neural Headset", price: 199, rating: 4.9, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" },\n  { id: 3, name: "Zen Camera", price: 899, rating: 4.7, image: "https://images.unsplash.com/photo-1526170315873-3a5616be83c3" },\n];\n\nexport default function Storefront() {\n  return (\n    <div className="min-h-screen bg-white text-black font-sans">\n      {/* Navigation */}\n      <nav className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">\n        <div className="text-xl font-bold tracking-tighter uppercase">EliteStore</div>\n        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-500">\n          <a href="#" className="text-black">New Arrivals</a>\n          <a href="#" className="hover:text-black">Collection</a>\n          <a href="#" className="hover:text-black">About</a>\n        </div>\n        <div className="flex items-center gap-5">\n          <Search className="w-5 h-5 cursor-pointer" />\n          <div className="relative cursor-pointer">\n            <ShoppingCart className="w-5 h-5" />\n            <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">0</span>\n          </div>\n        </div>\n      </nav>\n\n      {/* Hero Section */}\n      <section className="px-6 py-20 bg-zinc-50">\n        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">\n          <motion.div\n            initial={{ opacity: 0, x: -20 }}\n            animate={{ opacity: 1, x: 0 }}\n            className="space-y-8"\n          >\n            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Summer Collection 2025</span>\n            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">DESIGNED <br/>FOR ELITES.</h1>\n            <p className="text-zinc-500 text-lg max-w-md">Experience the pinnacle of craftsmanship and innovation with our latest collection of neural-integrated wearables.</p>\n            <button className="bg-black text-white px-10 py-5 rounded-sm font-bold uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3">Shop Collection <ChevronRight className="w-4 h-4" /></button>\n          </motion.div>\n          <motion.div\n            initial={{ opacity: 0, scale: 0.9 }}\n            animate={{ opacity: 1, scale: 1 }}\n            className="relative aspect-square bg-zinc-200 overflow-hidden rounded-sm"\n          >\n            <img src={products[0].image} className="w-full h-full object-cover grayscale" alt="Product" />\n          </motion.div>\n        </div>\n      </section>\n    </div>\n  );\n}`
      }
    ];
  }

  return [
    {
      name: "src/app/page.tsx",
      language: "typescript",
      content: `"use client";\n\nexport default function GeneratedApp() {\n  return (\n    <div className="min-h-screen flex items-center justify-center bg-black text-white">\n      <div className="text-center space-y-6">\n        <h1 className="text-5xl font-bold tracking-tighter uppercase">Project Initialized</h1>\n        <p className="text-zinc-500 max-w-sm">Generated project for: ${prompt}</p>\n        <div className="flex justify-center gap-4">\n           <div className="px-4 py-2 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em]">${framework.toUpperCase()}</div>\n           <div className="px-4 py-2 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em]">STABLE v1.0</div>\n        </div>\n      </div>\n    </div>\n  );\n}`
    }
  ];
}
