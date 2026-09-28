import type { Lang } from './lang';
import type { Messages } from './messages';
import { en } from './en';

// Temporary: German points at English until de.ts exists.
export const dictionaries: Record<Lang, Messages> = { en, de: en };
