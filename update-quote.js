// This script fetches a random programming quote and updates the README.md file with it.

const fs = require('fs');
const http = require('http');

const quoteApi = 'http://api.quotable.io/random';
const readmePath = 'README.md';

function fetchQuote() {
  return new Promise((resolve, reject) => {
    http.get(quoteApi, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function updateReadme(quote, author) {
  const readme = fs.readFileSync(readmePath, 'utf-8');

  const startTag = '<!--QUOTE-START-->';
  const endTag = '<!--QUOTE-END-->';
  const quoteBlock = `
<p align="center" style="font-style: italic;">
  <i>“${quote}”</i><br/>
  — ${author}
</p>`;

  const updated = readme.replace(
    new RegExp(`${startTag}[\\s\\S]*?${endTag}`),
    `${startTag}\n${quoteBlock}\n${endTag}`
  );

  fs.writeFileSync(readmePath, updated);
  console.log('README updated with new quote.');
}

(async () => {
  try {
    const { en: quote, author } = await fetchQuote();
    updateReadme(quote, author);
  } catch (err) {
    console.error('Failed to update README:', err);
    process.exit(1);
  }
})();