import { consumeQueue, sendToQueue } from './services/messaging.js';
const fs = await import('fs/promises');
const path = await import('path');
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[Crawler-1] Started..');
consumeQueue('crawl_jobs', async (message) => {
  console.log('[Crawler-1] Received message:', message.url.toString());
  const url = message.url.toString();
  console.log('Worker received:', url);

  const { exec } = await import('child_process');
  const { v4: uuidv4 } = await import('uuid');

  const id = uuidv4();
  const outputDir = path.join('/app/websites', `site-${id}`);
  const folderName = `site-${id}`;

  try {
    await fs.mkdir(outputDir, { recursive: true });
    const cmd = `wget --mirror --convert-links --adjust-extension --page-requisites --no-parent -P '${outputDir}' ${url}`;
    exec(cmd, async (err) => {
      if (err) {
        console.error('Crawl failed:', err);
        await sendToQueue('crawl_results', { 
          status: 'error',
          url: url,
          error: err.message
        });
      } else {
        console.log(`Site downloaded to ${outputDir}`);
        await sendToQueue('crawl_results', {
          status: 'success',
          url: url,
          folderName: folderName
        });
      }
    });
  } catch (err) {
    console.error('Error preparing crawler:', err);
    await sendToQueue('crawl_results', {
      status: 'error',
      url: url,
      error: err.message
    });
  }
});
