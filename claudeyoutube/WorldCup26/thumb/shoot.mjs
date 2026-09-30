import { chromium } from 'playwright';
import path from 'node:path';
const b = await chromium.launch({ executablePath:'/opt/google/chrome/chrome', args:['--no-sandbox','--force-color-profile=srgb','--hide-scrollbars'] });
const p = await b.newPage({ viewport:{width:1280,height:720}, deviceScaleFactor:2 });
await p.goto('file://' + path.resolve('thumb/thumb.html'), { waitUntil:'load' });
await p.waitForTimeout(700);
await p.locator('#t').screenshot({ path:'thumb/thumbnail.jpg', type:'jpeg', quality:92 });
await b.close();
console.log('ok');
