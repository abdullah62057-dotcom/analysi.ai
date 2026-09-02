import React from 'react';
import { MessageSquare, BarChart3, Database, FileText, Download, Sparkles, Activity } from 'lucide-react';

interface NavbarProps {
  activeTab: 'chat' | 'analytics' | 'datasets' | 'reports';
  setActiveTab: (tab: 'chat' | 'analytics' | 'datasets' | 'reports') => void;
  onQuickDownload: () => void;
  totalConversations: number;
  currentDau: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onQuickDownload,
  totalConversations,
  currentDau,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#05050a]/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white tracking-tight text-base sm:text-lg">ChatBoot</span>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active v3.8
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Engagement Analytics & Performance Studio</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
          <button
            id="nav-tab-chat"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-xl transition-all ${
              activeTab === 'chat'
                ? 'bg-white/15 text-white font-semibold shadow-inner border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chatbot</span>
          </button>

          <button
            id="nav-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-xl transition-all ${
              activeTab === 'analytics'
                ? 'bg-white/15 text-white font-semibold shadow-inner border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </button>

          <button
            id="nav-tab-datasets"
            onClick={() => setActiveTab('datasets')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-xl transition-all ${
              activeTab === 'datasets'
                ? 'bg-white/15 text-white font-semibold shadow-inner border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Dataset Files</span>
          </button>

          <button
            id="nav-tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-xl transition-all ${
              activeTab === 'reports'
                ? 'bg-white/15 text-white font-semibold shadow-inner border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Automated Reports</span>
          </button>
        </nav>

        {/* Right action metrics & quick download */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl backdrop-blur-md">
            <div className="flex items-center space-x-1.5">
              <Activity className="h-3.5 w-3.5 text-indigo-400" />
              <span>DAU: <strong className="text-white">{currentDau.toLocaleString()}</strong></span>
            </div>
            <span className="text-white/20">|</span>
            <div>
              <span>Logs: <strong className="text-white">{totalConversations}</strong></span>
            </div>
          </div>

          <button
            id="quick-download-dataset-btn"
            onClick={onQuickDownload}
            className="flex items-center space-x-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all"
            title="Download CSV & JSON Datasets"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Dataset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
