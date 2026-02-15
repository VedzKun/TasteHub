import type { Platform } from '@/types';

export interface CalendarRequirements {
  dailyThemes: boolean;
  platformSpecific: boolean;
  analytics: boolean;
}

export interface GeneratedCalendarDraftItem {
  day: number;
  date: string;
  theme: string;
  platform: Platform;
  postIdea: string;
  captionDraft: string;
  cta: string;
  hashtags: string[];
  recommendedTime: string;
  metricFocus: string;
}

interface GenerateCalendarInput {
  companyName: string;
  objective: string;
  platforms: Platform[];
  days: number;
  requirements: CalendarRequirements;
  startDate?: string;
}

const THEME_LIBRARY = [
  'Brand Story',
  'Behind the Scenes',
  'Customer Spotlight',
  'Educational Tip',
  'Product Highlight',
  'Community Question',
  'Quick Tutorial',
  'Myth vs Fact',
  'Social Proof',
  'Founder Message',
  'User Generated Content',
  'Limited Offer',
  'Value Proposition',
  'Mini Case Study',
  'How It Works',
  'Pain Point Solution',
  'Before and After',
  'Team Highlight',
  'Process Breakdown',
  'FAQ Response',
  'Trend Reaction',
  'Weekly Recap',
  'Upcoming Launch',
  'Checklist Post',
  'Poll Day',
  'Comparison Post',
  'Testimonial Highlight',
  'Expert Insight',
  'Seasonal Angle',
  'Call to Action Push',
];

const PLATFORM_TIMES: Record<Platform, string[]> = {
  instagram: ['11:00', '19:00', '20:00'],
  facebook: ['10:00', '13:00', '18:00'],
  twitter: ['09:00', '12:00', '17:00'],
};

const PLATFORM_IDEAS: Record<Platform, string[]> = {
  instagram: [
    'Create a visual-first post with one strong hook line.',
    'Publish a Reel-style concept with quick, actionable tips.',
    'Share a carousel concept with a step-by-step breakdown.',
  ],
  facebook: [
    'Write a story-led post that ends with a direct question.',
    'Share a value post with a practical example from your audience.',
    'Publish a community conversation starter and ask for opinions.',
  ],
  twitter: [
    'Post a short opinion with a clear, bold first sentence.',
    'Draft a mini thread that breaks one concept into 3 short points.',
    'Share a concise insight with one focused CTA.',
  ],
};

const CTA_BY_GOAL: Record<string, string[]> = {
  sales: ['Order now', 'Get the offer', 'Shop today'],
  followers: ['Follow for more', 'Join our community', 'Turn on notifications'],
  reach: ['Share this post', 'Tag a friend', 'Repost to your network'],
  engagement: ['Comment your view', 'Reply with your experience', 'Vote in the comments'],
};

const METRICS = [
  'engagement rate',
  'comment rate',
  'share rate',
  'reach growth',
  'save rate',
];

function clamp(num: number, min: number, max: number) {
  return Math.min(max, Math.max(min, num));
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function toPascalWord(input: string) {
  const clean = input.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  if (!clean) return 'Brand';
  return clean
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

function inferGoal(objective: string) {
  const lower = objective.toLowerCase();
  if (/(sale|revenue|conversion|order|purchase)/.test(lower)) return 'sales';
  if (/(follower|audience growth|subscriber)/.test(lower)) return 'followers';
  if (/(reach|awareness|visibility|impression)/.test(lower)) return 'reach';
  return 'engagement';
}

function nextDateISO(start: Date, offset: number) {
  const next = new Date(start);
  next.setDate(next.getDate() + offset);
  return next.toISOString().split('T')[0];
}

function buildTheme(index: number, requirements: CalendarRequirements, objective: string) {
  if (requirements.dailyThemes) {
    return THEME_LIBRARY[index % THEME_LIBRARY.length];
  }

  const goal = inferGoal(objective);
  if (goal === 'sales') return 'Conversion Focus';
  if (goal === 'followers') return 'Audience Growth';
  if (goal === 'reach') return 'Reach Expansion';
  return 'Community Engagement';
}

function buildRecommendedTime(platform: Platform, index: number) {
  const slots = PLATFORM_TIMES[platform];
  return slots[index % slots.length];
}

function buildPostIdea(
  platform: Platform,
  theme: string,
  requirements: CalendarRequirements,
  index: number
) {
  if (!requirements.platformSpecific) {
    return `${theme}: Share one clear takeaway and one audience action.`;
  }

  const pattern = PLATFORM_IDEAS[platform][index % PLATFORM_IDEAS[platform].length];
  return `${theme}: ${pattern}`;
}

function buildCaptionDraft(args: {
  companyName: string;
  objective: string;
  theme: string;
  platform: Platform;
  cta: string;
  metricFocus: string;
  requirements: CalendarRequirements;
}) {
  const company = normalizeText(args.companyName);
  const objective = normalizeText(args.objective);
  const platformName = args.platform.charAt(0).toUpperCase() + args.platform.slice(1);
  const metricSentence = args.requirements.analytics
    ? `Primary metric to track: ${args.metricFocus}.`
    : '';

  return `${company} | ${args.theme}\n${objective}\nFormat for ${platformName}: deliver one practical insight and a strong hook.\n${metricSentence}\nCTA: ${args.cta}.`;
}

function buildHashtags(companyName: string, theme: string, platform: Platform) {
  const brand = toPascalWord(companyName);
  const topic = toPascalWord(theme);
  const platformTag =
    platform === 'instagram' ? 'InstagramTips' : platform === 'facebook' ? 'FacebookMarketing' : 'TwitterGrowth';

  return [
    `#${brand}`,
    `#${topic}`,
    `#${platformTag}`,
    '#SocialMediaStrategy',
    '#ContentCalendar',
  ];
}

export function generateCalendarDraft(input: GenerateCalendarInput): GeneratedCalendarDraftItem[] {
  const goal = inferGoal(input.objective);
  const ctas = CTA_BY_GOAL[goal] || CTA_BY_GOAL.engagement;
  const safeDays = clamp(Math.round(input.days || 30), 1, 60);
  const selectedPlatforms: Platform[] =
    input.platforms.length > 0
      ? input.platforms
      : ['instagram', 'facebook', 'twitter'];

  const startDate = input.startDate ? new Date(`${input.startDate}T00:00:00`) : new Date();

  return Array.from({ length: safeDays }).map((_, index) => {
    const platform = selectedPlatforms[index % selectedPlatforms.length];
    const theme = buildTheme(index, input.requirements, input.objective);
    const cta = ctas[index % ctas.length];
    const metricFocus = METRICS[index % METRICS.length];
    const recommendedTime = buildRecommendedTime(platform, index);

    return {
      day: index + 1,
      date: nextDateISO(startDate, index),
      theme,
      platform,
      postIdea: buildPostIdea(platform, theme, input.requirements, index),
      captionDraft: buildCaptionDraft({
        companyName: input.companyName,
        objective: input.objective,
        theme,
        platform,
        cta,
        metricFocus,
        requirements: input.requirements,
      }),
      cta,
      hashtags: buildHashtags(input.companyName, theme, platform),
      recommendedTime,
      metricFocus,
    };
  });
}
