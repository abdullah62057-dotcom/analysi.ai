export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  intent?: string;
  responseTimeMs?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  responseTimeMs?: number;
}

export interface ConversationRecord {
  conversationId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  channel: 'Web Widget' | 'Mobile App' | 'API' | 'Slack Integration';
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  totalMessages: number;
  primaryIntent: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'resolved' | 'escalated' | 'abandoned';
  csatRating: number; // 1 to 5
  turns: ConversationTurn[];
}

export interface DailyEngagementMetric {
  date: string;
  activeUsers: number;
  totalSessions: number;
  totalMessages: number;
  avgMessagesPerSession: number;
  avgSessionDurationSeconds: number;
  resolutionRatePct: number;
  retentionRatePct: number;
  bounceRatePct: number;
  avgCsat: number;
  escalationRatePct: number;
}

export interface IntentMetric {
  intent: string;
  category: string;
  count: number;
  percentage: number;
  avgTurnsToResolve: number;
  resolutionRate: number; // 0 to 100
  avgCsat: number; // 1 to 5
  escalationCount: number;
}

export interface HourlyActivityMetric {
  hour: number; // 0-23
  displayHour: string;
  sessions: number;
  avgResponseTimeMs: number;
}

export interface PerformanceReport {
  id: string;
  title: string;
  generatedAt: string;
  timeframe: string;
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  executiveSummary: string;
  engagementHighlights: {
    metric: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    analysis: string;
  }[];
  intentAnalysis: {
    intent: string;
    health: 'healthy' | 'needs-attention' | 'critical';
    observation: string;
  }[];
  frictionPoints: string[];
  recommendations: {
    priority: 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
    expectedImpact: string;
  }[];
  fullMarkdownContent: string;
}
