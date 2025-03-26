const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.fisglobal.com/insights/risk-management', { waitUntil: 'load' });

    // Function to scroll the entire page
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 500; // Scroll step
            const scrollInterval = setInterval(() => {
                const { scrollHeight, scrollTop } = document.documentElement;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight || scrollTop + window.innerHeight >= scrollHeight) {
                    clearInterval(scrollInterval);
                    resolve();
                }
            }, 300);
        });
    });

    console.log("Page fully scrolled!");

    const complianceFont = "Roobert"; // Includes all variants like Regular, Bold, etc.
    const fontDetails = await page.evaluate((complianceFont) => {
        const elements = document.querySelectorAll('*');
        const complianceSet = new Set();
        const nonComplianceSet = new Set();

        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            const fontFamily = style.fontFamily;
            const fontSize = style.fontSize;
            const fontWeight = style.fontWeight;
            const fontStyle = style.fontStyle;
            const color = style.color;

            const fontData = JSON.stringify({
                fontFamily,
                fontSize,
                fontWeight,
                fontStyle,
                color
            });

            if (fontFamily.includes(complianceFont)) { // Matches any Roobert variant
                complianceSet.add(fontData);
            } else {
                nonComplianceSet.add(fontData);
            }
        });

        return {
            complianceFonts: Array.from(complianceSet).map(f => JSON.parse(f)),
            nonComplianceFonts: Array.from(nonComplianceSet).map(f => JSON.parse(f))
        };
    }, complianceFont);

    console.log("Font Compliance Details:", fontDetails);

    fs.writeFileSync('fontDetails.json', JSON.stringify(fontDetails, null, 2));
    console.log("Font compliance details saved to fontDetails.json");

    await browser.close();
})();
