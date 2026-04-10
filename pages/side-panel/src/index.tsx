import { createRoot } from 'react-dom/client';
import '@src/index.css';
import { generalSettingsStore } from '@extension/storage';
import { setLocale, type DevLocale } from '@extension/i18n';
import SidePanel from '@src/SidePanel';

async function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);

  const settings = await generalSettingsStore.getSettings();
  setLocale(settings.language as DevLocale);

  root.render(<SidePanel />);
}

init();
