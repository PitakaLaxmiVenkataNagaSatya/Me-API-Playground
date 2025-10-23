# Deployment Checklist

Use this checklist to ensure your deployment is successful.

## Pre-Deployment

- [ ] Update `seeds/profile.json` with your actual profile data
- [ ] Test the application locally (`npm install`, `npm run seed`, `npm start`)
- [ ] Verify all API endpoints work locally:
  - [ ] `/health` returns 200 OK
  - [ ] `/api/profile` returns your profile
  - [ ] `/api/projects?skill=<skill>` returns projects
  - [ ] `/api/skills/top` returns top skills
  - [ ] `/api/search?q=<query>` returns search results
- [ ] Commit and push all changes to GitHub

## Render Deployment

### Initial Setup
- [ ] Create a Render account at https://render.com
- [ ] Connect your GitHub account to Render
- [ ] Navigate to Render Dashboard

### Deploy
- [ ] Click "New +" → "Blueprint"
- [ ] Select your GitHub repository
- [ ] Render should auto-detect `render.yaml`
- [ ] Review the configuration
- [ ] Click "Apply" to create the service

### Verify
- [ ] Wait for the deployment to complete (check the deployment logs)
- [ ] Open the service URL provided by Render
- [ ] Test the health endpoint: `https://your-service.onrender.com/health`
- [ ] Test the frontend: `https://your-service.onrender.com/`
- [ ] Test the API: `https://your-service.onrender.com/api/profile`

### Notes
- Free tier: SQLite data is ephemeral (reseeds on each deploy)
- For persistent data: upgrade to a paid plan or switch to PostgreSQL

## Heroku Deployment

### Prerequisites
- [ ] Install Heroku CLI
- [ ] Login to Heroku: `heroku login`

### Deploy
- [ ] Create Heroku app: `heroku create [app-name]`
- [ ] Push to Heroku: `git push heroku main`
- [ ] Seed the database: `heroku run npm run seed`

### Verify
- [ ] Open the app: `heroku open`
- [ ] Check logs: `heroku logs --tail`
- [ ] Test all endpoints

### For PostgreSQL on Heroku
- [ ] Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
- [ ] Set environment: `heroku config:set DB_DIALECT=postgres`
- [ ] Deploy again: `git push heroku main`

## Docker Deployment

### Build and Run Locally
- [ ] Build image: `docker build -t me-api-playground .`
- [ ] Run container: `docker run -p 3000:3000 me-api-playground`
- [ ] Test at http://localhost:3000

### Using Docker Compose
- [ ] Run: `docker-compose up -d`
- [ ] View logs: `docker-compose logs -f`
- [ ] Test at http://localhost:3000
- [ ] Stop: `docker-compose down`

## Railway Deployment

- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Initialize: `railway init`
- [ ] Deploy: `railway up`
- [ ] Get URL: `railway open`

## Post-Deployment Verification

### Functional Tests
- [ ] Frontend loads without errors
- [ ] "Load Profile" button works
- [ ] "Search Projects by Skill" works
- [ ] "View Top Skills" works
- [ ] API endpoints return correct data format

### Performance Tests
- [ ] Page loads in under 3 seconds
- [ ] API responses are under 500ms
- [ ] No console errors in browser

### Security Checks
- [ ] HTTPS is enabled (for production deployments)
- [ ] No sensitive data in environment variables
- [ ] CORS is properly configured
- [ ] No API keys or secrets exposed

## Monitoring

### Set Up Monitoring
- [ ] Enable logging on your platform
- [ ] Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Configure error tracking (optional: Sentry, LogRocket)

### Regular Checks
- [ ] Monitor application logs for errors
- [ ] Check response times
- [ ] Verify data integrity
- [ ] Monitor disk/database usage

## Troubleshooting

### Application Won't Start
- Check deployment logs for error messages
- Verify all environment variables are set correctly
- Ensure `PORT` is not hardcoded (use `process.env.PORT`)
- Check if native modules (sqlite3) need rebuilding

### Database Errors
- Verify DB_DIALECT is set correctly
- Check database connection string (for Postgres/MySQL)
- Ensure database is accessible from the application

### API Returning Errors
- Check application logs
- Verify the database is seeded
- Test endpoints with curl or Postman
- Check CORS configuration if accessing from different domain

### Data Not Persisting
- For SQLite: Check if using ephemeral filesystem (Render free tier)
- Consider upgrading to paid plan with persistent disk
- Or switch to PostgreSQL for built-in persistence

## Maintenance

### Regular Updates
- [ ] Pull latest changes: `git pull origin main`
- [ ] Install new dependencies: `npm install`
- [ ] Redeploy application

### Database Backups
- [ ] For PostgreSQL: Set up automated backups on your platform
- [ ] For SQLite: Download database file regularly (if on persistent disk)
- [ ] Test restore procedure

### Security Updates
- [ ] Run `npm audit` regularly
- [ ] Update dependencies: `npm update`
- [ ] Review and fix security vulnerabilities
- [ ] Redeploy after updates

## Getting Help

If you encounter issues:

1. Check the deployment logs
2. Review the [Deployment Guide](DEPLOYMENT.md)
3. Check the [README](../README.md)
4. Search for similar issues on GitHub
5. Open a new issue with:
   - Deployment platform
   - Error messages
   - Steps to reproduce
   - Expected vs actual behavior
