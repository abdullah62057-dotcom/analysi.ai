import React, { useState, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  Copy,
  Table as TableIcon,
  Code as CodeIcon,
  ExternalLink,
} from 'lucide-react';
import { ConversationRecord, DailyEngagementMetric, IntentMetric } from '../types';
import { convertToCSV, downloadFile, generateSyntheticConversation } from '../utils/datasetUtils';

interface DatasetViewProps {
  conversations: ConversationRecord[];
  dailyMetrics: DailyEngagementMetric[];
  intentMetrics: IntentMetric[];
  onAddConversation: (record: ConversationRecord) => void;
  onResetDatasets: () => void;
  onImportDataset: (conversations: ConversationRecord[]) => void;
}

export const DatasetView: React.FC<DatasetViewProps> = ({
  conversations,
  dailyMetrics,
  intentMetrics,
  onAddConversation,
  onResetDatasets,
  onImportDataset,
}) => {
  const [selectedFile, setSelectedFile] = useState<'conversations' | 'engagement' | 'intents'>('conversations');
  const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [intentFilter, setIntentFilter] = useState('all');
  const [copiedState, setCopiedState] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesSearch =
        c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.conversationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.primaryIntent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.turns.some((t) => t.content.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesChannel = channelFilter === 'all' || c.channel === channelFilter;
      const matchesIntent = intentFilter === 'all' || c.primaryIntent === intentFilter;

      return matchesSearch && matchesChannel && matchesIntent;
    });
  }, [conversations, searchQuery, channelFilter, intentFilter]);

  // CSV strings
  const engagementCSV = useMemo(() => convertToCSV(dailyMetrics), [dailyMetrics]);
  const conversationsCSV = useMemo(() => {
    const flattened = conversations.map((c) => ({
      conversationId: c.conversationId,
      userId: c.userId,
      userName: c.userName,
      userEmail: c.userEmail || '',
      channel: c.channel,
      startedAt: c.startedAt,
      endedAt: c.endedAt,
      durationSeconds: c.durationSeconds,
      totalMessages: c.totalMessages,
      primaryIntent: c.primaryIntent,
      sentiment: c.sentiment,
      status: c.status,
      csatRating: c.csatRating,
      transcriptSummary: c.turns.map((t) => `${t.role}: ${t.content}`).join(' | '),
    }));
    return convertToCSV(flattened);
  }, [conversations]);

  const intentsCSV = useMemo(() => convertToCSV(intentMetrics), [intentMetrics]);

  // Downloads
  const handleDownloadConversationsJSON = () => {
    const jsonStr = JSON.stringify(conversations, null, 2);
    downloadFile('chat_conversations_dataset.json', jsonStr, 'application/json');
  };

  const handleDownloadConversationsCSV = () => {
    downloadFile('chat_conversations_dataset.csv', conversationsCSV, 'text/csv');
  };

  const handleDownloadEngagementCSV = () => {
    downloadFile('user_engagement_metrics.csv', engagementCSV, 'text/csv');
  };

  const handleDownloadIntentsJSON = () => {
    const jsonStr = JSON.stringify(intentMetrics, null, 2);
    downloadFile('intent_analytics_dataset.json', jsonStr, 'application/json');
  };

  const handleDownloadCompleteBundle = () => {
    const bundle = {
      manifest: {
        datasetTitle: 'ChatBoot User Engagement & Conversational Telemetry',
        generatedAt: new Date().toISOString(),
        totalConversations: conversations.length,
        daysTracked: dailyMetrics.length,
        intentCategories: intentMetrics.length,
      },
      engagementMetrics: dailyMetrics,
      intentMetrics,
      conversations,
    };
    downloadFile('chatboot_full_dataset_bundle.json', JSON.stringify(bundle, null, 2), 'application/json');
  };

  const handleCopyRaw = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleGenerateBatch = () => {
    for (let i = 0; i < 3; i++) {
      onAddConversation(generateSyntheticConversation());
    }
  };

  // Drag and drop / file upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          const records = Array.isArray(parsed)
            ? parsed
            : parsed.conversations || parsed.records || [parsed];
          onImportDataset(records);
          setUploadFeedback(`Successfully imported ${records.length} conversation records from ${file.name}!`);
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV import
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          setUploadFeedback(`CSV file ${file.name} received with ${lines.length - 1} rows.`);
        }
      } catch (err: any) {
        setUploadFeedback(`Failed to parse file: ${err.message}`);
      }
      setTimeout(() => setUploadFeedback(null), 5000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight">
              Dataset Repository & <span className="font-bold text-indigo-400">Files</span>
            </h1>
            <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              CSV & JSON
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Downloadable conversation transcripts, daily engagement logs, intent metrics, and schemas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="generate-batch-interactions-btn"
            onClick={handleGenerateBatch}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md transition-all"
            title="Add 3 synthetic benchmark conversations"
          >
            <PlusCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span>Generate Benchmark Data</span>
          </button>

          <button
            id="download-full-bundle-btn"
            onClick={handleDownloadCompleteBundle}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download All Datasets (.json)</span>
          </button>
        </div>
      </div>

      {uploadFeedback && (
        <div className="flex items-center space-x-2 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* Dataset Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Engagement Metrics */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between hover:bg-white/[0.07] hover:border-white/20 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                <span className="font-semibold text-white text-sm">user_engagement_metrics.csv</span>
              </div>
              <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {dailyMetrics.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Daily time-series metrics: Active Users (DAU), Total Sessions, Total Messages, Bounce Rate, 30-Day Retention Rate, and CSAT scores.
            </p>
          </div>
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">Format: CSV</span>
            <button
              id="download-engagement-csv-card-btn"
              onClick={handleDownloadEngagementCSV}
              className="flex items-center space-x-1 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Card 2: Chat Conversations */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between hover:bg-white/[0.07] hover:border-white/20 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="h-5 w-5 text-indigo-400" />
                <span className="font-semibold text-white text-sm">chat_conversations.json</span>
              </div>
              <span className="text-[11px] font-medium bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/20">
                {conversations.length} Logs
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full multi-turn user conversation transcripts, latency telemetry (ms), intent tags, channels, sentiment, and resolution status.
            </p>
          </div>
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <button
                id="download-conversations-json-btn"
                onClick={handleDownloadConversationsJSON}
                className="flex items-center space-x-1 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 px-3 py-1.5 rounded-xl transition-all"
              >
                <Download className="h-3 w-3" />
                <span>JSON</span>
              </button>
              <button
                id="download-conversations-csv-btn"
                onClick={handleDownloadConversationsCSV}
                className="flex items-center space-x-1 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all"
              >
                <Download className="h-3 w-3" />
                <span>CSV</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Multi-turn</span>
          </div>
        </div>

        {/* Card 3: Intent Analytics */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between hover:bg-white/[0.07] hover:border-white/20 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-amber-400" />
                <span className="font-semibold text-white text-sm">intent_analytics.json</span>
              </div>
              <span className="text-[11px] font-medium bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/20">
                {intentMetrics.length} Categories
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distribution statistics across intents: volume share, average turns to resolution, autonomous success rate, and CSAT scores.
            </p>
          </div>
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">Format: JSON</span>
            <button
              id="download-intents-json-card-btn"
              onClick={handleDownloadIntentsJSON}
              className="flex items-center space-x-1 text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Explorer Tabs & Controls */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* File selection bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 bg-white/[0.02] p-3 sm:px-6 gap-3">
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setSelectedFile('conversations')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                selectedFile === 'conversations'
                  ? 'bg-white/15 text-white shadow-inner border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileCode className="h-3.5 w-3.5 text-indigo-400" />
              <span>chat_conversations.json ({conversations.length})</span>
            </button>

            <button
              onClick={() => setSelectedFile('engagement')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                selectedFile === 'engagement'
                  ? 'bg-white/15 text-white shadow-inner border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>user_engagement_metrics.csv ({dailyMetrics.length})</span>
            </button>

            <button
              onClick={() => setSelectedFile('intents')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                selectedFile === 'intents'
                  ? 'bg-white/15 text-white shadow-inner border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-amber-400" />
              <span>intent_analytics.json</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-medium backdrop-blur-md">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-xl transition-all ${
                  viewMode === 'table' ? 'bg-white/15 text-white font-semibold border border-white/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="h-3 w-3" />
                <span>Table View</span>
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-xl transition-all ${
                  viewMode === 'raw' ? 'bg-white/15 text-white font-semibold border border-white/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CodeIcon className="h-3 w-3" />
                <span>Raw Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters (active for conversations) */}
        {selectedFile === 'conversations' && (
          <div className="p-4 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="dataset-search-input"
                type="text"
                placeholder="Search by customer name, user ID, intent, message keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-indigo-400 backdrop-blur-md"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                id="dataset-channel-filter"
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none backdrop-blur-md [&>option]:bg-[#0c0c14] [&>option]:text-slate-200"
              >
                <option value="all">All Channels</option>
                <option value="Web Widget">Web Widget</option>
                <option value="Mobile App">Mobile App</option>
                <option value="API">API</option>
                <option value="Slack Integration">Slack Integration</option>
              </select>

              <select
                id="dataset-intent-filter"
                value={intentFilter}
                onChange={(e) => setIntentFilter(e.target.value)}
                className="text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none backdrop-blur-md [&>option]:bg-[#0c0c14] [&>option]:text-slate-200"
              >
                <option value="all">All Intents</option>
                {intentMetrics.map((i) => (
                  <option key={i.intent} value={i.intent}>
                    {i.intent}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Content Viewer */}
        <div className="p-4 sm:p-6 overflow-x-auto max-h-[500px]">
          {viewMode === 'table' ? (
            selectedFile === 'conversations' ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-2.5 px-3">Session ID</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Intent</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">CSAT</th>
                    <th className="py-2.5 px-3">Turn Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredConversations.map((c) => (
                    <tr key={c.conversationId} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-indigo-300 font-medium">{c.conversationId}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-white block">{c.userName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{c.userEmail || c.userId}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{c.channel}</td>
                      <td className="py-2.5 px-3">
                        <span className="rounded-md bg-indigo-500/20 text-indigo-300 px-2 py-0.5 text-[11px] font-medium border border-indigo-500/30">
                          {c.primaryIntent}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono">
                        {Math.floor(c.durationSeconds / 60)}m {c.durationSeconds % 60}s
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            c.status === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : c.status === 'escalated'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-white/5 text-slate-400 border border-white/10'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-amber-400">
                        {c.csatRating} / 5
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate text-slate-400" title={c.turns[0]?.content}>
                        {c.turns[0]?.content}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : selectedFile === 'engagement' ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Active Users</th>
                    <th className="py-2.5 px-3">Sessions</th>
                    <th className="py-2.5 px-3">Total Messages</th>
                    <th className="py-2.5 px-3">Avg Msgs / Sess</th>
                    <th className="py-2.5 px-3">Avg Duration</th>
                    <th className="py-2.5 px-3">Resolution %</th>
                    <th className="py-2.5 px-3">Retention %</th>
                    <th className="py-2.5 px-3">Avg CSAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dailyMetrics.map((m) => (
                    <tr key={m.date} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 px-3 font-mono text-white font-medium">{m.date}</td>
                      <td className="py-2 px-3 font-medium text-indigo-400">{m.activeUsers.toLocaleString()}</td>
                      <td className="py-2 px-3 font-medium text-slate-200">{m.totalSessions.toLocaleString()}</td>
                      <td className="py-2 px-3 text-slate-300">{m.totalMessages.toLocaleString()}</td>
                      <td className="py-2 px-3 text-slate-300">{m.avgMessagesPerSession}</td>
                      <td className="py-2 px-3 text-slate-300">{m.avgSessionDurationSeconds}s</td>
                      <td className="py-2 px-3 font-semibold text-emerald-400">{m.resolutionRatePct}%</td>
                      <td className="py-2 px-3 text-purple-400 font-medium">{m.retentionRatePct}%</td>
                      <td className="py-2 px-3 text-amber-400 font-semibold">{m.avgCsat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-2.5 px-3">Intent</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Volume Count</th>
                    <th className="py-2.5 px-3">Share %</th>
                    <th className="py-2.5 px-3">Avg Turns</th>
                    <th className="py-2.5 px-3">Resolution Rate</th>
                    <th className="py-2.5 px-3">Avg CSAT</th>
                    <th className="py-2.5 px-3">Escalations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {intentMetrics.map((i) => (
                    <tr key={i.intent} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white">{i.intent}</td>
                      <td className="py-2.5 px-3 text-slate-400">{i.category}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{i.count.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-400">{i.percentage}%</td>
                      <td className="py-2.5 px-3 text-slate-300">{i.avgTurnsToResolve}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-400">{i.resolutionRate}%</td>
                      <td className="py-2.5 px-3 text-amber-400 font-medium">{i.avgCsat} / 5.0</td>
                      <td className="py-2.5 px-3 text-rose-400 font-mono">{i.escalationCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            <div className="relative">
              <button
                onClick={() =>
                  handleCopyRaw(
                    selectedFile === 'conversations'
                      ? JSON.stringify(conversations, null, 2)
                      : selectedFile === 'engagement'
                      ? engagementCSV
                      : JSON.stringify(intentMetrics, null, 2)
                  )
                }
                className="absolute top-2 right-2 flex items-center space-x-1 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 py-1.5 rounded-xl text-[11px] backdrop-blur-md transition-all"
              >
                <Copy className="h-3 w-3" />
                <span>{copiedState ? 'Copied!' : 'Copy Raw Data'}</span>
              </button>
              <pre className="font-mono text-xs bg-black/40 text-indigo-200 border border-white/10 p-5 rounded-2xl overflow-x-auto leading-relaxed">
                {selectedFile === 'conversations'
                  ? JSON.stringify(conversations.slice(0, 5), null, 2) +
                    `\n\n// ... and ${conversations.length - 5} more records (Download to view full dataset)`
                  : selectedFile === 'engagement'
                  ? engagementCSV
                  : JSON.stringify(intentMetrics, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Upload or Import Custom Dataset Section (Drag & Drop + Manual Click as per Usability Patterns) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const files = e.dataTransfer.files;
          if (files && files.length > 0) {
            handleFileUpload(files[0]);
          }
        }}
        className={`bg-white/5 backdrop-blur-xl p-8 rounded-3xl border-2 border-dashed transition-all text-center ${
          isDragOver ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/20 hover:border-white/30'
        }`}
      >
        <Upload className="mx-auto h-8 w-8 text-indigo-400 mb-2" />
        <h3 className="text-sm font-semibold text-white">Import Custom Dataset File</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Drag and drop your own <strong>JSON</strong> conversation logs or <strong>CSV</strong> metric tables here, or click below to select a file from your computer.
        </p>

        <label
          htmlFor="manual-file-upload-input"
          className="mt-4 inline-flex items-center space-x-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 cursor-pointer backdrop-blur-md transition-all"
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Browse Files</span>
        </label>
        <input
          id="manual-file-upload-input"
          type="file"
          accept=".json,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
      </div>
    </div>
  );
};
