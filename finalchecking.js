const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    const url = 'https://www.fisglobal.com/insights/risk-management'; // Update URL if needed

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    console.log("🔍 Scrolling through the page to load all content...\n");

    // Scroll the entire page to load all elements
    let previousHeight = 0;
    while (true) {
        let currentHeight = await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
            return document.documentElement.scrollHeight;
        });

        await page.waitForTimeout(1000); // Small delay for content to load

        if (currentHeight === previousHeight) break; // Stop if no more scrolling is possible
        previousHeight = currentHeight;
    }

    console.log("✅ Finished scrolling. Now checking for non-compliant fonts...\n");

    const complianceFont = "Roobert"; // Change this to your required brand font

    // Find all non-compliant elements and extract tag hierarchy
    const fontDetails = await page.evaluate((complianceFont) => {
        const elements = document.querySelectorAll('*'); // Select all elements
        const nonCompliance = [];

        elements.forEach((el) => {
            const style = window.getComputedStyle(el);
            const fontFamily = style.fontFamily;
            const textContent = el.innerText?.trim() || "[No Visible Text]"; // Handle undefined text

            if (!fontFamily.includes(complianceFont) && textContent !== "[No Visible Text]") {
                // Highlight the non-compliant element in red
                el.style.outline = "3px solid red";
                el.style.backgroundColor = "#ffeeee";

                // Build hierarchy of tags
                let hierarchy = [];
                let parent = el;
                while (parent) {
                    hierarchy.unshift(parent.tagName.toLowerCase());
                    parent = parent.parentElement;
                }

                nonCompliance.push({
                    textContent,
                    tagHierarchy: hierarchy.join(" > "),
                    fontFamily
                });
            }
        });

        return nonCompliance;
    }, complianceFont);

    // Create a directory to store reports
    const reportDir = path.join(__dirname, 'font_report');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

    // Save full report in JSON
    const reportJson = {
        date: new Date().toLocaleString(),
        url: url,
        issuesFound: fontDetails.length,
        details: fontDetails
    };
    fs.writeFileSync(path.join(reportDir, 'report.json'), JSON.stringify(reportJson, null, 4), 'utf8');
    console.log("📄 Report saved as 'font_report/report.json'");

    // Save only non-compliant font information in JSON
    const nonCompliantFontsJson = fontDetails.map(({ textContent, fontFamily }) => ({ textContent, fontFamily }));
    fs.writeFileSync(path.join(reportDir, 'noncompliant_fonts.json'), JSON.stringify(nonCompliantFontsJson, null, 4), 'utf8');
    console.log("📄 Non-compliant fonts saved as 'font_report/noncompliant_fonts.json'");

    await browser.close();
})();
