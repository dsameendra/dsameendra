const fs = require('fs');
const https = require('https');

const quoteApi = 'https://programming-quotes-api.azurewebsites.net/api/quotes/random';
const readmePath = 'README.md';

function fetchQuote() {
  return new Promise((resolve, reject) => {
    https.get(quoteApi, (res) => {
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
  <span style="color:#CB0200;">— ${author}</span>
</p>`;

  const newReadme = readme.replace(
    new RegExp(`${startTag}[\\s\\S]*?${endTag}`),
    `${startTag}\n${quoteBlock}\n${endTag}`
  );

  fs.writeFileSync(readmePath, newReadme);
}

(async () => {
  try {
    const { en: quote, author } = await fetchQuote();
    updateReadme(quote, author);
    console.log('✅ README updated with new quote.');
  } catch (err) {
    console.error('❌ Failed to update README:', err);
    process.exit(1);
  }
})();