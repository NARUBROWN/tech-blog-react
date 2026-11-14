import { toPostDateTime } from '../src/utils/postDate.js';

export const SITE_NAME = 'NARUBROWN의 기술 블로그';
export const DEFAULT_SITE_ORIGIN = 'https://www.na2ru2.me';

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const stripHtml = (value) => {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const truncate = (value, maxLength) => {
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
};

export const toAbsoluteUrl = (url, siteOrigin) => {
  if (!url) return '';
  try {
    const parsed = new URL(url, siteOrigin);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
};

export const buildMetaTags = (meta) => {
  const tags = [];
  const ogType = meta.ogType || 'article';

  const pushMeta = (attr, key, value) => {
    if (!value) return;
    tags.push(`<meta ${attr}="${escapeHtml(key)}" content="${escapeHtml(value)}" />`);
  };

  pushMeta('name', 'description', meta.description);
  pushMeta('name', 'keywords', meta.keywords);
  pushMeta('name', 'author', meta.author);
  pushMeta('name', 'robots', 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1');
  pushMeta('property', 'og:title', meta.fullTitle);
  pushMeta('property', 'og:description', meta.description);
  pushMeta('property', 'og:type', ogType);
  pushMeta('property', 'og:site_name', SITE_NAME);
  pushMeta('property', 'og:url', meta.shareUrl);
  pushMeta('property', 'og:image', meta.ogImage);
  pushMeta('property', 'og:image:type', meta.ogImageType);
  pushMeta('property', 'og:image:width', meta.ogImageWidth);
  pushMeta('property', 'og:image:height', meta.ogImageHeight);
  pushMeta('property', 'og:image:alt', meta.ogImageAlt);
  pushMeta('property', 'og:locale', 'ko_KR');
  pushMeta('property', 'article:published_time', meta.publishedAt);
  pushMeta('property', 'article:section', meta.section);
  pushMeta('name', 'twitter:card', 'summary_large_image');
  pushMeta('name', 'twitter:title', meta.fullTitle);
  pushMeta('name', 'twitter:description', meta.description);
  pushMeta('name', 'twitter:image', meta.ogImage);
  pushMeta('name', 'twitter:image:alt', meta.ogImageAlt);

  if (meta.canonicalUrl) {
    tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`);
  }

  return tags;
};

export const injectMetaTags = (template, title, metaTags, structuredData) => {
  const headTag = '<head>';
  if (!template.includes(headTag)) {
    throw new Error('Missing <head> tag in template.');
  }

  const indent = '  ';
  const metaBlock = metaTags.map(tag => `${indent}${tag}`).join('\n');
  const structuredBlock = structuredData
    ? `${indent}<script type="application/ld+json">${structuredData}</script>`
    : '';

  const injection = [headTag, metaBlock, structuredBlock]
    .filter(Boolean)
    .join('\n');

  let html = template.replace(headTag, injection);
  html = html.replace(/<title>.*?<\/title>/s, `${indent}<title>${escapeHtml(title)}</title>`);
  return html;
};

const buildStructuredData = (meta) => {
  const payload = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": meta.title,
    "name": meta.title,
    "description": meta.description,
    "inLanguage": "ko-KR",
    "url": meta.canonicalUrl,
    "mainEntityOfPage": meta.canonicalUrl,
    "datePublished": meta.publishedAt,
    "dateModified": meta.updatedAt || meta.publishedAt,
    "image": meta.ogImage ? [meta.ogImage] : undefined,
    "author": meta.author ? {
      "@type": "Person",
      "name": meta.author,
      "url": meta.canonicalUrl
    } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": meta.fallbackOgImage
      }
    },
    "keywords": meta.keywords || undefined,
    "articleSection": meta.section || undefined
  };

  return JSON.stringify(payload).replace(/</g, '\\u003c');
};

export const renderHomeSharePage = (template, siteOrigin = DEFAULT_SITE_ORIGIN) => {
    const homeUrl = toAbsoluteUrl('/', siteOrigin);
    const meta = {
      fullTitle: SITE_NAME,
      description: '세상의 문제를 인공지능으로 해결하는 엔지니어입니다. 직접 만들고 개선하며 얻은 경험을 나눕니다.',
      keywords: '김원정, NARUBROWN, 기술 블로그, AI, 백엔드, 포트폴리오',
      author: '김원정 (NARUBROWN)',
      shareUrl: homeUrl,
      canonicalUrl: homeUrl,
      ogImage: toAbsoluteUrl('/og/home-logo-v1.png', siteOrigin),
      ogImageType: 'image/png',
      ogImageWidth: 1730,
      ogImageHeight: 909,
      ogImageAlt: 'NARUBROWN 기술 블로그 · na2ru2.me',
      ogType: 'website'
    };

    return injectMetaTags(template, SITE_NAME, buildMetaTags(meta), null);
};

export const renderPostSharePage = (template, post, siteOrigin = DEFAULT_SITE_ORIGIN) => {
    const fallbackOgImage = toAbsoluteUrl('/logo.png', siteOrigin);
    const title = post.seoTitle?.trim() || post.title?.trim() || SITE_NAME;
    const fullTitle = `${title} | ${SITE_NAME}`;
    const descriptionSource = post.seoDescription?.trim() || stripHtml(post.content || '');
    const description = truncate(descriptionSource || SITE_NAME, 160);
    const keywords = (post.seoKeywords || post.tags?.tagNames?.join(', ') || '').trim();
    const author = post.author?.username || '';
    const shareUrl = toAbsoluteUrl(`/post/share/${post.id}`, siteOrigin);
    const ogImage = toAbsoluteUrl(post.thumbnailUrl, siteOrigin) || fallbackOgImage;
    const section = post.category?.name || '';

    const meta = {
      title,
      fullTitle,
      description,
      keywords,
      author,
      shareUrl,
      canonicalUrl: shareUrl,
      ogImage,
      fallbackOgImage,
      publishedAt: toPostDateTime(post.publishedAt),
      updatedAt: toPostDateTime(post.updatedAt),
      section
    };

    const metaTags = buildMetaTags(meta);
    const structuredData = buildStructuredData(meta);
    return injectMetaTags(template, fullTitle, metaTags, structuredData);
};
