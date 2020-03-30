const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./result.json'));

const style = `
body {
  font-family: sans-serif;
  padding-top: 1em;
  padding-bottom: 1em;
  width: 80%;
  margin: 0 auto;
}
input, textarea, button, p, div, section, article, select {
  display: 'block';
  width: 100%;
  font-family: sans-serif;
  font-size: 1em;
  margin: 0.5em;
}
h1{
  font-size: 1.5rem;
  margin: 0;
}
.headline {
  background: aliceblue;
  border-radius: 1rem;
  padding: 1em;
  max-width: -webkit-fill-available;
}
.e {
  background: #eee;
  padding: 1rem;
  border-radius: 1rem;
}
`;


const make = ({ origin, result }) => `
<div class="e">
<div class="headline">
  <a href="${origin.href}">
    <h1>${result.title}</h1>
    <span class="orig_link">${origin.text}</span>
  </a>
</div>
<div class="top">
  <div>
  ${result.sponsors.top}
  </div>
</div>
<div class="bottom">
  ${result.sponsors.bottom}
</div>
</div>
`;


const content = (() => {
  debugger;
  const tpls = data
    .sort((a, b) => {
      const len = (x) => typeof x === 'object' ? Object.values(x.sponsors).reduce((acc, cv) => {
        if (cv) {
          return cv.length > acc ? cv.length : acc;
        }
        return acc;
      }, 0) : 0;
      return len(b.result) - len(a.result);
    })
    .map(el => make(el));
  return tpls.join('\n');
})();
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report @ ${new Date().toJSON()}</title>
  <style>
    ${style}
  </style>
</head>
<body>
  ${content} 
</body>
</html>
`;
fs.writeFileSync('./docs/index.html', html);
console.log("\n\n\n\t\t Generation Done...\n\n\n");