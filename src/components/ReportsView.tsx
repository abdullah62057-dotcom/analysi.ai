import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  ListOrdered,
  Calendar,
  Layers,
  Award,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { PerformanceReport, DailyEngagementMetric, IntentMetric, ConversationRecord } from '../types';
import { calculateSummaryMetrics, downloadFile } from '../utils/datasetUtils';

interface ReportsViewProps {
  dailyMetrics: DailyEngagementMetric[];
  intentMetrics: IntentMetric[];
  conversations: ConversationRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  dailyMetrics,
  intentMetrics,
  conversations,
}) => {
  const [timeframe, setTimeframe] = useState<'Last 7 Days' | 'Last 14 Days' | 'Last 30 Days'>('Last 30 Days');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedState, setCopiedState] = useState(false);

  // Initial executive report
  const [reports, setReports] = useState<PerformanceReport[]>([
    {
      id: 'rep_init_01',
      title: 'Automated ChatBot Performance & User Engagement Audit',
      generatedAt: '2026-09-02T11:20:00Z',
      timeframe: 'Last 30 Days',
      overallScore: 89,
      grade: 'A',
      executiveSummary: `During the evaluated period, ChatBoot demonstrated strong engagement stickiness and exceptional self-service resolution. Daily active users reached a peak of 1,195 (+5.2% MoM growth), reflecting consistent conversational utility across developer, billing, and enterprise segments.

Autonomous resolution closed at 91.2%, outperforming the industry benchmark of 82%. Average session duration stabilized at 4.8 minutes across 4.9 conversational turns, indicating high efficiency with minimal drop-off before resolution. Customer satisfaction remained premier at 4.8 / 5.0.`,
      engagementHighlights: [
        {
          metric: 'Autonomous Deflection',
          value: '91.2%',
          trend: 'up',
          analysis: 'Over 9 out of 10 inquiries resolved without requiring human support agent intervention.',
        },
        {
          metric: '30-Day Retention Rate',
          value: '79.4%',
          trend: 'up',
          analysis: 'Substantial repeat usage for self-service billing management and developer webhook checks.',
        },
        {
          metric: 'Average Turn-around Speed',
          value: '420ms',
          trend: 'up',
          analysis: 'Streaming latency consistently under 500ms, minimizing customer wait time.',
        },
      ],
      intentAnalysis: [
        {
          intent: 'Billing & Subscriptions',
          health: 'healthy',
          observation: 'High resolution rate (91.5%) and strong CSAT (4.7/5). Self-service invoice retrieval is heavily utilized.',
        },
        {
          intent: 'Account & Authentication',
          health: 'healthy',
          observation: 'Top performing category with 94.8% resolution rate. SAML SSO automated guidance effectively deflects tickets.',
        },
        {
          intent: 'API & Webhook Integrations',
          health: 'needs-attention',
          observation: 'Lower resolution rate (71.0%) and elevated turn depth (6.4 turns). Developers encounter friction with HMAC signing keys.',
        },
        {
          intent: 'Technical Troubleshooting',
          health: 'needs-attention',
          observation: 'Escalations reached 21.8% on Unicode CSV export encoding queries. Fix scheduled in data pipeline.',
        },
      ],
      frictionPoints: [
        'Developer webhook signing verification causes high turn counts (6.4 turns avg) due to ambiguous secret key labels.',
        'Data export Unicode characters in CSVs triggered repeated escalation tickets to data engineering.',
        'Mobile app sessions experience slightly higher bounce rates (14.2%) compared to web widget sessions (7.1%).',
      ],
      recommendations: [
        {
          priority: 'High',
          title: 'Embed Interactive Code Snippets for Webhook Verification',
          description: 'Provide pre-filled HMAC-SHA256 copyable code samples in Python, Node.js, and cURL within API troubleshooting responses.',
          expectedImpact: '+12% resolution rate in developer category, reducing turns from 6.4 to 3.8.',
        },
        {
          priority: 'High',
          title: 'Prepend UTF-8 BOM on Automated CSV Exports',
          description: 'Ensure all CSV exports include UTF-8 Byte Order Marks to prevent Excel character misinterpretations.',
          expectedImpact: 'Eliminate ~18% of technical troubleshooting escalations immediately.',
        },
        {
          priority: 'Medium',
          title: 'Mobile Widget UI Optimization',
          description: 'Streamline mobile keypad interactions and sticky prompt chips to minimize mobile session bounces.',
          expectedImpact: 'Decrease mobile bounce rate from 14.2% to sub-8%.',
        },
        {
          priority: 'Medium',
          title: 'Proactive Churn Alerting via Webhooks',
          description: 'Trigger automated Slack notifications when enterprise customer sentiment dips below neutral.',
          expectedImpact: 'Safeguard up to $45,000 in monthly recurring account renewals.',
        },
      ],
      fullMarkdownContent: '',
    },
  ]);

  const [activeReportId, setActiveReportId] = useState<string>(reports[0].id);
  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const summary = calculateSummaryMetrics(dailyMetrics, conversations);

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metricsSummary: summary,
          intentData: intentMetrics,
          timeframe,
        }),
      });

      const data = await response.json();
      if (data && data.title) {
        const newReport: PerformanceReport = {
          ...data,
          id: data.id || `rep_${Date.now()}`,
          generatedAt: data.generatedAt || new Date().toISOString(),
          timeframe,
        };
        setReports((prev) => [newReport, ...prev]);
        setActiveReportId(newReport.id);
      }
    } catch (error) {
      console.error('Report generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMarkdown = (rep: PerformanceReport): string => {
    return `# ${rep.title}
**Timeframe:** ${rep.timeframe} | **Generated At:** ${new Date(rep.generatedAt).toLocaleString()}
**Overall Health Score:** ${rep.overallScore}/100 (Grade: ${rep.grade})

---

## 1. Executive Summary
${rep.executiveSummary}

---

## 2. Key Engagement Highlights
${rep.engagementHighlights.map((h) => `- **${h.metric}:** ${h.value} (${h.analysis})`).join('\n')}

---

## 3. Intent & Categorical Health
${rep.intentAnalysis.map((i) => `- **${i.intent} [${i.health.toUpperCase()}]:** ${i.observation}`).join('\n')}

---

## 4. Bottlenecks & Friction Points
${rep.frictionPoints.map((f, i) => `${i + 1}. ${f}`).join('\n')}

---

## 5. Actionable Optimization Roadmap
${rep.recommendations.map((r, i) => `### Recommendation ${i + 1} (${r.priority} Priority): ${r.title}\n${r.description}\n*Expected Impact:* ${r.expectedImpact}\n`).join('\n')}

---
*Report generated automatically by ChatBoot Engagement Analytics Studio*`;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown(activeReport);
    navigator.clipboard.writeText(md);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown(activeReport);
    downloadFile(`performance_report_${activeReport.timeframe.toLowerCase().replace(/\s+/g, '_')}.md`, md, 'text/markdown');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner & Generation Trigger */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight">
              Automated Performance <span className="font-bold text-indigo-400">Reports</span>
            </h1>
            <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
              AI Audit Engine
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Automated intelligence reports evaluating conversational friction, user retention, and resolution performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1.5 bg-white/5 p-1 rounded-2xl text-xs font-medium border border-white/10 backdrop-blur-md">
            {(['Last 7 Days', 'Last 14 Days', 'Last 30 Days'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  timeframe === tf ? 'bg-white/15 text-white shadow-inner font-semibold border border-white/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            id="trigger-generate-report-btn"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg transition-all ${
              isGenerating
                ? 'bg-indigo-600/50 cursor-not-allowed text-slate-300'
                : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-indigo-500/30'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Generating Audit with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate New Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Saved Reports Archive (Hidden in Print) */}
        <div className="space-y-4 print:hidden">
          <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Generated Reports Archive
            </h2>
            <div className="space-y-2">
              {reports.map((rep) => {
                const isActive = rep.id === activeReportId;
                return (
                  <button
                    key={rep.id}
                    onClick={() => setActiveReportId(rep.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs ${
                      isActive
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-white shadow-inner'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold truncate">{rep.timeframe}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                          rep.grade === 'A' || rep.grade === 'A+'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        Grade {rep.grade}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Score: {rep.overallScore}/100</span>
                      <span>{new Date(rep.generatedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl text-xs text-slate-300 space-y-2">
            <div className="flex items-center space-x-1.5 font-semibold text-white">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Automated Schedule</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Reports run automatically at midnight every Sunday to synthesize 7-day conversational health and highlight new user friction patterns.
            </p>
          </div>
        </div>

        {/* Right / Main Report Paper */}
        <div className="lg:col-span-3 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Report Top Toolbar */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-white/[0.02] p-4 sm:px-6 gap-3 print:hidden">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Generated: <strong className="text-slate-200">{new Date(activeReport.generatedAt).toLocaleString()}</strong></span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="copy-markdown-report-btn"
                onClick={handleCopyMarkdown}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl backdrop-blur-md transition-all"
                title="Copy report as markdown"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedState ? 'Copied Markdown' : 'Copy Markdown'}</span>
              </button>

              <button
                id="download-markdown-report-btn"
                onClick={handleDownloadMarkdown}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl backdrop-blur-md transition-all"
                title="Download .md file"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export .MD</span>
              </button>

              <button
                id="print-report-btn"
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl backdrop-blur-md transition-all"
                title="Print or save as PDF"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Report Body */}
          <div className="p-6 sm:p-8 space-y-8 print:p-0">
            {/* Header / Scorecard Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-white/15 text-white shadow-xl backdrop-blur-md">
              <div>
                <span className="inline-block rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-0.5 text-xs font-semibold mb-2">
                  Executive Performance Evaluation
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{activeReport.title}</h2>
                <p className="text-xs text-slate-400 mt-1">Timeframe Period: {activeReport.timeframe}</p>
              </div>

              <div className="flex items-center space-x-4 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shadow-inner">
                <div className="text-center">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Health Grade</span>
                  <span className="text-3xl font-extrabold text-emerald-400">{activeReport.grade}</span>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Index Score</span>
                  <span className="text-3xl font-extrabold text-white">{activeReport.overallScore}</span>
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white tracking-tight">1. Executive Summary</h3>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-300 leading-relaxed whitespace-pre-line backdrop-blur-md">
                {activeReport.executiveSummary}
              </div>
            </div>

            {/* Section 2: Engagement Highlights */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-tight">2. Engagement & Telemetry Highlights</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeReport.engagementHighlights.map((hl) => (
                  <div key={hl.metric} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-md">
                    <span className="text-xs font-semibold text-slate-400 block">{hl.metric}</span>
                    <span className="text-xl font-bold text-white block">{hl.value}</span>
                    <p className="text-xs text-slate-300 pt-1">{hl.analysis}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Intent Health Assessment */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white tracking-tight">3. Intent Breakdown & Resolution Health</h3>
              </div>
              <div className="space-y-2">
                {activeReport.intentAnalysis.map((item) => (
                  <div
                    key={item.intent}
                    className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs bg-white/5 border-white/10 hover:bg-white/[0.08] transition-all backdrop-blur-md"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          item.health === 'healthy'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.health === 'needs-attention'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {item.health === 'healthy' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {item.health === 'needs-attention' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {item.health.replace('-', ' ')}
                      </span>
                      <span className="font-semibold text-white">{item.intent}</span>
                    </div>
                    <span className="text-slate-300 sm:text-right max-w-md">{item.observation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Friction Points */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <h3 className="text-base font-bold text-white tracking-tight">4. Identified Friction & Drop-off Root Causes</h3>
              </div>
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-xs text-rose-200 backdrop-blur-md">
                {activeReport.frictionPoints.map((f, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="font-bold text-rose-400 shrink-0">{i + 1}.</span>
                    <span className="text-slate-200">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Optimization Roadmap */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <ListOrdered className="h-4 w-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white tracking-tight">5. Actionable Performance Optimization Roadmap</h3>
              </div>
              <div className="space-y-3">
                {activeReport.recommendations.map((rec, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        {i + 1}. {rec.title}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase ${
                          rec.priority === 'High'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : rec.priority === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{rec.description}</p>
                    <div className="pt-1 text-[11px] font-semibold text-indigo-400 flex items-center space-x-1.5">
                      <span>Expected Outcome:</span>
                      <span className="text-slate-300 font-normal">{rec.expectedImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
