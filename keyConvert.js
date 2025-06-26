const fs = require('fs');
const key = fs.readFileSync('./dine-manager-firebase-adminsdk.json', 'utf8');
const base64 = Buffer.from(key).toString('base64');