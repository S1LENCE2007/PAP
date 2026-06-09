const { JSDOM } = require('jsdom');
const dom = new JSDOM('<html lang="en"><body><div id="root"></div></body></html>', { runScripts: 'dangerously', url: 'https://s1lence2007.github.io/PAP/' });
dom.window.onerror = function(msg, url, lineNo, columnNo, error) { console.error('Browser Error:', msg, error); };
const fs = require('fs');
const script = dom.window.document.createElement('script');
script.textContent = fs.readFileSync('dist/assets/index-Hnq07ilz.js', 'utf8');
dom.window.document.body.appendChild(script);
