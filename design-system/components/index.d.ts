// Luka Engels Monochrome: component props (documentation). window.LE.<Component>
import type { ReactNode, MouseEventHandler, ChangeEventHandler } from 'react';

export type IconName = 'mail' | 'location' | 'check-circle' | 'print' | 'linkedin' | 'github';

/** A full-width band on a black or white ground that re-scopes every colour token. */
export interface SectionProps { ground?: 'dark' | 'light'; id?: string; className?: string; children?: ReactNode }
export declare function Section(props: SectionProps): JSX.Element;

/** The centred, light-weight title that opens every section, with an optional one-line intro. */
export interface SectionHeadingProps { title: ReactNode; intro?: ReactNode }
export declare function SectionHeading(props: SectionHeadingProps): JSX.Element;

/** A square, 1px-bordered control that inverts to a solid ink fill on hover. */
export interface ButtonProps { variant?: 'outline' | 'quiet' | 'solid'; size?: 'sm' | 'md'; href?: string; type?: 'button' | 'submit'; icon?: IconName; disabled?: boolean; onClick?: MouseEventHandler; className?: string; children?: ReactNode }
export declare function Button(props: ButtonProps): JSX.Element;

/** A static bordered label for a skill, a technology or a topic tag. It is not clickable; use `Button` size sm for anything that links. */
export interface ChipProps { variant?: 'default' | 'quiet' | 'tag'; size?: 'sm' | 'md'; as?: 'span' | 'li'; className?: string; children?: ReactNode }
export declare function Chip(props: ChipProps): JSX.Element;

/** A 1px ink-bordered box with no fill, no shadow and no radius, holding a title and content. */
export interface CardProps { title?: ReactNode; body?: ReactNode; compact?: boolean; className?: string; children?: ReactNode }
export declare function Card(props: CardProps): JSX.Element;

/** A sub-section heading (Space Grotesk 500, 24px) underlined by a full-ink 1px rule. */
export interface RuledHeadingProps { as?: 'h2' | 'h3' | 'h4'; children?: ReactNode }
export declare function RuledHeading(props: RuledHeadingProps): JSX.Element;

/** One position in a career timeline: a top ink rule, meta in the left third, description and dot bullets in the right two thirds. */
export interface RoleEntryProps { title: ReactNode; organisation: ReactNode; period: ReactNode; location?: ReactNode; context?: ReactNode; description?: ReactNode; highlights?: ReactNode[]; className?: string }
export declare function RoleEntry(props: RoleEntryProps): JSX.Element;

/** Term and value pairs on one line each: term left in Inter, value right in Space Grotesk with 0.05em tracking in `ink-muted`, a `rule-subtle` line under each row. */
export interface DefinitionListProps { items: { term: string; value: ReactNode }[] }
export declare function DefinitionList(props: DefinitionListProps): JSX.Element;

/** An entry in a writing listing: optional cover, meta line, title, summary, tags and action buttons, under a top ink rule. */
export interface ArticleCardProps { href: string; title: ReactNode; summary: ReactNode; meta: ReactNode; coverImage?: string; tags?: string[]; actions?: ReactNode }
export declare function ArticleCard(props: ArticleCardProps): JSX.Element;

/** A labelled text input or textarea: 18px Inter Light label above a transparent, square, 1px ink-bordered control. */
export interface FieldProps { id: string; label: ReactNode; type?: string; placeholder?: string; required?: boolean; autoComplete?: string; multiline?: boolean; rows?: number; value?: string; defaultValue?: string; onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> }
export declare function Field(props: FieldProps): JSX.Element;

/** An inline SVG icon from the system's small set, drawn in `currentColor`. */
export interface IconProps { name: IconName; size?: number; label?: string; className?: string }
export declare function Icon(props: IconProps): JSX.Element;

/** The terminal-prompt mark followed by the name in Space Grotesk 300 at 20px. */
export interface MarkProps { name: ReactNode; href?: string }
export declare function Mark(props: MarkProps): JSX.Element;

/** Language links separated by slashes, "EN / DE", in Space Grotesk 14px with 0.05em tracking. */
export interface LanguageSwitchProps { languages: { code: string; href: string; onSelect?: MouseEventHandler }[]; current: string; label?: string }
export declare function LanguageSwitch(props: LanguageSwitchProps): JSX.Element;

/** The top bar: mark and name left, a few in-page links centre, actions right, on `header-scrim` (black at 90%) in every section. */
export interface HeaderProps { name: ReactNode; homeHref?: string; links?: { href: string; label: ReactNode }[]; actions?: ReactNode; fixed?: boolean; hidden?: boolean }
export declare function Header(props: HeaderProps): JSX.Element;

/** The page footer on the black ground: mark left, links centre, social icons right, a copyright line under a `rule-subtle` divider. */
export interface FooterProps { name: ReactNode; links?: { href: string; label: ReactNode }[]; social?: { href: string; icon: IconName; label: string }[]; copyright: ReactNode }
export declare function Footer(props: FooterProps): JSX.Element;

/** A bar at the bottom of the viewport offering the page in another language, with an accept link and a dismiss button. */
export interface OfferBarProps { message: ReactNode; acceptHref: string; acceptLabel: ReactNode; dismissLabel: ReactNode; onAccept?: MouseEventHandler; onDismiss?: MouseEventHandler; lang?: string; label?: string; fixed?: boolean }
export declare function OfferBar(props: OfferBarProps): JSX.Element;

/** Long-form article typography: Inter 400 at 17px/1.75 in `prose-ink`, Space Grotesk 500 headings, a 2px-ruled pull quote, monospace code on a flat panel, bordered tables. */
export interface ProseProps { html?: string; className?: string; children?: ReactNode }
export declare function Prose(props: ProseProps): JSX.Element;

