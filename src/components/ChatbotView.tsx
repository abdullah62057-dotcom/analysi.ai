import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, CheckCircle2, Clock, Tag, Smile, ShieldCheck, ArrowRight, Save } from 'lucide-react';
import { ChatMessage, ConversationRecord } from '../types';

interface ChatbotViewProps {
  onSaveConversationToDataset: (record: ConversationRecord) => void;
}

const STARTER_PROMPTS = [
  'How do I download our monthly VAT invoice for accounting?',
  'Our webhook listener is getting a 401 unauthorized status.',
  'Can we enforce Okta SAML SSO for all workspace members?',
  'What are the pricing details and SLAs for the Enterprise tier?',
  'How do I export customer chat engagement analytics to CSV?',
];

export const ChatbotView: React.FC<ChatbotViewProps> = ({ onSaveConversationToDataset }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: "Hello! I am ChatBoot AI, your dedicated assistant. I'm equipped with intent classification, real-time engagement telemetry, and knowledge across billing, integrations, authentication, and platform features. How may I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'Platform Assistance',
      responseTimeMs: 240,
      sentiment: 'positive',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState('Friendly Technical & Customer Specialist');
  const [savedNotification, setSavedNotification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = updatedMessages
        .filter((m) => m.sender !== 'system')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          persona,
        }),
      });

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I've received your request. Let me check the details for you.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent || 'General Inquiries',
        responseTimeMs: data.responseTimeMs || 350,
        sentiment: data.sentiment || 'positive',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to query chatbot API:', error);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: "I'm experiencing a brief network sync delay. However, feel free to try your query again or test one of the starter prompts!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: 'System Notice',
        responseTimeMs: 120,
        sentiment: 'neutral',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveToDataset = () => {
    if (messages.length <= 1) return;

    const lastBotMessage = [...messages].reverse().find((m) => m.sender === 'assistant');
    const primaryIntent = lastBotMessage?.intent || 'General Inquiries';
    const sentiment = lastBotMessage?.sentiment || 'positive';

    const newRecord: ConversationRecord = {
      conversationId: `conv_${Date.now()}`,
      userId: `usr_${Math.floor(1000 + Math.random() * 9000)}`,
      userName: 'Live Session Tester',
      userEmail: 'tester@workspace.local',
      channel: 'Web Widget',
      startedAt: new Date(Date.now() - messages.length * 25000).toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: messages.length * 25,
      totalMessages: messages.length,
      primaryIntent,
      sentiment,
      status: 'resolved',
      csatRating: 5,
      turns: messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
        timestamp: new Date().toISOString(),
        responseTimeMs: m.responseTimeMs,
      })),
    };

    onSaveConversationToDataset(newRecord);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3500);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        sender: 'assistant',
        text: "Chat session refreshed. What would you like to explore or troubleshoot next?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: 'Session Reset',
        responseTimeMs: 180,
        sentiment: 'positive',
      },
    ]);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Banner / Context */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight">
              Interactive Chatbot <span className="font-bold text-indigo-400">Environment</span>
            </h1>
            <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              Live Evaluation
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Interact with ChatBoot. Each interaction tracks response latency, intent classification, and sentiment telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Persona selector */}
          <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs backdrop-blur-md">
            <span className="text-slate-400 font-medium">Persona:</span>
            <select
              id="chatbot-persona-select"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="bg-transparent font-medium text-slate-200 outline-none cursor-pointer [&>option]:bg-[#0c0c14] [&>option]:text-slate-200"
            >
              <option value="Friendly Technical & Customer Specialist">Technical & Customer Specialist</option>
              <option value="Billing & Subscription Advisor">Billing & Subscription Advisor</option>
              <option value="Enterprise Solutions Consultant">Enterprise Solutions Consultant</option>
              <option value="Concise Developer Assistant">Concise Developer Assistant</option>
            </select>
          </div>

          <button
            id="reset-chat-btn"
            onClick={handleResetChat}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md transition-all"
            title="Clear current messages"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>

          <button
            id="save-session-btn"
            onClick={handleSaveToDataset}
            disabled={messages.length <= 1}
            className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              messages.length > 1
                ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30'
                : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
            title="Append this conversation to the live analytics dataset"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Commit to Dataset</span>
          </button>
        </div>
      </div>

      {savedNotification && (
        <div className="mb-4 flex items-center space-x-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md p-3.5 text-sm text-emerald-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Session successfully appended to conversation logs and metrics dataset! Check the <strong>Dataset Files</strong> or <strong>Analytics</strong> tab.</span>
        </div>
      )}

      {/* Main Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left/Main: Conversation Window */}
        <div className="lg:col-span-3 flex flex-col h-[650px] bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl text-xs font-medium shadow-md ${
                      isUser
                        ? 'bg-indigo-600/80 border border-indigo-400/30 text-white'
                        : 'bg-indigo-500 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur-md ${
                        isUser
                          ? 'bg-indigo-600/90 text-white rounded-tr-xs border border-indigo-400/30 shadow-lg shadow-indigo-900/30'
                          : 'bg-white/10 text-slate-100 border border-white/15 rounded-tl-xs shadow-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Metadata indicators for assistant turns */}
                    {!isUser && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 px-1 pt-0.5">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>{msg.timestamp}</span>
                        </span>

                        {msg.responseTimeMs && (
                          <span className="inline-flex items-center rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 border border-white/10">
                            {msg.responseTimeMs}ms
                          </span>
                        )}

                        {msg.intent && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/30">
                            <Tag className="h-2.5 w-2.5" />
                            {msg.intent}
                          </span>
                        )}

                        {msg.sentiment && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium border ${
                              msg.sentiment === 'positive'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : msg.sentiment === 'negative'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-white/5 text-slate-300 border-white/10'
                            }`}
                          >
                            <Smile className="h-2.5 w-2.5" />
                            {msg.sentiment}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-xs bg-white/10 border border-white/15 backdrop-blur-md px-4 py-3 text-sm text-slate-300 flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"></span>
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs text-slate-400 ml-1">Analyzing intent & generating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt input area */}
          <div className="border-t border-white/10 bg-white/[0.02] backdrop-blur-xl p-4">
            <div className="flex items-end gap-2 bg-white/5 rounded-2xl border border-white/10 p-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-inner backdrop-blur-md transition-all">
              <textarea
                id="chatbot-input-textarea"
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about billing, API integrations, user accounts, or feature troubleshooting..."
                className="flex-1 resize-none bg-transparent px-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                id="send-message-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                  inputText.trim() && !isLoading
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30'
                    : 'bg-white/5 text-slate-600 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Press <strong className="text-slate-300">Enter</strong> to send, <strong className="text-slate-300">Shift + Enter</strong> for a new line</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Live Telemetry Connected</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Quick Starter Prompts & Telemetry Info */}
        <div className="space-y-6">
          {/* Quick Prompts Panel */}
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Recommended Test Prompts</h2>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Click any prompt to simulate real customer inquiries across multiple intents:
            </p>
            <div className="space-y-2">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-2xl text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between group backdrop-blur-md"
                >
                  <span className="line-clamp-2 leading-relaxed">{prompt}</span>
                  <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Live Engagement Specs */}
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl space-y-3">
            <h2 className="text-sm font-semibold text-white">Current Session Specs</h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-slate-400">Session Turns:</span>
                <span className="font-semibold text-white">{messages.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-slate-400">Channel Emulated:</span>
                <span className="font-semibold text-white">Web Widget</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-slate-400">Latency Baseline:</span>
                <span className="font-semibold text-emerald-400">&lt; 450ms</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Dataset Sync:</span>
                <span className="font-semibold text-indigo-400">On-demand Commit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
