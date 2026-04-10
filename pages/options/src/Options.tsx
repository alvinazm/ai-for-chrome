import { useState, useEffect } from 'react';
import '@src/Options.css';
import { Button } from '@extension/ui';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { t, subscribeLocale } from '@extension/i18n';
import { FiSettings, FiCpu, FiShield, FiTrendingUp, FiHelpCircle } from 'react-icons/fi';
import { GeneralSettings } from './components/GeneralSettings';
import { ModelSettings } from './components/ModelSettings';
import { FirewallSettings } from './components/FirewallSettings';
import { AnalyticsSettings } from './components/AnalyticsSettings';

type TabTypes = 'general' | 'models' | 'firewall' | 'analytics' | 'help';

const TAB_ICONS: { id: TabTypes; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'general', icon: FiSettings },
  { id: 'models', icon: FiCpu },
  { id: 'firewall', icon: FiShield },
  { id: 'analytics', icon: FiTrendingUp },
  { id: 'help', icon: FiHelpCircle },
];

const TAB_LABEL_KEYS: Record<
  TabTypes,
  | 'options_tabs_general'
  | 'options_tabs_models'
  | 'options_tabs_firewall'
  | 'options_tabs_analytics'
  | 'options_tabs_help'
> = {
  general: 'options_tabs_general',
  models: 'options_tabs_models',
  firewall: 'options_tabs_firewall',
  analytics: 'options_tabs_analytics',
  help: 'options_tabs_help',
};

const Options = () => {
  const [activeTab, setActiveTab] = useState<TabTypes>('models');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [, setLocaleVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeLocale(() => {
      setLocaleVersion(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  // Check for dark mode preference
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleTabClick = (tabId: TabTypes) => {
    if (tabId === 'help') {
      window.open('https://nanobrowser.ai/docs', '_blank');
    } else {
      setActiveTab(tabId);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings isDarkMode={isDarkMode} />;
      case 'models':
        return <ModelSettings isDarkMode={isDarkMode} />;
      case 'firewall':
        return <FirewallSettings isDarkMode={isDarkMode} />;
      case 'analytics':
        return <AnalyticsSettings isDarkMode={isDarkMode} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex min-h-screen min-w-[768px] ${isDarkMode ? 'bg-slate-900' : "bg-[url('/bg.jpg')] bg-cover bg-center"} ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
      {/* Vertical Navigation Bar */}
      <nav
        className={`w-48 border-r ${isDarkMode ? 'border-slate-700 bg-slate-800/80' : 'border-white/20 bg-[#0EA5E9]/10'} backdrop-blur-sm`}>
        <div className="p-4">
          <h1 className={`mb-6 text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {t('options_nav_header')}
          </h1>
          <ul className="space-y-2">
            {TAB_ICONS.map(item => (
              <li key={item.id}>
                <Button
                  onClick={() => handleTabClick(item.id)}
                  className={`flex w-full items-center space-x-2 rounded-lg px-4 py-2 text-left text-base 
                    ${
                      activeTab !== item.id
                        ? `${isDarkMode ? 'bg-slate-700/70 text-gray-300 hover:text-white' : 'bg-[#0EA5E9]/15 font-medium text-gray-700 hover:text-white'} backdrop-blur-sm`
                        : `${isDarkMode ? 'bg-sky-800/50' : ''} text-white backdrop-blur-sm`
                    }`}>
                  <item.icon className="h-4 w-4" />
                  <span>{t(TAB_LABEL_KEYS[item.id])}</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={`flex-1 ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/10'} p-8 backdrop-blur-sm`}>
        <div className="mx-auto min-w-[512px] max-w-screen-lg">{renderTabContent()}</div>
      </main>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <div>Loading...</div>), <div>Error Occurred</div>);
