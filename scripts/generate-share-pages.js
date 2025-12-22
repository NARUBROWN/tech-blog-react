import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const SITE_NAME = 'NARUBROWN의 기술 블로그';
const DEFAULT_SITE_ORIGIN = 'https://na2ru2.me';
const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_MAX_PAGES = 200;
const RECAP_YEAR = '2025';
const DEFAULT_RECAP_SHARE_PATH = `/recap/share/${RECAP_YEAR}`;
const DEFAULT_RECAP_CANONICAL_PATH = '/?recap=true';
const DEFAULT_RECAP_TITLE = '김원정의 2025년 Recap을 확인하세요';
const DEFAULT_RECAP_DESCRIPTION = '올해의 여정을 확인해보세요.';
const DEFAULT_RECAP_KEYWORDS = '2025 recap, 김원정, 연말 결산, 백엔드 엔지니어, 기술 블로그';

const shouldSkip = () => {
  const value = String(process.env.SKIP_SHARE_PAGES || '').toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
};

const isStrict = () => {
  const value = String(process.env.STRICT_SHARE_PAGES || '').toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
};

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

const slugify = (text) => {
  return String(text || '')
    .toString()
    .trim()
    .replace(/\s+/g, '-');
};

const toAbsoluteUrl = (url, siteOrigin) => {
  if (!url) return '';
  try {
    return new URL(url, siteOrigin).toString();
  } catch {
    return '';
  }
};

const buildMetaTags = (meta) => {
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
  pushMeta('property', 'og:locale', 'ko_KR');
  pushMeta('property', 'article:published_time', meta.publishedAt);
  pushMeta('property', 'article:section', meta.section);
  pushMeta('name', 'twitter:card', 'summary_large_image');
  pushMeta('name', 'twitter:title', meta.fullTitle);
  pushMeta('name', 'twitter:description', meta.description);
  pushMeta('name', 'twitter:image', meta.ogImage);

  if (meta.canonicalUrl) {
    tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`);
  }

  return tags;
};

const injectMetaTags = (template, title, metaTags, structuredData) => {
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

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return response.json();
};

const fetchAllPosts = async (apiOrigin, pageSize, maxPages) => {
  const posts = [];
  let page = 0;

  while (page < maxPages) {
    const listUrl = new URL('/api/v1/post', apiOrigin);
    listUrl.searchParams.set('page', String(page));
    listUrl.searchParams.set('size', String(pageSize));
    const data = await fetchJson(listUrl.toString());
    const content = Array.isArray(data?.content) ? data.content : [];
    if (!content.length) break;
    posts.push(...content);

    if (typeof data?.totalPages === 'number') {
      if (page >= data.totalPages - 1) break;
    } else if (content.length < pageSize) {
      break;
    }

    page += 1;
  }

  return posts;
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

  return JSON.stringify(payload, (_, value) => value === undefined ? undefined : value);
};

const generateRecapSharePage = async ({ template, distDir, siteOrigin, fallbackOgImage }) => {
  const recapTitle = process.env.RECAP_SHARE_TITLE || DEFAULT_RECAP_TITLE;
  const recapDescription = process.env.RECAP_SHARE_DESCRIPTION || DEFAULT_RECAP_DESCRIPTION;
  const recapKeywords = process.env.RECAP_SHARE_KEYWORDS || DEFAULT_RECAP_KEYWORDS;
  const recapSharePath = process.env.RECAP_SHARE_PATH || DEFAULT_RECAP_SHARE_PATH;
  const recapCanonicalPath = process.env.RECAP_CANONICAL_PATH || DEFAULT_RECAP_CANONICAL_PATH;
  const shareUrl = toAbsoluteUrl(recapSharePath, siteOrigin);
  const canonicalUrl = toAbsoluteUrl(recapCanonicalPath, siteOrigin);
  const ogImage = toAbsoluteUrl('/logo.png', siteOrigin) || fallbackOgImage;

  const meta = {
    title: recapTitle,
    fullTitle: recapTitle,
    description: recapDescription,
    keywords: recapKeywords,
    author: '김원정 (NARUBROWN)',
    shareUrl,
    canonicalUrl,
    ogImage,
    fallbackOgImage,
    ogType: 'website'
  };

  const metaTags = buildMetaTags(meta);
  const html = injectMetaTags(template, recapTitle, metaTags, null);

  const sharePath = recapSharePath.replace(/^\/+/, '');
  const outputDir = path.join(distDir, ...sharePath.split('/'));
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8');
};

const main = async () => {
  if (shouldSkip()) {
    console.log('Skipping share page generation (SKIP_SHARE_PAGES enabled).');
    return;
  }

  const projectRoot = process.cwd();
  const distDir = path.join(projectRoot, 'dist');
  const indexPath = path.join(distDir, 'index.html');

  const template = await fs.readFile(indexPath, 'utf8').catch(() => null);
  if (!template) {
    throw new Error('dist/index.html not found. Run the Vite build first.');
  }

  const siteOrigin = process.env.SITE_ORIGIN || DEFAULT_SITE_ORIGIN;
  const apiOrigin = process.env.API_ORIGIN || siteOrigin;
  const pageSize = Number.parseInt(process.env.SHARE_PAGE_SIZE || String(DEFAULT_PAGE_SIZE), 10);
  const maxPages = Number.parseInt(process.env.SHARE_MAX_PAGES || String(DEFAULT_MAX_PAGES), 10);
  const fallbackOgImage = toAbsoluteUrl('/logo.png', siteOrigin);

  await generateRecapSharePage({ template, distDir, siteOrigin, fallbackOgImage });

  let posts = [];
  try {
    posts = await fetchAllPosts(apiOrigin, pageSize, maxPages);
  } catch (error) {
    if (isStrict()) {
      throw error;
    }
    console.warn('Failed to fetch posts for share pages:', error.message);
    return;
  }

  if (!posts.length) {
    const message = 'No posts found for share page generation.';
    if (isStrict()) {
      throw new Error(message);
    }
    console.warn(message);
    return;
  }

  const shareRoot = path.join(distDir, 'post', 'share');
  await fs.mkdir(shareRoot, { recursive: true });

  await Promise.all(posts.map(async (post) => {
    if (!post?.id) return;

    const title = (post.seoTitle || post.title || SITE_NAME).trim();
    const fullTitle = `${title} | ${SITE_NAME}`;
    const descriptionSource = post.seoDescription || stripHtml(post.content || '');
    const description = truncate(descriptionSource || SITE_NAME, 160);
    const keywords = (post.seoKeywords || post.tags?.tagNames?.join(', ') || '').trim();
    const author = post.author?.username || '';
    const shareUrl = `${siteOrigin}/post/share/${post.id}`;
    const slug = post.slug || slugify(post.title) || post.id;
    const canonicalUrl = toAbsoluteUrl(`/post/${slug}`, siteOrigin);
    const ogImage = toAbsoluteUrl(post.thumbnailUrl, siteOrigin) || fallbackOgImage;
    const section = post.category?.name || '';

    const meta = {
      title,
      fullTitle,
      description,
      keywords,
      author,
      shareUrl,
      canonicalUrl,
      ogImage,
      fallbackOgImage,
      publishedAt: post.publishedAt || '',
      updatedAt: post.updatedAt || '',
      section
    };

    const metaTags = buildMetaTags(meta);
    const structuredData = buildStructuredData(meta);
    const html = injectMetaTags(template, fullTitle, metaTags, structuredData);

    const outputDir = path.join(shareRoot, String(post.id));
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8');
  }));

  console.log(`Generated share pages for ${posts.length} posts.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
