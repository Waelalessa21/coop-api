# Sayer Coop API

FastAPI application for managing training submissions.

## Local Development

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Railway Deployment

1. Push your code to GitHub
2. Connect your repository to Railway
3. Railway will automatically detect the `Procfile` and deploy
4. The app will be available at your Railway URL

### Environment Variables
- `PORT` - Automatically set by Railway

### File Structure
- `main.py` - Main FastAPI application
- `api/routes.py` - API routes
- `models/submission.py` - Pydantic models
- `services/submission_service.py` - Business logic
- `data/submissions.json` - JSON data storage
- `uploads/` - File uploads directory

## API Endpoints

- `POST /api/v1/upload` - Upload files
- `POST /api/v1/submissions` - Create submission
- `GET /api/v1/submissions` - Get all submissions
- `GET /api/v1/submissions/{id}` - Get submission by ID

# coop-api
