import { chromium } from 'playwright';

async function testAuth() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const page = await browser.newPage();
  const failedRequests = [];
  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedRequests.push({ url: res.url(), status: res.status() });
    }
  });

  console.log('1. Visiting Home Page as Guest (No token stored)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  console.log('Failed requests on Home Page (Should be 0):', failedRequests);

  console.log('\n2. Logging in with admin credentials...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@wanderersouthindia.com');
  await page.fill('input[type="password"]', 'Admin@12345');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  console.log('Current URL after login (Should be /admin):', page.url());
  console.log('Failed requests during login (Should be 0):', failedRequests.filter(r => !r.url.includes('favicon')));

  await browser.close();
}

testAuth().catch(console.error);
