import { site } from "@/config/site";

/** Dados estruturados de estúdio de tatuagem (schema.org TattooParlor). */
export function StructuredData() {
  const { artist, meta } = site;
  const url: string | null = site.url;
  const address: string | null = artist.address;
  const whatsapp: string | null = artist.whatsapp;
  const data = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: artist.brand,
    description: meta.description,
    ...(url ? { url, image: `${url}/opengraph-image` } : {}),
    ...(whatsapp ? { telephone: `+${whatsapp}` } : {}),
    address: {
      "@type": "PostalAddress",
      ...(address ? { streetAddress: address } : {}),
      addressLocality: artist.city,
      addressRegion: artist.state,
      addressCountry: "BR",
    },
    sameAs: [artist.instagram.url],
    employee: {
      "@type": "Person",
      name: artist.name,
      jobTitle: "Tatuador",
      knowsAbout: ["Realismo", "Black & gray"],
      sameAs: [artist.instagram.url],
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
