# Deployment Guide

This guide covers multiple deployment options for the Me-API Playground application.

## Table of Contents

1. [Render (Recommended)](#render-recommended)
2. [Heroku](#heroku)
3. [Railway](#railway)
4. [Fly.io](#flyio)
5. [Docker](#docker)
6. [Manual Deployment](#manual-deployment)

---

## Render (Recommended)

Render provides the easiest deployment experience with automatic detection of `render.yaml`.

### Prerequisites
- GitHub account
- Render account (free tier available)

### Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy via Render Dashboard**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`
   - Click "Apply" to create the service

3. **Environment Variables** (Optional)
   - `PORT` - Auto-provided by Render
   - `DB_DIALECT` - `sqlite` (default) or `postgres`
   - `DATABASE_URL` - Required if using Postgres
   - `NODE_ENV` - `production` (auto-set)

4. **Access Your Application**
   - Health Check: `https://your-service.onrender.com/health`
   - Frontend: `https://your-service.onrender.com/`
   - API: `https://your-service.onrender.com/api/profile`

### Important Notes
- Free tier: SQLite data resets on each deploy (ephemeral filesystem)
- For persistent data, either:
  - Upgrade to a paid plan with disk storage
  - Switch to Render's managed PostgreSQL database

---

## Heroku

Deploy using the included `Procfile`.

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create me-api-playground
   # Or use a custom name: heroku create your-app-name
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

4. **Seed Database** (First time only)
   ```bash
   heroku run npm run seed
   ```

5. **Open Application**
   ```bash
   heroku open
   ```

### Using PostgreSQL on Heroku

```bash
# Add Postgres addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set DB_DIALECT=postgres
heroku config:set NODE_ENV=production

# Deploy again
git push heroku main
```

---

## Railway

Railway provides a simple deployment with automatic HTTPS and custom domains.

### Steps

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Set Environment Variables** (if needed)
   ```bash
   railway variables set DB_DIALECT=sqlite
   railway variables set NODE_ENV=production
   ```

---

## Fly.io

Fly.io offers edge deployment with global distribution.

### Steps

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   flyctl auth login
   ```

3. **Launch Application**
   ```bash
   flyctl launch
   # Follow prompts to configure
   ```

4. **Deploy**
   ```bash
   flyctl deploy
   ```

### Persistent Storage on Fly.io

```bash
# Create a volume
flyctl volumes create data --size 1

# Update fly.toml to mount the volume
[mounts]
  source = "data"
  destination = "/app/data"
```

---

## Docker

Deploy using Docker and Docker Compose.

### Create Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p data && npm run seed

EXPOSE 3000

CMD ["npm", "start"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_DIALECT=sqlite
      - DB_STORAGE=/app/data/database.sqlite
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Manual Deployment

Deploy to any VPS or cloud provider.

### Prerequisites
- Linux server (Ubuntu/Debian recommended)
- Node.js 18+ installed
- nginx (optional, for reverse proxy)

### Steps

1. **Connect to Server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js** (if not installed)
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/PitakaLaxmiVenkataNagaSatya/Me-API-Playground.git
   cd Me-API-Playground
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Seed Database**
   ```bash
   npm run seed
   ```

6. **Start with PM2** (recommended for production)
   ```bash
   # Install PM2
   sudo npm install -g pm2

   # Start application
   pm2 start index.js --name me-api

   # Save PM2 configuration
   pm2 save

   # Setup PM2 to start on boot
   pm2 startup
   ```

7. **Configure nginx** (optional)
   
   Create `/etc/nginx/sites-available/me-api`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
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
   sudo ln -s /etc/nginx/sites-available/me-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment | development | No |
| `DB_DIALECT` | Database type | sqlite | No |
| `DB_STORAGE` | SQLite file path | ./data/database.sqlite | No |
| `DB_NAME` | Database name (MySQL/Postgres) | - | If using MySQL/Postgres |
| `DB_USER` | Database user (MySQL/Postgres) | - | If using MySQL/Postgres |
| `DB_PASSWORD` | Database password (MySQL/Postgres) | - | If using MySQL/Postgres |
| `DB_HOST` | Database host (MySQL/Postgres) | localhost | If using MySQL/Postgres |
| `DB_PORT` | Database port (MySQL/Postgres) | 3306/5432 | If using MySQL/Postgres |
| `DATABASE_URL` | PostgreSQL connection string | - | If using Postgres |
| `DB_SSL` | Enable SSL for Postgres | false | No |

---

## Troubleshooting

### SQLite Database Not Persisting
- **Issue**: Data resets on every deploy
- **Solution**: Use persistent storage or switch to Postgres/MySQL

### Port Already in Use
- **Issue**: Error: listen EADDRINUSE
- **Solution**: Change PORT environment variable or stop other services

### Database Connection Failed
- **Issue**: Cannot connect to database
- **Solution**: Check DATABASE_URL and credentials

### Native Module Errors (sqlite3)
- **Issue**: sqlite3 binary not found
- **Solution**: Run `npm rebuild sqlite3`

---

## Post-Deployment Checklist

- [ ] Health endpoint returns 200 OK
- [ ] API endpoints respond correctly
- [ ] Frontend loads and displays data
- [ ] Environment variables are set correctly
- [ ] SSL/HTTPS is configured (for production)
- [ ] Monitoring/logging is enabled
- [ ] Backups are configured (if using persistent database)
- [ ] Custom domain configured (optional)

---

## Monitoring and Maintenance

### Check Application Status
```bash
# Render
Check dashboard at https://dashboard.render.com

# Heroku
heroku ps
heroku logs --tail

# PM2
pm2 status
pm2 logs me-api

# Docker
docker-compose ps
docker-compose logs -f
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart application
# (depends on your deployment method)
```

---

## Support

For issues or questions:
- Check the [main README](../README.md)
- Review the [schema documentation](./schema.md)
- Open an issue on GitHub
