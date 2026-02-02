// Quick script to decode the myPOS configuration pack
// Run with: node decode-config.js

const fs = require('fs');
const path = require('path');

// Read the downloaded .txt file
const configFile = path.join(__dirname, 'mypos-config.txt'); // Adjust filename if needed

try {
    const base64Config = fs.readFileSync(configFile, 'utf8').trim();
    const decoded = Buffer.from(base64Config, 'base64').toString('utf8');

    console.log('=== Decoded Configuration Pack ===\n');
    console.log(decoded);
    console.log('\n=== End ===');

    // Try to parse as JSON
    try {
        const json = JSON.parse(decoded);
        console.log('\n=== Parsed as JSON ===\n');
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.log('\n(Not valid JSON - might be XML or plain text)');
    }
} catch (error) {
    console.error('Error reading file:', error.message);
    console.log('\nUsage:');
    console.log('1. Save your downloaded configuration pack as "mypos-config.txt" in the project root');
    console.log('2. Run: node decode-config.js');
}
