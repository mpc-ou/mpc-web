import { ABOUT_CLUB } from "@/configs/data/about";
import { MPC_FOUNDED_YEAR } from "@/constants/hero";
import { SITE_DESCRIPTION_VI, SITE_NAME, SITE_URL } from "@/constants/seo";

/**
 * JSON-LD Organization structured data.
 * Place this in the homepage to help Google identify the club as an entity.
 * @see https://schema.org/Organization
 */
export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: [
      "MPC",
      "MPClub",
      "CLB MPC",
      "Mobile Programming Club",
      "Câu lạc bộ Lập trình trên Thiết bị Di động",
      "CLB Lập trình trên thiết bị di động"
    ],
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description: SITE_DESCRIPTION_VI,
    foundingDate: String(MPC_FOUNDED_YEAR),
    email: ABOUT_CLUB.contact.email,
    parentOrganization: {
      "@type": "EducationalOrganization",
      name: "Trường Đại học Mở TP.HCM",
      alternateName: "HCMOU",
      url: "https://ou.edu.vn"
    },
    sameAs: [ABOUT_CLUB.contact.facebook, ABOUT_CLUB.contact.github, ABOUT_CLUB.contact.linkedin]
  };

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type='application/ld+json'
    />
  );
}

export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ["vi", "en"]
  };

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type='application/ld+json'
    />
  );
}

type EventJsonLdProps = {
  name: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  image?: string | null;
  url: string;
  isAccessibleForFree?: boolean;
};

export function EventJsonLd({
  name,
  description,
  startDate,
  endDate,
  location,
  image,
  url,
  isAccessibleForFree
}: EventJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description: description.slice(0, 300),
    startDate,
    url,
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL
    }
  };

  if (endDate) {
    jsonLd.endDate = endDate;
  }
  if (location) {
    jsonLd.location = {
      "@type": "Place",
      name: location
    };
  }
  if (image) {
    jsonLd.image = image;
  }
  if (isAccessibleForFree !== undefined) {
    jsonLd.isAccessibleForFree = isAccessibleForFree;
  }

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type='application/ld+json'
    />
  );
}

export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type='application/ld+json'
    />
  );
}

type ArticleJsonLdProps = {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName?: string | null;
  authorUrl?: string | null;
  keywords?: string[];
};

export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  keywords
}: ArticleJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description.slice(0, 300),
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`
      }
    }
  };

  if (image) {
    jsonLd.image = [image];
  }
  if (datePublished) {
    jsonLd.datePublished = datePublished;
  }
  if (dateModified || datePublished) {
    jsonLd.dateModified = dateModified || datePublished;
  }
  if (authorName) {
    jsonLd.author = {
      "@type": "Person",
      name: authorName,
      ...(authorUrl ? { url: authorUrl } : {})
    };
  } else {
    jsonLd.author = {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL
    };
  }
  if (keywords && keywords.length > 0) {
    jsonLd.keywords = keywords.join(", ");
  }

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type='application/ld+json'
    />
  );
}

type PersonJsonLdProps = {
  name: string;
  description: string;
  url: string;
  image?: string | null;
  sameAs?: string[];
};

export function PersonJsonLd({ name, description, url, image, sameAs }: PersonJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description,
    url,
    memberOf: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL
    }
  };

  if (image) {
    jsonLd.image = image;
  }
  if (sameAs && sameAs.length > 0) {
    jsonLd.sameAs = sameAs;
  }

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type='application/ld+json'
    />
  );
}

type SoftwareSourceCodeJsonLdProps = {
  name: string;
  description: string;
  url: string;
  image?: string | null;
  codeRepository?: string | null;
  programmingLanguages?: string[];
  dateCreated?: string | null;
};

export function SoftwareSourceCodeJsonLd({
  name,
  description,
  url,
  image,
  codeRepository,
  programmingLanguages,
  dateCreated
}: SoftwareSourceCodeJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name,
    description: description.slice(0, 300),
    url,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL
    }
  };

  if (image) {
    jsonLd.image = image;
  }
  if (codeRepository) {
    jsonLd.codeRepository = codeRepository;
  }
  if (programmingLanguages && programmingLanguages.length > 0) {
    jsonLd.programmingLanguage = programmingLanguages;
  }
  if (dateCreated) {
    jsonLd.dateCreated = dateCreated;
  }

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type='application/ld+json'
    />
  );
}
