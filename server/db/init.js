const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../db');
const FILES = {
    'users.json': '[]',
    'deployments.json': '[]',
    'chats.json': '[]',
    'withdrawals.json': '[]',
    'plans.json': JSON.stringify([
        { "id": "free", "name": "Free Trial", "price": 0, "credits": 0, "description": "3-hour trial, 1 deployment" },
        { "id": "starter", "name": "Starter", "price": 199, "credits": 20, "description": "20 credits, basic support" },
        { "id": "pro", "name": "Pro", "price": 499, "credits": 60, "description": "60 credits, priority support" },
        { "id": "enterprise", "name": "Enterprise", "price": 999, "credits": 150, "description": "150 credits, dedicated support, custom domain" }
    ], null, 2)
};

module.exports = () => {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

    Object.entries(FILES).forEach(([file, content]) => {
        const filePath = path.join(DB_DIR, file);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, content);
            console.log(`Initialized database file: ${file}`);
        }
    });
};
