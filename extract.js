const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const match = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (match) {
    fs.writeFileSync('extracted.jsx', match[1]);
    console.log('Saved to extracted.jsx');
} else {
    console.log('No script found');
}
