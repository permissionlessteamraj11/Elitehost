import React from 'react';

export function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EliteHosting",
    "url": "https://www.elitehosting.in",
    "logo": "https://www.elitehosting.in/logo.png",
    "sameAs": [
      "https://twitter.com/elitehosting",
      "https://github.com/elitehosting-in"
    ],
    "description": "Premium Cloud Deployment Platform specializing in Mumbai-based Edge hosting for Telegram bots and web applications."
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://www.elitehosting.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.elitehosting.in/blog?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "EliteHosting Cloud Platform",
    "operatingSystem": "Web",
    "applicationCategory": "DeveloperApplication",
    "offers": {
      "@type": "Offer",
      "price": "99.00",
      "priceCurrency": "INR"
    }
  };

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
      },
      {
        "@type": "Question",
        "name": "Can I host Python and Node.js bots on EliteHost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, EliteHost provides native support for both Python (python-telegram-bot, Aiogram) and Node.js (Telegraf, Grammy) with automated dependency installation and environment configuration."
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
        "url": "https://www.elitehosting.in/auth/register"
      },
      {
        "@type": "HowToStep",
        "text": "Connect your GitHub repository or upload a ZIP file of your code.",
        "url": "https://www.elitehosting.in/dashboard/new"
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
      "cssSelector": [".aeo-answer", "h1", "h2", "h3"]
    },
    "url": "https://www.elitehosting.in"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
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
    </>
  );
}
