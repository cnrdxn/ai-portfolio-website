import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? (process.platform === 'darwin' ? 'chrome' : undefined),
    reducedMotion: 'reduce',
  },
});
