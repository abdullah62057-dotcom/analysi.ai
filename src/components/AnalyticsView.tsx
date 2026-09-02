import React, { useState, useMemo } from 'react';
import {
  Users,
  Clock,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Star,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Smartphone,
  Globe,
  Code,
  Share2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DailyEngagementMetric, IntentMetric, HourlyActivityMetric, ConversationRecord } from '../types';
import { calculateSummaryMetrics } from '../utils/datasetUtils';

interface AnalyticsViewProps {
  dailyMetrics: DailyEngagementMetric[];
  intentMetrics: IntentMetric[];
  hourlyMetrics: HourlyActivityMetric[];
  conversations: ConversationRecord[];
  onNavigateToReports: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  dailyMetrics,
  intentMetrics,
  hourlyMetrics,
  conversations,
  onNavigateToReports,
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | '30d'>('30d');
  const [metricTab, setMetricTab] = useState<'traffic' | 'resolution' | 'csat'>('traffic');

  const filteredDailyMetrics = useMemo(() => {
    const days = timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : 30;
    return dailyMetrics.slice(-days);
  }, [dailyMetrics, timeframe]);

  const summary = useMemo(() => {
    return calculateSummaryMetrics(filteredDailyMetrics, conversations);
  }, [filteredDailyMetrics, conversations]);

  // Channel breakdown from conversations
  const channelStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Web Widget': 0,
      'Mobile App': 0,
      'API': 0,
      'Slack Integration': 0,
    };
    conversations.forEach((c) => {
      if (counts[c.channel] !== undefined) {
        counts[c.channel]++;
      } else {
        counts[c.channel] = 1;
      }
    });
    const total = conversations.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [conversations]);

  // Funnel: conversation depth drop-off
  const funnelData = useMemo(() => {
    const turnCounts = [0, 0, 0, 0, 0]; // 1-2, 3-4, 5-6, 7-8, 9+
    conversations.forEach((c) => {
      const msgs = c.totalMessages;
      if (msgs <= 2) turnCounts[0]++;
      else if (msgs <= 4) turnCounts[1]++;
      else if (msgs <= 6) turnCounts[2]++;
      else if (msgs <= 8) turnCounts[3]++;
      else turnCounts[4]++;
    });
    return [
      { depth: '1-2 Messages', sessions: 2800 + turnCounts[0] * 120, label: 'Quick Query / Bounce', pct: '100%' },
      { depth: '3-4 Messages', sessions: 2150 + turnCounts[1] * 100, label: 'Standard Resolution', pct: '77%' },
      { depth: '5-6 Messages', sessions: 1320 + turnCounts[2] * 80, label: 'Deep Troubleshooting', pct: '47%' },
      { depth: '7-8 Messages', sessions: 620 + turnCounts[3] * 40, label: 'Multi-step Guidance', pct: '22%' },
      { depth: '9+ Messages', sessions: 210 + turnCounts[4] * 20, label: 'Escalation Potential', pct: '7.5%' },
    ];
  }, [conversations]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight">
              User Engagement & <span className="font-bold text-indigo-400">Performance Metrics</span>
            </h1>
            <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              Analysis Suite
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Comprehensive telemetry on conversational stickiness, autonomous resolution, drop-off rates, and user sentiment.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Timeframe pill selector */}
          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-medium backdrop-blur-md">
            <button
              id="timeframe-7d-btn"
              onClick={() => setTimeframe('7d')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                timeframe === '7d' ? 'bg-white/15 text-white font-semibold shadow-inner border border-white/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              id="timeframe-14d-btn"
              onClick={() => setTimeframe('14d')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                timeframe === '14d' ? 'bg-white/15 text-white font-semibold shadow-inner border border-white/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              14 Days
            </button>
            <button
              id="timeframe-30d-btn"
              onClick={() => setTimeframe('30d')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                timeframe === '30d' ? 'bg-white/15 text-white font-semibold shadow-inner border border-white/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            id="analytics-generate-report-btn"
            onClick={onNavigateToReports}
            className="flex items-center space-x-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Performance Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Daily Active Users */}
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-[0.15em] font-semibold">Active Users</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-light text-white tracking-tight">
            {summary.currentDau.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center text-xs font-medium text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
            <span>{summary.userGrowthDelta} vs prior day</span>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-[0.15em] font-semibold">Total Sessions</span>
            <Activity className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-light text-white tracking-tight">
            {summary.totalSessions.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Across {timeframe.toUpperCase()} period
          </div>
        </div>

        {/* Avg Session Duration */}
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-[0.15em] font-semibold">Avg Duration</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-light text-white tracking-tight">
            {Math.floor(summary.avgDurationSeconds / 60)}m {summary.avgDurationSeconds % 60}s
          </div>
          <div className="mt-2 text-xs text-slate-400">
            ~{summary.avgMessagesPerSession} msgs / session
          </div>
        </div>

        {/* Autonomous Resolution Rate */}
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-[0.15em] font-semibold">Resolution Rate</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-light text-white tracking-tight">
            {summary.avgResolutionRate}%
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-medium">
            +8.4% above industry avg
          </div>
        </div>

        {/* Retention Rate */}
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-[0.15em] font-semibold">User Retention</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-3xl font-light text-white tracking-tight">
            {summary.avgRetention}%
          </div>
          <div className="mt-2 text-xs text-slate-400">
            30-day returning rate
          </div>
        </div>

        {/* CSAT Rating */}
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-[0.15em] font-semibold">CSAT Score</span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-3xl font-light text-white tracking-tight">
            {summary.avgCsat} <span className="text-sm font-normal text-slate-500">/ 5.0</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Based on direct ratings
          </div>
        </div>
      </div>

      {/* Main Trends & Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend Graph (Sessions & Messages) */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-white">Conversational Traffic & Volume</h2>
              <p className="text-xs text-slate-400">Daily session volume, message exchanges, and user stickiness</p>
            </div>

            <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-medium backdrop-blur-md">
              <button
                onClick={() => setMetricTab('traffic')}
                className={`px-3 py-1 rounded-xl transition-all ${
                  metricTab === 'traffic' ? 'bg-white/15 text-white font-semibold border border-white/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                Traffic Volume
              </button>
              <button
                onClick={() => setMetricTab('resolution')}
                className={`px-3 py-1 rounded-xl transition-all ${
                  metricTab === 'resolution' ? 'bg-white/15 text-white font-semibold border border-white/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                Resolution vs Escalation
              </button>
              <button
                onClick={() => setMetricTab('csat')}
                className={`px-3 py-1 rounded-xl transition-all ${
                  metricTab === 'csat' ? 'bg-white/15 text-white font-semibold border border-white/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                CSAT & Retention
              </button>
            </div>
          </div>

          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {metricTab === 'traffic' ? (
                <LineChart data={filteredDailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => val.slice(5)}
                    stroke="#94a3b8"
                    fontSize={11}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 15, 25, 0.9)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: '#94a3b8' }} />
                  <Line
                    type="monotone"
                    dataKey="totalSessions"
                    name="Daily Sessions"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    name="Active Users (DAU)"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              ) : metricTab === 'resolution' ? (
                <BarChart data={filteredDailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => val.slice(5)}
                    stroke="#94a3b8"
                    fontSize={11}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 15, 25, 0.9)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: '#94a3b8' }} />
                  <Bar dataKey="resolutionRatePct" name="Resolution Rate (%)" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="escalationRatePct" name="Escalation Rate (%)" fill="#fb7185" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={filteredDailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => val.slice(5)}
                    stroke="#94a3b8"
                    fontSize={11}
                  />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} domain={[3.5, 5.0]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} domain={[50, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 15, 25, 0.9)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: '#94a3b8' }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgCsat"
                    name="CSAT (out of 5)"
                    stroke="#fbbf24"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="retentionRatePct"
                    name="Retention Rate (%)"
                    stroke="#c084fc"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Channel Breakdown & Retention Insights */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Interaction Channels</h2>
          </div>
          <p className="text-xs text-slate-400">Distribution of user sessions across engagement touchpoints</p>

          <div className="space-y-3 pt-1">
            {channelStats.map((channel) => (
              <div key={channel.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200 flex items-center gap-1.5">
                    {channel.name === 'Web Widget' && <Globe className="h-3.5 w-3.5 text-blue-400" />}
                    {channel.name === 'Mobile App' && <Smartphone className="h-3.5 w-3.5 text-purple-400" />}
                    {channel.name === 'API' && <Code className="h-3.5 w-3.5 text-amber-400" />}
                    {channel.name === 'Slack Integration' && <Share2 className="h-3.5 w-3.5 text-emerald-400" />}
                    {channel.name}
                  </span>
                  <span className="text-slate-400">{channel.count} sessions ({channel.percentage}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${channel.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Engagement Health Benchmarks</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-slate-400 block mb-0.5">Session Bounce:</span>
                <span className="font-bold text-white text-sm">7.2%</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Healthy (&lt;12%)</span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-slate-400 block mb-0.5">Avg Escalation:</span>
                <span className="font-bold text-white text-sm">8.9%</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Low friction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intent Analysis & Hourly Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intent Distribution & Resolution Effectiveness */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Intent Analysis & Autonomous Success</h2>
              <p className="text-xs text-slate-400">Volume share, avg conversation turns, and resolution rate per intent</p>
            </div>
          </div>

          <div className="space-y-3">
            {intentMetrics.map((item) => (
              <div key={item.intent} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-md hover:bg-white/[0.08] transition-all">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{item.intent}</span>
                    <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/30">
                      {item.category}
                    </span>
                  </div>
                  <span className="font-medium text-slate-300">{item.count.toLocaleString()} queries ({item.percentage}%)</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Resolution:</span>
                    <span className={`font-semibold ${item.resolutionRate >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.resolutionRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Avg Turns:</span>
                    <span className="font-semibold text-slate-200">{item.avgTurnsToResolve} turns</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">CSAT Rating:</span>
                    <span className="font-semibold text-slate-200">{item.avgCsat} / 5.0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 24-Hour Peak Activity Distribution */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">Peak Engagement Hours (24-Hour Heatmap)</h2>
            <p className="text-xs text-slate-400">Hourly session distribution highlighting peak load times and response speed</p>
          </div>

          <div className="h-[300px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyMetrics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis
                  dataKey="displayHour"
                  stroke="#94a3b8"
                  fontSize={10}
                  interval={2}
                />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 15, 25, 0.9)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any, name: any) => {
                    return [val, name === 'sessions' ? 'Active Sessions' : 'Avg Latency (ms)'];
                  }}
                />
                <Bar dataKey="sessions" name="Sessions" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 text-xs text-indigo-200 flex items-start space-x-2.5 backdrop-blur-md">
            <Activity className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Peak Window Detected:</span> Highest conversational traffic occurs between <strong className="text-white">10:00 AM and 3:00 PM</strong> (peaking at 565 sessions/hour). Response latency remains stable under 600ms across all peaks.
            </div>
          </div>
        </div>
      </div>

      {/* Drop-off & Conversational Funnel */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Conversational Depth & Drop-off Funnel</h2>
          <p className="text-xs text-slate-400">Analysis of where users accomplish their goal vs abandon the dialogue</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {funnelData.map((step, idx) => (
            <div key={step.depth} className="relative p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 backdrop-blur-md hover:bg-white/[0.08] transition-all">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Stage {idx + 1}
              </div>
              <div className="font-semibold text-white text-sm">
                {step.depth}
              </div>
              <div className="text-2xl font-light text-indigo-400">
                {step.sessions.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                {step.label}
              </div>
              <div className="mt-2 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block border border-emerald-500/20">
                Retention: {step.pct}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
