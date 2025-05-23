import { consumeQueue, sendToQueue } from './services/messaging.js';
import { v4 as uuidv4 } from 'uuid';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { load } from 'cheerio';
import 'dotenv/config';

console.log('[Crawler]: Started..');

consumeQueue('crawl_jobs', async (message) => {
  const url = message.url.toString();
  console.log('[Crawler]: Received message:', url);

  const id = uuidv4();
  const folderName = `site-${id}`;
  const outputDir = path.join(process.env.WEBSITES_PATH || './websites', folderName);

  try {
    await crawlSite(url, outputDir);

    console.log(`[Crawler]:✅ Site downloaded to ${outputDir}`);
    await sendToQueue('crawl_results', {
      status: 'success',
      url,
      folderName,
    });
  } catch (err) {
    console.error('[Crawler]: ❌ Crawl failed:', err);
    await sendToQueue('crawl_results', {
      status: 'error',
      url,
      error: err.message,
    });
  }
});

async function crawlSite(startUrl, outputDir) {
  const visited = new Set();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();

  await fs.mkdir(outputDir, { recursive: true });

  async function crawl(url, depth = 0) {
    if (visited.has(url) || depth > 2) return;
    visited.add(url);

    console.log(`[Crawler]: Crawling: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const html = await page.content();

      // Sauvegarde la page
      const safeName = urlToFilename(url);
      const filePath = path.join(outputDir, safeName);
      await fs.writeFile(filePath, html, 'utf-8');

      // Analyse les liens
      const $ = load(html);
      const links = $('a[href]')
        .map((_, el) => $(el).attr('href'))
        .get()
        .filter(href => href && (href.startsWith('/') || href.startsWith(startUrl))) // Liens internes
        .map(href => (href.startsWith('/') ? new URL(href, startUrl).href : href));

      for (const link of links) {
        await crawl(link, depth + 1);
      }
    } catch (e) {
      console.warn(`[Crawler]: ⚠️ Failed to crawl ${url}: ${e.message}`);
    }
  }

  await crawl(startUrl);

  await browser.close();
}

function urlToFilename(url) {
  const { hostname, pathname } = new URL(url);
  let file = pathname.replace(/[^a-zA-Z0-9]/g, '_');
  if (!file || file === '_') file = 'index';
  return `${hostname}_${file}.html`;
}
