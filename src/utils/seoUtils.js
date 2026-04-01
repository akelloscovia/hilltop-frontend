// SEO utilities
export const setSEOTags = (title, description, keywords = '', canonicalUrl = '') => {
  // Set title
  document.title = `${title} | Hilltop Junior School`;

  // Meta description
  let descTag = document.querySelector('meta[name="description"]');
  if (!descTag) {
    descTag = document.createElement('meta');
    descTag.setAttribute('name', 'description');
    document.head.appendChild(descTag);
  }
  descTag.setAttribute('content', description);

  // Meta keywords
  if (keywords) {
    let keywordsTag = document.querySelector('meta[name="keywords"]');
    if (!keywordsTag) {
      keywordsTag = document.createElement('meta');
      keywordsTag.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsTag);
    }
    keywordsTag.setAttribute('content', keywords);
  }

  // Canonical URL
  if (canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }

  // Open Graph tags for social sharing
  const ogTags = {
    'og:title': title,
    'og:description': description,
    'og:type': 'website',
    'og:site_name': 'Hilltop Junior School'
  };

  Object.entries(ogTags).forEach(([property, content]) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  });
};

export const schemaData = {
  school: {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    'name': 'Hilltop Junior School',
    'url': 'http://localhost:3000',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Kasangati',
      'addressLocality': 'Kasangati',
      'addressRegion': 'Wakiso',
      'postalCode': '',
      'addressCountry': 'UG'
    },
    'telephoneNumber': '+256 771 234 567'
  }
};
