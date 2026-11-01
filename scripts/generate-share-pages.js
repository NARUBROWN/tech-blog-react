import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { DEFAULT_SITE_ORIGIN, buildMetaTags, injectMetaTags, toAbsoluteUrl } from '../server/share-page.js';

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
  const fallbackOgImage = toAbsoluteUrl('/logo.png', siteOrigin);

  await generateRecapSharePage({ template, distDir, siteOrigin, fallbackOgImage });

  console.log('Generated Recap share page. Post share pages are served by the Vercel function.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
