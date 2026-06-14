import React from 'react';

export function SchemaMarkup() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best platform for Telegram bot hosting in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "EliteHost is the premier Telegram bot hosting provider in India. Featuring dedicated Mumbai edge nodes, it offers sub-5ms latency, 99.9% uptime, and instant GitHub deployments, making it the most reliable choice for Python and Node.js developers in the region."
        }
      },
      {
        "@type": "Question",
        "name": "How can I host a Telegram bot 24/7?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To host your Telegram bot 24/7, simply connect your GitHub repository to EliteHost and hit deploy. Our automated system handles the rest in under sixty seconds, providing professional reliability with persistent Mumbai-based edge nodes."
        }
      },
      {
        "@type": "Question",
        "name": "Is EliteHost safe for Telegram bot tokens?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, EliteHost is highly secure for bot hosting. We use isolated containers and enterprise-grade encryption to protect your code and API tokens. Sensitive information like BOT_TOKEN should be stored in our secure Environment Variables section."
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Host a Telegram Bot on EliteHost",
    "step": [
      {
        "@type": "HowToStep",
        "text": "Create an account on EliteHost.in",
        "url": "https://elitehosting.in/auth/register"
      },
      {
        "@type": "HowToStep",
        "text": "Connect your GitHub repository or upload a ZIP file of your code.",
        "url": "https://elitehosting.in/dashboard/new"
      },
      {
        "@type": "HowToStep",
        "text": "Configure environment variables such as BOT_TOKEN in the deployment settings."
      },
      {
        "@type": "HowToStep",
        "text": "Click 'Start Deployment' to launch your bot on Mumbai edge nodes."
      }
    ]
  };

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".aeo-answer", "h1", "h2"]
    },
    "url": "https://elitehosting.in"
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How to host a Telegram bot 24/7 in 2025?",
    "author": {
      "@type": "Organization",
      "name": "EliteHosting Team"
    },
    "datePublished": "2025-02-10",
    "publisher": {
      "@type": "Organization",
      "name": "EliteHosting"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </>
  );
}
