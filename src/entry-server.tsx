import { renderToString } from 'react-dom/server';
import { App } from './App';
import type { Lang } from './i18n/lang';

export function render(lang: Lang): string {
  return renderToString(<App lang={lang} />);
}
