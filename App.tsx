
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, FirewallStatus, RuleType, Rule, BlockLog } from './types';
import { INITIAL_RULES, INITIAL_LOGS } from './constants';
import Dashboard from './components/Dashboard';
import RulesManager from './components/RulesManager';
import Trash from './components/Trash';
import Simulator from './components/Simulator';
import Navigation from './components/Navigation';
import SystemStatusBar from './components/SystemStatusBar';
import SystemDesktop from './components/SystemDesktop';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    rules: INITIAL_RULES,
    logs: INITIAL_LOGS,
    status: FirewallStatus.ACTIVE,
    autoReplyEnabled: true,
    autoReplyMessage: '您好，目前不方便接听，稍后回电。'
  });

  const [isAppOpen, setIsAppOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'trash' | 'simulator'>('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('guardia_m3_state_v2');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('guardia_m3_state_v2', JSON.stringify(state));
  }, [state]);

  const handleToggleStatus = () => {
    setState(prev => ({
      ...prev,
      status: prev.status === FirewallStatus.ACTIVE ? FirewallStatus.PAUSED : FirewallStatus.ACTIVE
    }));
  };

  const handleUpdateAutoReply = (enabled: boolean, message: string) => {
    setState(prev => ({ ...prev, autoReplyEnabled: enabled, autoReplyMessage: message }));
  };

  const handleAddRule = (type: RuleType, value: string, label?: string) => {
    const newRule: Rule = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      value,
      label,
      createdAt: Date.now()
    };
    setState(prev => ({ ...prev, rules: [...prev.rules, newRule] }));
  };

  const handleRemoveRule = (id: string) => {
    setState(prev => ({ ...prev, rules: prev.rules.filter(r => r.id !== id) }));
  };

  const handleClearTrash = () => {
    setState(prev => ({ ...prev, logs: [] }));
  };

  const processIncoming = useCallback((type: 'SMS' | 'CALL', number: string, content?: string) => {
    if (state.status === FirewallStatus.PAUSED) return;
    const formattedNumber = number.replace(/\s/g, '');
    const isWhitelisted = state.rules.some(r => r.type === RuleType.WHITELIST && r.value.replace(/\s/g, '') === formattedNumber);
    if (isWhitelisted) {
      if (type === 'SMS' && state.autoReplyEnabled) {
        const replyLog: BlockLog = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'AUTO_REPLY',
          number,
          content: state.autoReplyMessage,
          timestamp: Date.now(),
          reason: '已自动回复白名单用户'
        };
        setState(prev => ({ ...prev, logs: [replyLog, ...prev.logs] }));
      }
      return;
    }
    const isBlacklisted = state.rules.some(r => r.type === RuleType.BLACKLIST && r.value.replace(/\s/g, '') === formattedNumber);
    if (isBlacklisted) {
      const log: BlockLog = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        number,
        content,
        timestamp: Date.now(),
        reason: '黑名单号码拦截'
      };
      setState(prev => ({ ...prev, logs: [log, ...prev.logs] }));
      return;
    }
    if (type === 'SMS' && content) {
      const matchingRule = state.rules.find(r => r.type === RuleType.CONTENT && content.toLowerCase().includes(r.value.toLowerCase()));
      if (matchingRule) {
        const log: BlockLog = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          number,
          content,
          timestamp: Date.now(),
          reason: `垃圾短信关键字: ${matchingRule.value}`
        };
        setState(prev => ({ ...prev, logs: [log, ...prev.logs] }));
      }
    }
  }, [state.status, state.rules, state.autoReplyEnabled, state.autoReplyMessage]);

  const renderAppContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} onToggleStatus={handleToggleStatus} onUpdateAutoReply={handleUpdateAutoReply} />;
      case 'rules': return <RulesManager rules={state.rules} onAddRule={handleAddRule} onRemoveRule={handleRemoveRule} />;
      case 'trash': return <Trash logs={state.logs} onClear={handleClearTrash} />;
      case 'simulator': return <Simulator onSimulate={processIncoming} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#1a1c1e] flex flex-col relative select-none overflow-hidden shadow-2xl border-x border-white/5">
      {/* 统一系统状态栏 */}
      <SystemStatusBar />

      {!isAppOpen ? (
        <SystemDesktop onOpenApp={() => setIsAppOpen(true)} />
      ) : (
        <div className="flex-1 flex flex-col animate-in slide-in-from-bottom duration-500">
          {/* 应用标题栏 */}
          <header className="h-[64px] flex items-center px-6 sticky top-0 bg-[#1a1c1e] z-30 justify-between">
             <button 
               onClick={() => setIsAppOpen(false)}
               className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5"
             >
               <span className="text-xl">←</span>
             </button>
            <div className="flex-1 text-center font-medium text-[#e2e2e6] tracking-wide mr-10">
              {activeTab === 'dashboard' ? '卫士核心' : activeTab === 'rules' ? '规则配置' : activeTab === 'trash' ? '安全日志' : '调试工具'}
            </div>
          </header>

          {/* 应用主体区域 */}
          <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {renderAppContent()}
          </main>

          {/* 应用内底部导航 */}
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* 虚拟手势条 (Home Indicator) */}
          <div className="h-6 flex justify-center items-center bg-[#1a1c1e]">
            <button 
              onClick={() => setIsAppOpen(false)}
              className="w-24 h-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
            ></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
