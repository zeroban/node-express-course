const { readFileSync, writeFileSync } = require('fs');
console.log('start');

// will read from the elevated folder content
const first = readFileSync('../content/first.txt', 'utf-8');
const second = readFileSync('../content/second.txt', 'utf-8');

console.log(first, second);

// first write file
writeFileSync(
    '../content/result-sync.txt',
    `Here is the result : ${first}, ${second}`,
    { flag: 'a' }
)

// second write file
writeFileSync(
    '../content/result-sync.txt',
    `Here is the result : ${second}`,
    { flag: 'a' }
)