

export default function SEO({ title, description, keywords, url, type = 'website', schema }) {
    const siteTitle = title ? `${title} | فردوس - مجتمع القرآن الكريم` : 'فردوس | القرآن الكريم والسنة النبوية';
    const siteDescription = description || 'القرآن الكريم، استمع واقرأ وتدبر في آيات الله مع مجتمع فردوس، بالإضافة لسنة النبي محمد صلى الله عليه وسلم والأحاديث الصحيحة والمقالات الدينية.';
    const siteUrl = url ? `https://ajr.app${url}` : 'https://ajr.app'; // Replace with actual domain
    const imageUrl = 'https://ajr.app/logo.png';

    return (
        <>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={siteDescription} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Canonical link */}
            <link rel="canonical" href={siteUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={siteDescription} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:site_name" content="فردوس" />
            <meta property="og:locale" content="ar_AR" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={siteUrl} />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={siteDescription} />
            <meta name="twitter:image" content={imageUrl} />

            {/* Schema.org JSON-LD */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </>
    );
}
