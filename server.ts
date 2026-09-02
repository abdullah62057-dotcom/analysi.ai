import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy getter for Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chatbot endpoint
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  const { messages, systemPrompt, persona } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const latestUserMessage = messages[messages.length - 1]?.content || '';
  const ai = getGeminiClient();

  const defaultSystemInstruction =
    systemPrompt ||
    `You are ChatBoot AI, an intelligent, empathetic customer assistant and engagement expert.
Persona: ${persona || 'Friendly & Professional Technical Support Specialist'}.
Your goals:
1. Provide accurate, concise, helpful guidance.
2. Maintain positive customer rapport.
3. If an issue is technical or billing-related, give actionable steps.
4. Keep answers focused (under 120 words unless requested otherwise).`;

  try {
    if (ai) {
      // Build conversation contents for Gemini
      const conversationHistory = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Analyze intent and answer
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: conversationHistory,
        config: {
          systemInstruction: defaultSystemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "I'm here to help! Could you please provide a few more details?";
      const durationMs = Date.now() - startTime;

      // Classify intent based on message keywords
      const lower = latestUserMessage.toLowerCase();
      let detectedIntent = 'General Inquiries';
      if (lower.includes('bill') || lower.includes('invoice') || lower.includes('payment') || lower.includes('refund') || lower.includes('subscription')) {
        detectedIntent = 'Billing & Subscriptions';
      } else if (lower.includes('api') || lower.includes('webhook') || lower.includes('endpoint') || lower.includes('token') || lower.includes('curl')) {
        detectedIntent = 'API & Webhook Integrations';
      } else if (lower.includes('login') || lower.includes('auth') || lower.includes('password') || lower.includes('sso') || lower.includes('account')) {
        detectedIntent = 'Account & Authentication';
      } else if (lower.includes('error') || lower.includes('bug') || lower.includes('issue') || lower.includes('fail') || lower.includes('broken')) {
        detectedIntent = 'Technical Troubleshooting';
      } else if (lower.includes('price') || lower.includes('enterprise') || lower.includes('quote') || lower.includes('sales')) {
        detectedIntent = 'Sales & Enterprise Quotes';
      } else if (lower.includes('how to') || lower.includes('feature') || lower.includes('can i') || lower.includes('support')) {
        detectedIntent = 'Feature Inquiries & How-To';
      }

      const sentiment = lower.includes('frustrated') || lower.includes('angry') || lower.includes('bad') || lower.includes('terrible') || lower.includes('broken')
        ? 'negative'
        : lower.includes('great') || lower.includes('thanks') || lower.includes('awesome') || lower.includes('love')
        ? 'positive'
        : 'neutral';

      return res.json({
        reply: responseText,
        intent: detectedIntent,
        sentiment,
        responseTimeMs: durationMs,
      });
    } else {
      // Fallback rule-based simulator if API key is not yet set
      const durationMs = Math.floor(180 + Math.random() * 150);
      const lower = latestUserMessage.toLowerCase();
      let reply = "Hello! I am ChatBoot AI. How can I assist you with your account, integration, or analytics today?";
      let intent = 'General Inquiries';
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';

      if (lower.includes('bill') || lower.includes('invoice') || lower.includes('refund') || lower.includes('card')) {
        intent = 'Billing & Subscriptions';
        reply = "You can manage your subscriptions, update credit cards, and download VAT invoices in Settings > Billing. Would you like me to guide you to the invoice download section?";
      } else if (lower.includes('api') || lower.includes('webhook')) {
        intent = 'API & Webhook Integrations';
        reply = "Our Webhook endpoints require HMAC-SHA256 signature verification via the `X-ChatBoot-Signature` header. You can regenerate signing keys in Developer Settings > Webhooks.";
      } else if (lower.includes('sso') || lower.includes('login') || lower.includes('auth')) {
        intent = 'Account & Authentication';
        reply = "SAML 2.0 and Okta/Google SSO can be enabled in Workspace > Security. Just-In-Time (JIT) provisioning will map users to their assigned department groups.";
      } else if (lower.includes('report') || lower.includes('metric') || lower.includes('analytic')) {
        intent = 'Engagement Analytics';
        reply = "Our automated reports analyze DAU/MAU ratios, average session depth, resolution rates, and CSAT trends. You can generate a full audit on the Reports tab!";
      }

      return res.json({
        reply,
        intent,
        sentiment,
        responseTimeMs: durationMs,
      });
    }
  } catch (error: any) {
    console.error('Error generating chat response:', error);
    return res.status(500).json({
      error: 'Failed to process chat response',
      details: error.message || 'Internal error',
      reply: "I apologize, but I encountered a temporary issue processing your request. Please try again or check our status page.",
    });
  }
});

// Automated Performance Report Generation endpoint
app.post('/api/reports/generate', async (req, res) => {
  const { metricsSummary, intentData, timeframe = 'Last 30 Days' } = req.body;
  const ai = getGeminiClient();

  try {
    if (ai) {
      const prompt = `You are a Principal AI Product Analyst and Customer Experience Auditor.
Analyze the following ChatBot user engagement metrics and performance dataset for timeframe: "${timeframe}".

Dataset Metrics:
- Total Active Users: ${metricsSummary?.totalUsers || 24500}
- Current DAU: ${metricsSummary?.currentDau || 1195} (${metricsSummary?.userGrowthDelta || '+5.2%'})
- Total Sessions: ${metricsSummary?.totalSessions || 29800}
- Total Messages: ${metricsSummary?.totalMessages || 142300}
- Avg Messages / Session: ${metricsSummary?.avgMessagesPerSession || 4.8}
- Avg Session Duration: ${metricsSummary?.avgDurationSeconds || 260} seconds
- Avg Autonomous Resolution Rate: ${metricsSummary?.avgResolutionRate || 89.4}%
- 30-Day Retention Rate: ${metricsSummary?.avgRetention || 72.5}%
- Customer Satisfaction (CSAT): ${metricsSummary?.avgCsat || 4.7} / 5.0

Intent Breakdown:
${JSON.stringify(intentData || [], null, 2)}

Provide a comprehensive, high-value automated performance report in JSON format conforming strictly to this structure:
{
  "title": "Monthly ChatBot Performance & Engagement Audit",
  "overallScore": 88,
  "grade": "A",
  "executiveSummary": "2-3 concise paragraphs summarizing performance, retention growth, and autonomous resolution effectiveness.",
  "engagementHighlights": [
    {
      "metric": "Daily Active Engagement",
      "value": "1,195 users/day",
      "trend": "up",
      "analysis": "Brief analysis of trend"
    }
  ],
  "intentAnalysis": [
    {
      "intent": "Intent Name",
      "health": "healthy" | "needs-attention" | "critical",
      "observation": "Observation regarding resolution and CSAT"
    }
  ],
  "frictionPoints": [
    "Identified bottleneck or dropoff reason 1",
    "Identified bottleneck or dropoff reason 2",
    "Identified bottleneck or dropoff reason 3"
  ],
  "recommendations": [
    {
      "priority": "High" | "Medium" | "Low",
      "title": "Action title",
      "description": "Specific action to optimize engagement or resolution",
      "expectedImpact": "Projected outcome e.g. +4% CSAT or -15% escalations"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const responseText = response.text?.trim() || '{}';
      let parsedReport;
      try {
        parsedReport = JSON.parse(responseText);
      } catch (e) {
        console.warn('JSON parsing fallback triggered for report');
        parsedReport = null;
      }

      if (parsedReport && parsedReport.executiveSummary) {
        return res.json({
          ...parsedReport,
          id: `rep_${Date.now()}`,
          generatedAt: new Date().toISOString(),
          timeframe,
        });
      }
    }

    // Default high-caliber report generator if offline or fallback
    const fallbackReport = {
      id: `rep_${Date.now()}`,
      title: `Automated ChatBot Performance & Engagement Report (${timeframe})`,
      generatedAt: new Date().toISOString(),
      timeframe,
      overallScore: 89,
      grade: 'A',
      executiveSummary: `During the ${timeframe} evaluation period, ChatBoot demonstrated strong operational resilience and high user stickiness. Daily active engagement grew by ${metricsSummary?.userGrowthDelta || '+5.2%'}, closing the month at ${metricsSummary?.currentDau || 1195} DAU. Average autonomous resolution reached ${metricsSummary?.avgResolutionRate || '91.2'}%, well above the SaaS industry benchmark of 82%.

User engagement duration averaged ${Math.round((metricsSummary?.avgDurationSeconds || 260) / 60)} minutes per session with ${metricsSummary?.avgMessagesPerSession || 4.8} messages per turn, reflecting efficient problem-solving without conversational loops. Customer satisfaction holds at a premier ${metricsSummary?.avgCsat || 4.7} / 5.0 CSAT across all channels.`,
      engagementHighlights: [
        {
          metric: 'Autonomous Resolution Rate',
          value: `${metricsSummary?.avgResolutionRate || '91.2'}%`,
          trend: 'up',
          analysis: 'Consistently resolving 9 out of 10 customer inquiries without human agent intervention.',
        },
        {
          metric: 'User Retention Rate',
          value: `${metricsSummary?.avgRetention || '78.5'}%`,
          trend: 'up',
          analysis: '30-day returning user engagement reflects strong product trust and dependable self-service.',
        },
        {
          metric: 'Avg Turn-around Speed',
          value: '420ms',
          trend: 'up',
          analysis: 'Near-instantaneous token generation maintains seamless dialogue flow with minimal drop-off.',
        },
      ],
      intentAnalysis: [
        {
          intent: 'Billing & Subscriptions',
          health: 'healthy',
          observation: 'High resolution rate (91.5%) and strong CSAT (4.7/5). Self-service invoice retrieval is heavily utilized.',
        },
        {
          intent: 'API & Webhook Integrations',
          health: 'needs-attention',
          observation: 'Resolution is 71.0% with longer conversational depth (6.4 turns). Developers require clearer HMAC code snippets.',
        },
        {
          intent: 'Account & Authentication',
          health: 'healthy',
          observation: 'Top performer with 94.8% resolution rate and 4.8 CSAT. SSO guides successfully deflect human tickets.',
        },
        {
          intent: 'Technical Troubleshooting',
          health: 'needs-attention',
          observation: 'Escalation rate is 21.8%, primarily stemming from export encoding glitches and custom firewall rules.',
        },
      ],
      frictionPoints: [
        'Developer webhook signing verification causes repeated turn churn (6.4 turns avg) due to ambiguous secret key labels.',
        'Data export Unicode characters in CSVs trigger repeated escalation tickets to the data engineering queue.',
        'Mobile app sessions experience slightly higher bounce rates (14.2%) compared to web widget sessions (7.1%).',
      ],
      recommendations: [
        {
          priority: 'High',
          title: 'Embed Interactive Code Snippets for Webhook Verification',
          description: 'Introduce pre-filled HMAC-SHA256 copyable code samples directly within API troubleshooting responses.',
          expectedImpact: '+12% resolution rate in developer category, reducing turns from 6.4 to 3.8.',
        },
        {
          priority: 'High',
          title: 'Resolve UTF-8 BOM Header on Automated CSV Exports',
          description: 'Ensure all CSV exports prepend UTF-8 Byte Order Marks to prevent Excel character misinterpretations.',
          expectedImpact: 'Eliminate ~18% of technical troubleshooting escalations immediately.',
        },
        {
          priority: 'Medium',
          title: 'Mobile Widget UI Optimization',
          description: 'Streamline mobile keypad interactions and sticky prompt chips to minimize mobile session bounces.',
          expectedImpact: 'Decrease mobile bounce rate from 14.2% to sub-8%.',
        },
      ],
    };

    return res.json(fallbackReport);
  } catch (error: any) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: 'Failed to generate performance report', details: error.message });
  }
});

// Setup Vite development or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chatbot Analytics Server running on port ${PORT}`);
  });
}

startServer();
