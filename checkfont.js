const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.fisglobal.com/insights/risk-management', { waitUntil: 'domcontentloaded' });

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

    const complianceFont = "Roobert";

    // Find all non-compliant elements and extract direct links
    const fontDetails = await page.evaluate((complianceFont) => {
        function getElementXPath(el) {
            if (!el) return "";
            if (el.id) return `//*[@id="${el.id}"]`; // Use ID if available

            const parts = [];
            while (el && el.nodeType === Node.ELEMENT_NODE) {
                let index = 1;
                let sibling = el.previousElementSibling;
                while (sibling) {
                    if (sibling.tagName === el.tagName) index++;
                    sibling = sibling.previousElementSibling;
                }
                parts.unshift(`${el.tagName.toLowerCase()}[${index}]`);
                el = el.parentElement;
            }
            return `/${parts.join("/")}`;
        }

        const elements = document.querySelectorAll('*');
        const nonCompliance = [];

        elements.forEach((el) => {
            const style = window.getComputedStyle(el);
            const fontFamily = style.fontFamily;
            const textContent = el.innerText?.trim() || "[No Visible Text]"; // Handle undefined text
            const xPath = getElementXPath(el);

            // Check if font is non-compliant and element has visible text
            if (!fontFamily.includes(complianceFont) && textContent !== "[No Visible Text]") {
                let directLink = null;

                // Extract direct link if element is an anchor <a>
                if (el.tagName.toLowerCase() === "a" && el.href) {
                    directLink = el.href;
                } else {
                    // Otherwise, provide a JavaScript-based XPath link
                    directLink = `javascript:document.evaluate('${xPath}', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.scrollIntoView();`;
                }

                nonCompliance.push({ textContent, tagName: el.tagName.toLowerCase(), directLink });
            }
        });

        return nonCompliance;
    }, complianceFont);

    if (fontDetails.length === 0) {
        console.log("✅ No non-compliant fonts found.");
    } else {
        console.log(`⚠️ Found ${fontDetails.length} non-compliant elements. Here are the links:\n`);

        for (let i = 0; i < fontDetails.length; i++) {
            const { textContent, tagName, directLink } = fontDetails[i];
            console.log(`${i + 1}. <${tagName}> "${textContent}"\n   🔗 Link: ${directLink}\n`);
        }
    }

    await browser.close();
})();
