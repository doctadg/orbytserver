function scrapeDataFromPage() {
  let scrapedData = {};

  if (window.location.hostname.includes('dexscreener.com')) {
    // Scrape data from Dexscreener
    const tokenNameElement = document.querySelector('.token-name'); // Adjust selector as needed
    if (tokenNameElement) {
      scrapedData.tokenName = tokenNameElement.textContent.trim();
    }

    const priceElement = document.querySelector('.price'); // Adjust selector
    if (priceElement) {
      scrapedData.price = priceElement.textContent.trim();
    }
    // Add more scraping logic for Dexscreener as needed...
  } else if (window.location.hostname.includes('birdeye.so')) {
    // Scrape data from Birdeye
    const tokenNameElement = document.querySelector('.token-title'); // Adjust selector
     if (tokenNameElement) {
      scrapedData.tokenName = tokenNameElement.textContent.trim();
    }

    const priceElement = document.querySelector('.token-price'); // Adjust selector
    if (priceElement) {
      scrapedData.price = priceElement.textContent.trim();
    }
    // Add more scraping logic for Birdeye as needed...

  } else {
    scrapedData = "This page is not supported for scraping.";
  }
    return scrapedData;
}
