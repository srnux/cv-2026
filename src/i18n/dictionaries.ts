import type { Lang } from './lang';
import type { Messages } from './messages';
import { en } from './en';
import { de } from './de';

export const dictionaries: Record<Lang, Messages> = { en, de };
