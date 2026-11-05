import { chromium } from 'playwright';

async function captureAdminPages() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 8000 });
  await page.waitForTimeout(1000);

  const pagesToTest = [
    { name: 'trip_requests', url: 'http://localhost:5173/admin/trip-requests' },
    { name: 'bookings', url: 'http://localhost:5173/admin/bookings' },
    { name: 'tours', url: 'http://localhost:5173/admin/tours' },
    { name: 'destinations', url: 'http://localhost:5173/admin/destinations' },
    { name: 'users', url: 'http://localhost:5173/admin/users' },
    { name: 'reviews', url: 'http://localhost:5173/admin/reviews' },
    { name: 'pages', url: 'http://localhost:5173/admin/pages' },
  ];

  for (const p of pagesToTest) {
    try {
      await page.goto(p.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `tests/screenshots/admin_${p.name}.png` });
      console.log(`Captured: ${p.name}`);
    } catch (e) {
      console.error(`Failed ${p.name}:`, e.message);
    }
  }

  await browser.close();
}

captureAdminPages().catch(console.error);

