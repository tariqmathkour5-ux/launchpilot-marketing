import type { Tool, Category } from "../../../drizzle/schema";

export function generateToolSchema(tool: Tool, category: Category | undefined) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.website,
    applicationCategory: category?.name || "Productivity",
    aggregateRating: tool.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: parseFloat(tool.rating.toString()),
          ratingCount: tool.reviewCount,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      price: tool.pricingModel === "free" ? "0" : "Contact for pricing",
      priceCurrency: "USD",
    },
    image: tool.logo || undefined,
    keywords: tool.tags?.join(", ") || "",
    featureList: tool.features || [],
  };
}

export function generateCategorySchema(
  category: Category,
  toolCount: number,
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description || `${category.name} - AI Tools Collection`,
    url: `${baseUrl}/category/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      name: category.name,
      numberOfItems: toolCount,
      url: `${baseUrl}/category/${category.slug}`,
    },
  };
}

export function generateSearchPageSchema(
  query: string | undefined,
  baseUrl: string,
  resultCount: number
) {
  const searchName = query ? `Search results for ${query}` : "AI Tools Search";
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: searchName,
    url: `${baseUrl}/database/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
    mainEntity: {
      "@type": "ItemList",
      name: searchName,
      numberOfItems: resultCount,
    },
  };
}

export function generateOrganizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LaunchPilot AI",
    description: "Comprehensive guide to AI tools and services",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      "https://twitter.com/launchpilotai",
      "https://linkedin.com/company/launchpilotai",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@launchpilot.ai",
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function injectSchema(schema: any) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
  return () => document.head.removeChild(script);
}
