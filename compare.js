const fs = require('fs');
const FILE_A = './words-letter-97-clone.json';
const FILE_B = './words-letter-97.json';

const data1 = JSON.parse(fs.readFileSync(FILE_A).toString());
const data2 = JSON.parse(fs.readFileSync(FILE_B).toString());

const words1 = new Set();
data1.forEach(word => words1.add(word.text));
const words2 = new Set();
data2.forEach(word => words2.add(word.text));

if (words1.size === words2.size) {
    console.log(`Same vocabulary size of ${words1.size}`);
}

for (const word of words1) {
    if (!words2.has(word)) {
        console.log(`${word} is not present in ${FILE_B}`);
    }
}

for (const word of words2) {
    if (!words1.has(word)) {
        console.log(`${word} is not present in ${FILE_A}`);
    }
}
