import { blogPosts } from "@/lib/blog-data";
import { Metadata } from "next";
import BlogContent from "./BlogContent";

export const metadata: Metadata = {
  title: "Elite Insights — The EliteHosting Blog",
  description: "Technical guides, product updates, and industry insights for developers. Learn about Mumbai edge nodes, Telegram bot hosting, and cloud performance.",
  keywords: ["cloud hosting blog", "telegram bot tutorial", "mumbai edge nodes", "deployment guides", "EliteHosting news"],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: "Elite Insights — The EliteHosting Blog",
    description: "Deep dives into cloud infrastructure and Telegram bot optimization.",
    url: "https://www.elitehosting.in/blog",
    siteName: "EliteHosting",
    type: "website",
  }
};

export default function BlogPage() {
  return <BlogContent blogPosts={blogPosts} />;
}
