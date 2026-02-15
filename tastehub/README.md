# TasteHub - Social Media Calendar + AI Insights

TasteHub is a Next.js app for planning 30-day social content across Instagram, Facebook, and Twitter, with analytics and model-driven engagement insights.

## Project Structure

- `tastehub/` - Next.js frontend + backend API + Prisma
- `TasteHubAI/` - trained model assets and Python inference script

## Local Setup

1. Install app dependencies:

```bash
cd tastehub
npm install
```

2. Install AI model dependencies:

```bash
cd ../TasteHubAI
python3 -m pip install -r requirements.txt
```

3. Run database migrations and seed:

```bash
cd ../tastehub
npm run db:migrate
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

## Environment Variables

Create `tastehub/.env.local`:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_secure_secret
```

Optional (if your AI folder/python binary is custom):

```bash
TASTEHUB_AI_DIR=/absolute/path/to/TasteHubAI
PYTHON_BIN=python3
```

## AI Flow

- Frontend `Analytics` page calls `POST /api/ml-insights` with a selected post.
- Backend derives model features from post metadata and runs `TasteHubAI/predict.py`.
- Prediction and action items are stored in `MLInsight` and shown in the AI Insights panel.
- If Python/model execution fails, backend returns a safe heuristic fallback instead of crashing.
