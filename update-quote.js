// This script fetches a random programming quote and updates the README.md file with it.

const fs = require('fs');
const http = require('http');

const quoteApi = 'http://api.quotable.io/random';
const readmePath = 'README.md';

function fetchQuote() {
  return new Promise((resolve, reject) => {
    http.get(quoteApi, (res) => {
      let data = '';
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`API request failed with status code: ${res.statusCode}`));
      }
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (parseError) {
          reject(parseError); 
        }
      });
    }).on('error', (err) => { 
      reject(err);
    });
  });
}

function updateReadme(quote, author) {
  if (!quote || !author) {
    console.error('Quote or author is undefined. Skipping README update.');
    return; 
  }

  const readmeContent = fs.readFileSync(readmePath, 'utf-8');

  const startTag = '<div id="quote">';
  const endTag = '</div>';
  
  if (readmeContent.indexOf(startTag) === -1 || readmeContent.indexOf(endTag) === -1) {
    console.error(`Error: Could not find ${startTag} or ${endTag} in ${readmePath}. Please ensure these tags exist.`);
    process.exit(1); 
  }

  const quoteBlockRegex = new RegExp(`(${startTag})([\\s\\S]*?)(${endTag})`);

  const newQuoteBlockContent = `<p align="center" style="font-style: italic;">
  <i>“${quote}”</i><br/>
  — ${author}
</p>`;

  const updatedReadme = readmeContent.replace(quoteBlockRegex, `$1\n${newQuoteBlockContent}\n$3`);

  // Only write if the content has actually changed
  if (updatedReadme !== readmeContent) {
    fs.writeFileSync(readmePath, updatedReadme);
    console.log('README updated with new quote.');
  } else {
    console.log('New quote is the same as the old one, or README structure issue. No changes made.');
  }
}

(async () => {
  try {
    console.log('Fetching new quote...');
    const quoteData = await fetchQuote();
    const { content: quote, author } = quoteData; 
    
    if (quote && author) {
      console.log(`Fetched quote: "${quote}" by ${author}`);
      updateReadme(quote, author);
    } else {
      console.error('Failed to fetch valid quote or author from API response.');
      console.error('API Response:', quoteData);
    }
  } catch (err) {
    console.error('Failed to update README:', err.message);
    if (err.cause) {
        console.error('Cause:', err.cause);
    }
    process.exit(1);
  }
})();
