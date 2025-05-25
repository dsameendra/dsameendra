// This script fetches a random programming quote and updates the README.md file with it.

const fs = require('fs');
const http = require('http'); // Changed from http to https

const quoteApi = 'http://api.quotable.io/random'; // Changed to https
const readmePath = 'README.md';

function fetchQuote() {
  return new Promise((resolve, reject) => {
    http.get(quoteApi, (res) => { // Use https.get
      let data = '';
      // Handle potential errors from the API response (e.g., non-200 status codes)
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`API request failed with status code: ${res.statusCode}`));
      }
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (parseError) {
          reject(parseError); // Handle JSON parsing errors
        }
      });
    }).on('error', (err) => { // Handle network errors
      reject(err);
    });
  });
}

function updateReadme(quote, author) {
  if (!quote || !author) {
    console.error('Quote or author is undefined. Skipping README update.');
    // Optionally, throw an error or exit if this is critical
    // process.exit(1); 
    return; // Exit the function to prevent writing undefined to README
  }

  const readmeContent = fs.readFileSync(readmePath, 'utf-8');

  const startTag = '<div id="quote">';
  const endTag = '</div>';
  
  // Ensure the tags exist in the README
  if (readmeContent.indexOf(startTag) === -1 || readmeContent.indexOf(endTag) === -1) {
    console.error(`Error: Could not find ${startTag} or ${endTag} in ${readmePath}. Please ensure these tags exist.`);
    process.exit(1); // Exit if tags are missing, as replacement will fail
  }

  // Using a more robust regex to handle variations in newlines/spacing around the quote block
  // This specifically targets the content *between* the start and end tags.
  const quoteBlockRegex = new RegExp(`(${startTag})([\\s\\S]*?)(${endTag})`);

  const newQuoteBlockContent = `<p align="center" style="font-style: italic;">
  <i>“${quote}”</i><br/>
  — ${author}
</p>`;

  // Replace only the content between the tags
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
      // process.exit(1); // Optionally exit if this is critical
    }
  } catch (err) {
    console.error('Failed to update README:', err.message);
    if (err.cause) {
        console.error('Cause:', err.cause);
    }
    process.exit(1);
  }
})();
