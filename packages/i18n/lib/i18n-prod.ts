import type { DevLocale, MessageKey } from './type';
import { getMessageFromLocale } from './getMessageFromLocale';

type I18nValue = {
  message: string;
  placeholders?: Record<string, { content?: string; example?: string }>;
};

type LocaleChangeListener = (locale: DevLocale) => void;

const listeners: Set<LocaleChangeListener> = new Set();

function translate(locale: DevLocale, key: MessageKey, substitutions?: string | string[]) {
  const value = (getMessageFromLocale(locale) as Record<string, I18nValue>)[key];
  let message = value?.message ?? key;
  if (value?.placeholders) {
    Object.entries(value.placeholders).forEach(([k, { content }]) => {
      if (!content) {
        return;
      }
      message = message.replace(new RegExp(`\\$${k}\\$`, 'gi'), content);
    });
  }
  if (!substitutions) {
    return message;
  }
  if (Array.isArray(substitutions)) {
    return substitutions.reduce((acc, cur, idx) => acc.replace(`$${idx + 1}`, cur), message);
  }
  return message.replace(/\$(\d+)/, substitutions);
}

function removePlaceholder(message: string) {
  return message.replace(/\$\d+/g, '');
}

function createTranslateFunction(currentLocale: DevLocale) {
  return (key: MessageKey, substitutions?: string | string[]) => {
    return removePlaceholder(translate(currentLocale, key, substitutions));
  };
}

class I18nWrapper {
  private _locale: DevLocale = 'en';
  private _translate = createTranslateFunction(this._locale);

  get locale() {
    return this._locale;
  }

  setLocale(locale: DevLocale) {
    this._locale = locale;
    this._translate = createTranslateFunction(locale);
    listeners.forEach(listener => listener(locale));
  }

  subscribe(listener: LocaleChangeListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  t = (key: MessageKey, substitutions?: string | string[]) => {
    return this._translate(key, substitutions);
  };
}

const i18nInstance = new I18nWrapper();

export const t = i18nInstance.t;
export const setLocale = (locale: DevLocale) => i18nInstance.setLocale(locale);
export const subscribeLocale = (listener: LocaleChangeListener) => i18nInstance.subscribe(listener);
export const getLocale = () => i18nInstance.locale;
