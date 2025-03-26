const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Set headless to false for debugging
    const page = await browser.newPage();
    
    console.log("🌐 Opening website...");
    await page.goto('https://www.fisglobal.com/insights/risk-management', { waitUntil: 'load' });

    console.log("🔄 Scrolling page...");
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 500;
            const scrollInterval = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(scrollInterval);
                    resolve();
                }
            }, 300);
        });
    });

    console.log("✅ Page fully scrolled!");

    const complianceFont = "Roobert"; // Change this to your compliance font
    const fontDetails = await page.evaluate((complianceFont) => {
        const elements = document.querySelectorAll('*');
        const nonComplianceSet = new Set();

        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            const fontFamily = style.fontFamily;
            const fontSize = style.fontSize;
            const fontWeight = style.fontWeight;
            const fontStyle = style.fontStyle;
            const color = style.color;
            const text = el.innerText.trim().substring(0, 50); // Capture text sample for reference

            const fontData = JSON.stringify({
                fontFamily,
                fontSize,
                fontWeight,
                fontStyle,
                color,
                text
            });

            if (!fontFamily.includes(complianceFont)) {
                nonComplianceSet.add(fontData);
            }
        });

        return {
            nonComplianceFonts: Array.from(nonComplianceSet).map(f => JSON.parse(f))
        };
    }, complianceFont);

    console.log("❌ Non-Compliant Fonts Found:");
    console.table(fontDetails.nonComplianceFonts);

    fs.writeFileSync('fontDetails.json', JSON.stringify(fontDetails, null, 2));
    console.log("💾 Font details saved to fontDetails.json");

    await browser.close();
})();
