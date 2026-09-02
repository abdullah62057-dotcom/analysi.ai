import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ChatbotView } from './components/ChatbotView';
import { AnalyticsView } from './components/AnalyticsView';
import { DatasetView } from './components/DatasetView';
import { ReportsView } from './components/ReportsView';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_DAILY_METRICS,
  INITIAL_HOURLY_METRICS,
  INITIAL_INTENT_METRICS,
} from './data/initialDatasets';
import { ConversationRecord, DailyEngagementMetric, IntentMetric } from './types';
import { downloadFile } from './utils/datasetUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'datasets' | 'reports'>('chat');
  const [conversations, setConversations] = useState<ConversationRecord[]>(INITIAL_CONVERSATIONS);
  const [dailyMetrics, setDailyMetrics] = useState<DailyEngagementMetric[]>(INITIAL_DAILY_METRICS);
  const [intentMetrics, setIntentMetrics] = useState<IntentMetric[]>(INITIAL_INTENT_METRICS);
  const [hourlyMetrics, setHourlyMetrics] = useState(INITIAL_HOURLY_METRICS);

  // Appending conversation to dataset
  const handleAddConversation = (newRecord: ConversationRecord) => {
    setConversations((prev) => [newRecord, ...prev]);

    // Dynamically increment today's engagement metrics
    setDailyMetrics((prev) => {
      const updated = [...prev];
      const today = updated[updated.length - 1];
      if (today) {
        updated[updated.length - 1] = {
          ...today,
          totalSessions: today.totalSessions + 1,
          totalMessages: today.totalMessages + newRecord.totalMessages,
          activeUsers: today.activeUsers + 1,
        };
      }
      return updated;
    });

    // Update intent metrics if matches
    setIntentMetrics((prev) => {
      return prev.map((im) => {
        if (im.intent === newRecord.primaryIntent) {
          return {
            ...im,
            count: im.count + 1,
          };
        }
        return im;
      });
    });
  };

  const handleResetDatasets = () => {
    setConversations(INITIAL_CONVERSATIONS);
    setDailyMetrics(INITIAL_DAILY_METRICS);
    setIntentMetrics(INITIAL_INTENT_METRICS);
  };

  const handleImportDataset = (importedRecords: ConversationRecord[]) => {
    setConversations((prev) => [...importedRecords, ...prev]);
  };

  const handleQuickDownload = () => {
    const bundle = {
      title: 'ChatBoot User Engagement & Dataset Export',
      exportedAt: new Date().toISOString(),
      activeUsersSummary: dailyMetrics[dailyMetrics.length - 1]?.activeUsers,
      conversationsCount: conversations.length,
      datasets: {
        conversations,
        dailyMetrics,
        intentMetrics,
      },
    };
    downloadFile('chatboot_full_dataset_bundle.json', JSON.stringify(bundle, null, 2), 'application/json');
  };

  const currentDau = dailyMetrics[dailyMetrics.length - 1]?.activeUsers || 1195;

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-200 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Luminous Ambient Background Glow Orbs */}
      <div className="fixed top-[-120px] left-[-120px] w-[550px] h-[550px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none z-0"></div>
      <div className="fixed top-[35%] right-[25%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none z-0"></div>

      {/* Top Navigation */}
      <div className="relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onQuickDownload={handleQuickDownload}
          totalConversations={conversations.length}
          currentDau={currentDau}
        />
      </div>

      {/* Main Content View Container */}
      <main className="flex-1 pb-16 relative z-10">
        {activeTab === 'chat' && (
          <ChatbotView onSaveConversationToDataset={handleAddConversation} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            dailyMetrics={dailyMetrics}
            intentMetrics={intentMetrics}
            hourlyMetrics={hourlyMetrics}
            conversations={conversations}
            onNavigateToReports={() => setActiveTab('reports')}
          />
        )}

        {activeTab === 'datasets' && (
          <DatasetView
            conversations={conversations}
            dailyMetrics={dailyMetrics}
            intentMetrics={intentMetrics}
            onAddConversation={handleAddConversation}
            onResetDatasets={handleResetDatasets}
            onImportDataset={handleImportDataset}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            dailyMetrics={dailyMetrics}
            intentMetrics={intentMetrics}
            conversations={conversations}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-2xl py-4 text-center text-xs text-slate-400 print:hidden">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong className="text-white font-medium">ChatBoot AI Analytics Studio</strong> &mdash; Automated Telemetry, Datasets & Reporting
          </span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('datasets')}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Export Datasets
            </button>
            <span className="text-white/20">&bull;</span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Run Performance Audit
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
