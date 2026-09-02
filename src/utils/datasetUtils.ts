import { ConversationRecord, DailyEngagementMetric, IntentMetric, HourlyActivityMetric } from '../types';
import { INITIAL_CONVERSATIONS, INITIAL_DAILY_METRICS, INITIAL_HOURLY_METRICS, INITIAL_INTENT_METRICS } from '../data/initialDatasets';

export function convertToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        let val = obj[header];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        val = String(val ?? '');
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      })
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function calculateSummaryMetrics(
  dailyMetrics: DailyEngagementMetric[],
  conversations: ConversationRecord[]
) {
  const totalUsers = dailyMetrics.reduce((acc, curr) => acc + curr.activeUsers, 0);
  const totalSessions = dailyMetrics.reduce((acc, curr) => acc + curr.totalSessions, 0);
  const totalMessages = dailyMetrics.reduce((acc, curr) => acc + curr.totalMessages, 0);
  
  const avgMessagesPerSession = totalSessions > 0 ? (totalMessages / totalSessions).toFixed(1) : '0';
  const avgDuration = dailyMetrics.length > 0 
    ? Math.round(dailyMetrics.reduce((acc, curr) => acc + curr.avgSessionDurationSeconds, 0) / dailyMetrics.length)
    : 0;

  const avgResolutionRate = dailyMetrics.length > 0
    ? (dailyMetrics.reduce((acc, curr) => acc + curr.resolutionRatePct, 0) / dailyMetrics.length).toFixed(1)
    : '0';

  const avgRetention = dailyMetrics.length > 0
    ? (dailyMetrics.reduce((acc, curr) => acc + curr.retentionRatePct, 0) / dailyMetrics.length).toFixed(1)
    : '0';

  const avgCsat = dailyMetrics.length > 0
    ? (dailyMetrics.reduce((acc, curr) => acc + curr.avgCsat, 0) / dailyMetrics.length).toFixed(2)
    : '0.0';

  const latestDay = dailyMetrics[dailyMetrics.length - 1];
  const prevDay = dailyMetrics[dailyMetrics.length - 2] || latestDay;
  const userGrowthDelta = prevDay.activeUsers > 0 
    ? (((latestDay.activeUsers - prevDay.activeUsers) / prevDay.activeUsers) * 100).toFixed(1)
    : '0';

  return {
    totalUsers,
    totalSessions,
    totalMessages,
    avgMessagesPerSession,
    avgDurationSeconds: avgDuration,
    avgResolutionRate,
    avgRetention,
    avgCsat,
    currentDau: latestDay.activeUsers,
    userGrowthDelta: Number(userGrowthDelta) >= 0 ? `+${userGrowthDelta}%` : `${userGrowthDelta}%`,
    totalLoggedConversations: conversations.length,
  };
}

export function generateSyntheticConversation(intentName?: string): ConversationRecord {
  const intents = [
    'Billing & Subscriptions',
    'Technical Troubleshooting',
    'Account & Authentication',
    'Feature Inquiries & How-To',
    'API & Webhook Integrations',
    'Sales & Enterprise Quotes',
  ];
  const chosenIntent = intentName || intents[Math.floor(Math.random() * intents.length)];
  const names = ['Alex Rivera', 'Jordan Vance', 'Priya Sharma', 'Lucas Becker', 'Mei-Ling Wang', 'Carlos Mendez'];
  const name = names[Math.floor(Math.random() * names.length)];
  const id = `conv_${Math.floor(10000 + Math.random() * 90000)}`;
  const channels: ('Web Widget' | 'Mobile App' | 'API' | 'Slack Integration')[] = [
    'Web Widget',
    'Mobile App',
    'API',
    'Slack Integration',
  ];
  const channel = channels[Math.floor(Math.random() * channels.length)];
  const csat = Math.floor(Math.random() * 2) + 4; // 4 or 5 mostly
  const status: 'resolved' | 'escalated' | 'abandoned' = Math.random() > 0.15 ? 'resolved' : 'escalated';

  return {
    conversationId: id,
    userId: `usr_${Math.floor(1000 + Math.random() * 9000)}`,
    userName: name,
    userEmail: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    channel,
    startedAt: new Date(Date.now() - Math.random() * 3600000 * 24).toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds: Math.floor(120 + Math.random() * 300),
    totalMessages: Math.floor(4 + Math.random() * 6),
    primaryIntent: chosenIntent,
    sentiment: csat >= 4 ? 'positive' : 'neutral',
    status,
    csatRating: csat,
    turns: [
      {
        role: 'user',
        content: `Hi there, I have an inquiry regarding ${chosenIntent.toLowerCase()} for our team workspace.`,
        timestamp: new Date(Date.now() - 200000).toISOString(),
      },
      {
        role: 'assistant',
        content: `Hello ${name}! I'd be glad to assist you with ${chosenIntent.toLowerCase()}. Let me guide you through the process right now.`,
        timestamp: new Date(Date.now() - 195000).toISOString(),
        responseTimeMs: Math.floor(320 + Math.random() * 200),
      },
      {
        role: 'user',
        content: 'That sounds straightforward. Could you also confirm if our current tier includes priority routing?',
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
      {
        role: 'assistant',
        content: 'Yes! Priority routing is active by default on your tier with guaranteed response latency under 500ms.',
        timestamp: new Date(Date.now() - 116000).toISOString(),
        responseTimeMs: Math.floor(280 + Math.random() * 150),
      },
    ],
  };
}
