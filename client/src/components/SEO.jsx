

export default function SEO({ title, description, keywords, url, type = 'website', schema, noindex = false }) {
    const DOMAIN = 'https://firdws.com';
    const SITE_NAME = 'فردوس';

    const siteTitle = title
        ? `${title} `
        : 'فردوس | القرآن الكريم والسنة النبوية - اقرأ واستمع وتدبر';

    const siteDescription = description
        || 'فردوس - منصة إسلامية شاملة لقراءة القرآن الكريم والاستماع لأكثر من 100 قارئ، تصفح الأحاديث النبوية من الكتب الستة، مكتبة كتب إسلامية، إذاعات قرآنية مباشرة، ومدونة إسلامية.';

    const siteUrl = url ? `${DOMAIN}${url}` : DOMAIN;
    const imageUrl = `${DOMAIN}/logo.png`;

    // Default schema if none provided
    const defaultSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_NAME,
        "alternateName": "Firdaws",
        "url": DOMAIN,
        "description": siteDescription,
        "inLanguage": "ar",
        "publisher": {
            "@type": "Organization",
            "name": SITE_NAME,
            "url": DOMAIN,
            "logo": {
                "@type": "ImageObject",
                "url": imageUrl
            }
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": `${DOMAIN}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
        }
    };

    const jsonLd = schema
        ? { "@context": "https://schema.org", ...schema }
        : defaultSchema;

    return (
        <>
            {/* Primary Meta */}
            <title>{siteTitle}</title>
            <meta name="description" content={siteDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="author" content={SITE_NAME} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Canonical */}
            <link rel="canonical" href={siteUrl} />

            {/* Language / Direction */}
            <meta httpEquiv="content-language" content="ar" />

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={siteDescription} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={`${SITE_NAME} - القرآن الكريم`} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="ar_AR" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={siteUrl} />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={siteDescription} />
            <meta name="twitter:image" content={imageUrl} />

            {/* Schema.org JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>
        </>
    );
}
