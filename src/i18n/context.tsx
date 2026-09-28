import { createContext, useContext, type ReactNode } from 'react';
import type { Lang } from './lang';
import type { Messages } from './messages';
import { dictionaries } from './dictionaries';

/**
 * The page language comes from the URL: the server is told which one it is
 * rendering, and the client reads it from location.pathname before hydrating.
 * The same URL therefore always yields the same language on both sides.
 */
const LangContext = createContext<Lang>('en');

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = (): Lang => useContext(LangContext);

export const useMessages = (): Messages => dictionaries[useContext(LangContext)];
