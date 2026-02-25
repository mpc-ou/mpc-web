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
    alternateName: ["MPC", "Mobile Programming Club", "Câu lạc bộ Lập trình trên Thiết bị Di động"],
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description: SITE_DESCRIPTION_VI,
    foundingDate: "2017",
    parentOrganization: {
      "@type": "EducationalOrganization",
      name: "Trường Đại học Mở TP.HCM",
      alternateName: "HCMOU",
      url: "https://ou.edu.vn"
    },
    sameAs: ["https://www.facebook.com/mpc.ou"]
  };

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type='application/ld+json'
    />
  );
}

/**
 * JSON-LD WebSite structured data with SearchAction.
 * Helps Google display a sitelinks search box.
 */
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
};

/**
 * JSON-LD Event structured data for event detail pages.
 * @see https://schema.org/Event
 */
export function EventJsonLd({ name, description, startDate, endDate, location, image, url }: EventJsonLdProps) {
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

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type='application/ld+json'
    />
  );
}
