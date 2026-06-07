# EliteHosting VPS Deployment Guide

This guide covers the deployment of the EliteHosting Next.js application and the OTP Authentication Service on an Ubuntu VPS.

## 1. Prerequisites
- Ubuntu 22.04+ VPS
- Node.js 22+ & pnpm
- PostgreSQL 14+
- Nginx
- Domain with SSL (Certbot)

## 2. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js & pnpm
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pnpm pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 3. Database Configuration
```bash
sudo -u postgres psql
# In psql:
CREATE DATABASE elitehosting;
CREATE USER eliteadmin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE elitehosting TO eliteadmin;
\q
```
Apply the migrations found in `supabase/migrations/` to your PostgreSQL instance.

## 4. Deploying Next.js App
```bash
cd /var/www/elite-hosting
pnpm install
# Configure .env with your PostgreSQL and Supabase details
pnpm build
pm2 start npm --name "elite-frontend" -- start
```

## 5. Deploying OTP Auth Service
```bash
cd /var/www/elite-hosting/otp-auth-service
pnpm install
# Configure .env (DATABASE_URL, RESEND_API_KEY, etc.)
pm2 start src/app.js --name "elite-otp-service"
```

## 6. Nginx Reverse Proxy
Create `/etc/nginx/sites-available/elitehosting`:
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/auth {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/elitehosting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. SSL Setup
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

## 8. Production Best Practices
- **Security:** Use `ufw` to block all ports except 80, 443, and 22.
- **Backups:** Schedule daily PostgreSQL backups using `pg_dump`.
- **Monitoring:** Use `pm2 monit` and external services like UptimeRobot.
- **Rate Limiting:** Nginx or `@upstash/ratelimit` (configured in app) should be used to prevent DDoS.
- **Secrets:** Never commit `.env` files. Use a secrets manager if possible.
