const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER CONSOLE ERROR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('BROWSER PAGE ERROR:', error.message);
    });

    console.log('Navigating to http://localhost/blog...');
    await page.goto('http://localhost/blog', { waitUntil: 'networkidle0' });
    console.log('Done.');

    await browser.close();
})();
