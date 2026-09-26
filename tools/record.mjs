// Sunumu kare kare render edip MP4 videoya çevirir.
//
// Kullanım:
//   npm install
//   npm run record                         # 1920x1080, 30 fps -> video/sifir-tiklama.mp4
//   node tools/record.mjs --fps 60 --width 3840 --height 2160 --out video/4k.mp4
//   node tools/record.mjs --from 27 --to 41   # yalnızca bir bölüm
//
// Gerekenler: Playwright (Chromium) ve PATH'te ffmpeg (ya da FFMPEG ortam değişkeni).
// Zaman çizelgesi deterministik olduğundan her kare birebir aynı üretilir;
// makinenin hızı videonun akıcılığını etkilemez, yalnızca süreyi uzatır.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1]]);
    return acc;
  }, [])
);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fps = +(args.fps || 30);
const width = +(args.width || 1920);
const height = +(args.height || 1080);
const out = resolve(root, args.out || 'video/sifir-tiklama.mp4');
const ffmpeg = process.env.FFMPEG || 'ffmpeg';

mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, ignoreHTTPSErrors: true });
page.on('pageerror', e => console.error('Sayfa hatası:', e.message));
await page.goto(pathToFileURL(resolve(root, 'index.html')).href + '?capture', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__demo);
await page.evaluate(() => document.fonts.ready);

const total = await page.evaluate(() => window.__demo.total);
const from = +(args.from || 0);
const to = Math.min(total, +(args.to || total));
const frames = Math.round((to - from) * fps);

const enc = spawn(ffmpeg, [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  out,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const encDone = new Promise((res, rej) => enc.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg çıkış kodu ' + c)))));

const started = Date.now();
for (let f = 0; f < frames; f++) {
  await page.evaluate(x => window.__demo.renderAt(x), from + f / fps);
  const jpg = await page.screenshot({ type: 'jpeg', quality: 95 });
  if (!enc.stdin.write(jpg)) await new Promise(r => enc.stdin.once('drain', r));
  if (f % fps === 0 || f === frames - 1) {
    const done = (f + 1) / frames, el = (Date.now() - started) / 1000;
    process.stdout.write(`\r${(done * 100).toFixed(1)}%  kare ${f + 1}/${frames}  kalan ~${Math.round(el / done - el)} sn   `);
  }
}
enc.stdin.end();
await encDone;
await browser.close();
console.log('\nHazır:', out);
