import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const AI_DIR = process.env.TASTEHUB_AI_DIR
  ? path.resolve(process.env.TASTEHUB_AI_DIR)
  : path.resolve(process.cwd(), '../TasteHubAI');

const FEATURES_FILE = path.join(AI_DIR, 'tastehub_features.json');
const PREDICT_SCRIPT = path.join(AI_DIR, 'predict.py');
const PYTHON_BIN = process.env.PYTHON_BIN || 'python3';

const DEFAULT_FEATURES = [
  'platform',
  'format',
  'goal',
  'campaign',
  'tone',
  'cta_type',
  'hashtags_count',
  'post_hour',
  'day_of_week',
  'caption_length',
  'creative_score',
  'posts_last_7_days',
  'follower_count',
] as const;

export interface ModelFeatures {
  platform: string;
  format: string;
  goal: string;
  campaign: string;
  tone: string;
  cta_type: string;
  hashtags_count: number;
  post_hour: number;
  day_of_week: string;
  caption_length: number;
  creative_score: number;
  posts_last_7_days: number;
  follower_count: number;
}

export interface PredictionResult {
  prediction: number;
  rate: number;
  percent: number;
  provider: 'python-model' | 'heuristic-fallback';
  modelVersion: string;
  warning?: string;
  features: ModelFeatures;
}

let cachedFeatureOrder: string[] | null = null;

async function getFeatureOrder() {
  if (cachedFeatureOrder) return cachedFeatureOrder;

  try {
    const raw = await fs.readFile(FEATURES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((f) => typeof f === 'string')) {
      cachedFeatureOrder = parsed;
      return parsed;
    }
  } catch {
    // ignore and use defaults
  }

  cachedFeatureOrder = [...DEFAULT_FEATURES];
  return cachedFeatureOrder;
}

function orderFeatures(featureOrder: string[], features: ModelFeatures) {
  return featureOrder.reduce<Record<string, string | number>>((acc, key) => {
    acc[key] = features[key as keyof ModelFeatures] as string | number;
    return acc;
  }, {});
}

function clamp(num: number, min: number, max: number) {
  return Math.min(max, Math.max(min, num));
}

function normalizePrediction(rawPrediction: number) {
  if (!Number.isFinite(rawPrediction)) return 0;
  if (rawPrediction <= 1) return clamp(rawPrediction, 0, 1);
  if (rawPrediction <= 100) return clamp(rawPrediction / 100, 0, 1);
  return 1;
}

function mapPlatform(platform: string) {
  const normalized = platform.toLowerCase();
  if (normalized === 'instagram') return 'Instagram';
  if (normalized === 'facebook') return 'Facebook';
  return 'Twitter';
}

function inferFormat(platform: string, text: string) {
  const lower = text.toLowerCase();
  if (platform === 'twitter') {
    return lower.includes('thread') || text.length > 220 ? 'thread' : 'tweet';
  }
  if (platform === 'facebook') {
    return lower.includes('video') || lower.includes('live') ? 'fb_post' : 'fb_post';
  }
  if (lower.includes('reel') || lower.includes('video')) return 'reel';
  if (lower.includes('carousel')) return 'carousel';
  if (lower.includes('story')) return 'story';
  return 'single_image';
}

function inferGoal(text: string) {
  const lower = text.toLowerCase();
  if (/(sale|discount|offer|buy|order|shop)/.test(lower)) return 'sales';
  if (/(follow|follower|subscribe)/.test(lower)) return 'followers';
  if (/(reach|awareness|discover|exposure)/.test(lower)) return 'reach';
  return 'engagement';
}

function inferCampaign(text: string) {
  const lower = text.toLowerCase();
  if (/(valentine|love)/.test(lower)) return 'Valentine';
  if (/(festival|holiday|christmas|diwali|new year)/.test(lower)) return 'Festival';
  if (/(healthy|fitness|diet|wellness)/.test(lower)) return 'HealthyWeek';
  if (/(weekend|saturday|sunday)/.test(lower)) return 'WeekendOffer';
  return 'NewMenu';
}

function inferTone(text: string) {
  const lower = text.toLowerCase();
  if (/(lol|meme|funny|joke|haha)/.test(lower)) return 'funny';
  if (/(save|order|limited|offer|discount|deal)/.test(lower)) return 'promo';
  if (/(learn|tips|guide|how to|steps)/.test(lower)) return 'informative';
  return 'emotional';
}

function inferCtaType(text: string) {
  const lower = text.toLowerCase();
  if (/(order now|buy now|shop now|checkout)/.test(lower)) return 'order_now';
  if (/(link in bio|click link|tap link|visit link)/.test(lower)) return 'link_click';
  if (/(comment|tell us|drop|reply)/.test(lower)) return 'comment';
  if (/(share|retweet)/.test(lower)) return 'share';
  if (/(save this|bookmark)/.test(lower)) return 'save';
  if (/(dm us|message us|inbox)/.test(lower)) return 'dm';
  return 'none';
}

function shortWeekday(isoDate: string) {
  const dt = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return 'Mon';
  return dt.toLocaleDateString('en-US', { weekday: 'short' });
}

function countHashtags(text: string) {
  const matches = text.match(/#[a-z0-9_]+/gi);
  return matches?.length ?? 0;
}

function defaultHourForPlatform(platform: string) {
  if (platform === 'instagram') return 19;
  if (platform === 'facebook') return 13;
  return 12;
}

function heuristicPrediction(features: ModelFeatures) {
  const base = (() => {
    if (features.platform === 'Instagram') return 0.046;
    if (features.platform === 'Facebook') return 0.039;
    return 0.042;
  })();

  const hashtagBoost = clamp(features.hashtags_count, 0, 12) * 0.0007;
  const creativeBoost = (clamp(features.creative_score, 0, 10) - 5) * 0.0018;
  const cadencePenalty = Math.max(0, features.posts_last_7_days - 10) * 0.0007;
  const captionBoost = clamp(features.caption_length, 20, 280) / 280 * 0.003;
  const followerBoost = clamp(Math.log10(features.follower_count + 10) - 3, 0, 3) * 0.003;

  const raw = base + hashtagBoost + creativeBoost + captionBoost + followerBoost - cadencePenalty;
  return clamp(raw, 0.01, 0.18);
}

async function runPythonProcess(payload: string) {
  return await new Promise<Record<string, unknown>>((resolve, reject) => {
    const proc = spawn(PYTHON_BIN, [PREDICT_SCRIPT], { cwd: AI_DIR });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error('Model inference timed out after 20 seconds.'));
    }, 20_000);

    proc.stdout.on('data', (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    proc.stderr.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(stderr.trim() || `predict.py exited with code ${code}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout);
        if (typeof parsed === 'object' && parsed !== null) {
          resolve(parsed as Record<string, unknown>);
          return;
        }
        reject(new Error('Model output must be a JSON object.'));
      } catch (error) {
        reject(
          new Error(
            `Failed to parse model output. ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    });

    proc.stdin.write(payload);
    proc.stdin.end();
  });
}

async function runPythonPrediction(features: ModelFeatures) {
  const result = await runPythonProcess(JSON.stringify(features));
  const prediction = Number(result.prediction);
  if (!Number.isFinite(prediction)) {
    throw new Error('Model output is missing a numeric prediction.');
  }
  return { prediction };
}

async function runPythonPredictionBatch(features: ModelFeatures[]) {
  const result = await runPythonProcess(JSON.stringify(features));
  const rawPredictions = result.predictions;
  if (!Array.isArray(rawPredictions)) {
    throw new Error('Model output is missing predictions array.');
  }

  const predictions = rawPredictions.map((value) => Number(value));
  if (predictions.some((value) => !Number.isFinite(value))) {
    throw new Error('Model output contains non-numeric predictions.');
  }

  return { predictions };
}

export function buildModelFeaturesFromPost(input: {
  platform: string;
  date: string;
  title: string;
  description: string;
  postsLast7Days: number;
  followerCount?: number;
  creativeScore?: number;
  postHour?: number;
}) {
  const combinedText = `${input.title} ${input.description}`.trim();

  const features: ModelFeatures = {
    platform: mapPlatform(input.platform),
    format: inferFormat(input.platform, combinedText),
    goal: inferGoal(combinedText),
    campaign: inferCampaign(combinedText),
    tone: inferTone(combinedText),
    cta_type: inferCtaType(combinedText),
    hashtags_count: countHashtags(input.description),
    post_hour: clamp(Math.round(input.postHour ?? defaultHourForPlatform(input.platform)), 0, 23),
    day_of_week: shortWeekday(input.date),
    caption_length: input.description.length,
    creative_score: clamp(input.creativeScore ?? 6.5, 0, 10),
    posts_last_7_days: Math.max(0, Math.round(input.postsLast7Days)),
    follower_count: Math.max(0, Math.round(input.followerCount ?? 5000)),
  };

  return features;
}

export async function predictEngagementRate(features: ModelFeatures): Promise<PredictionResult> {
  const featureOrder = await getFeatureOrder();
  const orderedFeatures = orderFeatures(featureOrder, features);

  const castFeatures = orderedFeatures as unknown as ModelFeatures;

  try {
    const result = await runPythonPrediction(castFeatures);
    const rate = normalizePrediction(result.prediction);

    return {
      prediction: result.prediction,
      rate,
      percent: Number((rate * 100).toFixed(2)),
      provider: 'python-model',
      modelVersion: 'tastehub-engagement-rate-v1',
      features: castFeatures,
    };
  } catch (error) {
    const fallback = heuristicPrediction(castFeatures);
    return {
      prediction: fallback,
      rate: fallback,
      percent: Number((fallback * 100).toFixed(2)),
      provider: 'heuristic-fallback',
      modelVersion: 'heuristic-fallback-v1',
      warning: error instanceof Error ? error.message : 'Unknown model execution error',
      features: castFeatures,
    };
  }
}

export async function predictEngagementRateBatch(
  featuresList: ModelFeatures[]
): Promise<PredictionResult[]> {
  if (featuresList.length === 0) return [];

  const featureOrder = await getFeatureOrder();
  const orderedList = featuresList.map((features) =>
    orderFeatures(featureOrder, features) as unknown as ModelFeatures
  );

  try {
    const result = await runPythonPredictionBatch(orderedList);
    return orderedList.map((features, index) => {
      const rawPrediction = result.predictions[index];
      const rate = normalizePrediction(rawPrediction);

      return {
        prediction: rawPrediction,
        rate,
        percent: Number((rate * 100).toFixed(2)),
        provider: 'python-model' as const,
        modelVersion: 'tastehub-engagement-rate-v1',
        features,
      };
    });
  } catch (error) {
    const warning =
      error instanceof Error ? error.message : 'Unknown model execution error';

    return orderedList.map((features) => {
      const fallback = heuristicPrediction(features);
      return {
        prediction: fallback,
        rate: fallback,
        percent: Number((fallback * 100).toFixed(2)),
        provider: 'heuristic-fallback' as const,
        modelVersion: 'heuristic-fallback-v1',
        warning,
        features,
      };
    });
  }
}
