"use server";

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
- Generate testing files.`;

export async function generateCode(prompt: string, framework: string) {
  // In a real implementation, this would call an AI API with SYSTEM_PROMPT
  console.log(`[AI Persona Active] Generating elite code for: ${prompt}`);

  // Simulate complex generation delay
  await new Promise(resolve => setTimeout(resolve, 3500));

  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("ecommerce") || lowerPrompt.includes("shop")) {
    return [
      {
        name: "src/app/page.tsx",
        language: "typescript",
        content: `"use client";\nimport { useState } from "react";\nimport { ShoppingCart, Search, User, Menu, ChevronRight, Star } from "lucide-react";\nimport { motion } from "framer-motion";\n\nconst products = [\n  { id: 1, name: "Elite Watch", price: 299, rating: 4.8, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30" },\n  { id: 2, name: "Neural Headset", price: 199, rating: 4.9, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" },\n  { id: 3, name: "Zen Camera", price: 899, rating: 4.7, image: "https://images.unsplash.com/photo-1526170315873-3a5616be83c3" },\n];\n\nexport default function Storefront() {\n  return (\n    <div className="min-h-screen bg-white text-black font-sans">\n      {/* Navigation */}\n      <nav className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">\n        <div className="text-xl font-bold tracking-tighter uppercase">EliteStore</div>\n        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-500">\n          <a href="#" className="text-black">New Arrivals</a>\n          <a href="#" className="hover:text-black">Collection</a>\n          <a href="#" className="hover:text-black">About</a>\n        </div>\n        <div className="flex items-center gap-5">\n          <Search className="w-5 h-5 cursor-pointer" />\n          <div className="relative cursor-pointer">\n            <ShoppingCart className="w-5 h-5" />\n            <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">0</span>\n          </div>\n        </div>\n      </nav>\n\n      {/* Hero Section */}\n      <section className="px-6 py-20 bg-zinc-50">\n        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">\n          <motion.div\n            initial={{ opacity: 0, x: -20 }}\n            animate={{ opacity: 1, x: 0 }}\n            className="space-y-8"\n          >\n            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Summer Collection 2025</span>\n            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">DESIGNED <br/>FOR ELITES.</h1>\n            <p className="text-zinc-500 text-lg max-w-md">Experience the pinnacle of craftsmanship and innovation with our latest collection of neural-integrated wearables.</p>\n            <button className="bg-black text-white px-10 py-5 rounded-sm font-bold uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3">Shop Collection <ChevronRight className="w-4 h-4" /></button>\n          </motion.div>\n          <motion.div\n            initial={{ opacity: 0, scale: 0.9 }}\n            animate={{ opacity: 1, scale: 1 }}\n            className="relative aspect-square bg-zinc-200 overflow-hidden rounded-sm"\n          >\n            <img src={products[0].image} className="w-full h-full object-cover grayscale" alt="Product" />\n          </motion.div>\n        </div>\n      </section>\n    </div>\n  );\n}`
      },
      {
        name: "src/components/ui/product-card.tsx",
        language: "typescript",
        content: `import { Star, ShoppingCart } from "lucide-react";\n\nexport function ProductCard({ product }: { product: any }) {\n  return (\n    <div className="group space-y-4 cursor-pointer">\n      <div className="aspect-[3/4] bg-zinc-100 overflow-hidden relative rounded-sm">\n        <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />\n        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-all" />\n        <button className="absolute bottom-4 left-4 right-4 bg-white text-black py-3 text-xs font-bold uppercase tracking-widest translate-y-10 group-hover:translate-y-0 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">\n          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart\n        </button>\n      </div>\n      <div className="flex justify-between items-start">\n        <div>\n          <h3 className="font-bold text-sm">{product.name}</h3>\n          <div className="flex items-center gap-1 mt-1">\n            <Star className="w-3 h-3 fill-black" />\n            <span className="text-[10px] font-bold">{product.rating}</span>\n          </div>\n        </div>\n        <span className="font-bold text-sm">₹{product.price}</span>\n      </div>\n    </div>\n  );\n}`
      },
      {
        name: "src/lib/cart-store.ts",
        language: "typescript",
        content: `import { create } from 'zustand';\n\ninterface CartState {\n  items: any[];\n  addItem: (item: any) => void;\n  removeItem: (id: number) => void;\n  clearCart: () => void;\n}\n\nexport const useCartStore = create<CartState>((set) => ({\n  items: [],\n  addItem: (item) => set((state) => ({ items: [...state.items, item] })),\n  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),\n  clearCart: () => set({ items: [] }),\n}));`
      },
      {
        name: "package.json",
        language: "json",
        content: `{\n  "name": "elite-ecommerce",\n  "version": "1.0.0",\n  "dependencies": {\n    "next": "15.1.0",\n    "react": "19.0.0",\n    "lucide-react": "latest",\n    "framer-motion": "latest",\n    "zustand": "latest"\n  }\n}`
      }
    ];
  }

  if (lowerPrompt.includes("portfolio")) {
    return [
      {
        name: "src/app/page.tsx",
        language: "typescript",
        content: `"use client";\nimport { motion } from "framer-motion";\nimport { Github, Twitter, Linkedin, Mail, ExternalLink, Code2, Server, Smartphone } from "lucide-react";\n\nconst projects = [\n  { title: "ZynoCloud", desc: "Enterprise cloud hosting platform", tech: ["Next.js", "Go", "Docker"] },\n  { title: "EliteChat", desc: "Real-time encrypted messaging system", tech: ["React", "Node.js", "Redis"] },\n];\n\nexport default function Portfolio() {\n  return (\n    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">\n      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">\n        <div className="text-xl font-bold tracking-tighter">ALEX.DEV</div>\n        <div className="flex gap-6">\n           <Github className="w-5 h-5 hover:text-zinc-400 cursor-pointer" />\n           <Twitter className="w-5 h-5 hover:text-zinc-400 cursor-pointer" />\n        </div>\n      </nav>\n\n      <main className="max-w-7xl mx-auto px-8 py-20">\n        <motion.div\n          initial={{ opacity: 0, y: 20 }}\n          animate={{ opacity: 1, y: 0 }}\n          className="space-y-6"\n        >\n          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.8] mb-12">FULLSTACK <br/> ARCHITECT.</h1>\n          <p className="text-zinc-500 text-xl max-w-2xl leading-relaxed">I build high-performance distributed systems and immersive digital interfaces. Currently architecting at EliteHosting.</p>\n        </motion.div>\n\n        <section className="mt-40 grid grid-cols-1 md:grid-cols-2 gap-12">\n          {projects.map((p, idx) => (\n            <div key={idx} className="group border-t border-zinc-800 pt-8 space-y-4">\n               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">0{idx + 1} / Project</span>\n               <div className="flex justify-between items-center">\n                 <h2 className="text-4xl font-bold tracking-tight">{p.title}</h2>\n                 <ExternalLink className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />\n               </div>\n               <p className="text-zinc-500">{p.desc}</p>\n               <div className="flex gap-2">\n                 {p.tech.map(t => <span key={t} className="px-3 py-1 bg-zinc-900 text-[10px] font-bold uppercase tracking-widest border border-zinc-800">{t}</span>)}\n               </div>\n            </div>\n          ))}\n        </section>\n      </main>\n    </div>\n  );\n}`
      },
      {
        name: "tailwind.config.js",
        language: "javascript",
        content: `module.exports = {\n  content: ["./src/**/*.{js,ts,jsx,tsx}"],\n  theme: {\n    extend: {\n      fontFamily: {\n        sans: ["Inter", "sans-serif"],\n      },\n    },\n  },\n  plugins: [],\n};`
      }
    ];
  }

  return [
    {
      name: "src/app/page.tsx",
      language: "typescript",
      content: `"use client";\n\nexport default function GeneratedApp() {\n  return (\n    <div className="min-h-screen flex items-center justify-center bg-black text-white">\n      <div className="text-center space-y-6">\n        <h1 className="text-5xl font-bold tracking-tighter uppercase">Project Initialized</h1>\n        <p className="text-zinc-500 max-w-sm">Generated project for: ${prompt}</p>\n        <div className="flex justify-center gap-4">\n           <div className="px-4 py-2 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em]">${framework.toUpperCase()}</div>\n           <div className="px-4 py-2 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em]">STABLE v1.0</div>\n        </div>\n      </div>\n    </div>\n  );\n}`
    },
    {
      name: "next.config.js",
      language: "javascript",
      content: `/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  reactStrictMode: true,\n};\n\nmodule.exports = nextConfig;`
    }
  ];
}

export async function diagnoseCode(code: string) {
  // Simulate AI code diagnosis
  await new Promise(resolve => setTimeout(resolve, 1500));

  const issues = [];
  if (!code.includes("import")) {
    issues.push("Missing imports for external dependencies.");
  }
  if (code.includes("any")) {
    issues.push("Type 'any' used. Consider using specific types for better safety.");
  }
  if (issues.length === 0) {
    return { status: "clean", message: "No critical errors detected. Code is elite." };
  }
  return { status: "issues", message: "Found potential issues:", details: issues };
}
