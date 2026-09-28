/**
 * Every user-visible string on the home page, per language. en.ts and de.ts
 * are both typed against this, so a key missing from either fails
 * `pnpm typecheck` instead of shipping a blank.
 *
 * Plain strings only, no JSX: head.ts renders the meta section into <head>
 * outside React, and the Vite config imports it at build time.
 */
export type Role = {
  title: string;
  company: string;
  context: string;
  location: string;
  period: string;
  description: string;
  highlights?: string[];
};

export type SkillCategory = {
  /** Anchor id, shared by both languages so hero links resolve on either page. */
  id: string;
  category: string;
  lead?: boolean;
  skills: string[];
};

export type Messages = {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    /** og:locale, e.g. en_GB. */
    ogLocale: string;
    imageAlt: string;
    jsonLd: {
      description: string;
      jobTitle: string;
      seeks: string;
      nationality: [string, string];
      languages: [string, string, string, string];
    };
  };
  nav: {
    home: string;
    about: string;
    experience: string;
    skills: string;
    writing: string;
    contact: string;
    portfolio: string;
    more: string;
    cv: string;
    cvTitle: string;
    switchLanguage: string;
  };
  hero: {
    imageAlt: string;
    title: string;
    tagline: string;
    intro: string;
    focusAreas: { label: string; href: string }[];
    moreLabel: string;
  };
  about: {
    heading: string;
    paragraphs: string[];
    facts: { figure: string; detail: string }[];
  };
  experience: {
    heading: string;
    roles: Role[];
    showEarlier: string;
    showLess: string;
  };
  skills: {
    heading: string;
    intro: string;
    categories: SkillCategory[];
  };
  education: {
    heading: string;
    academicHeading: string;
    items: { degree: string; institution: string; period: string; description: string }[];
    certificationsHeading: string;
    certifications: string[];
    languagesHeading: string;
    languages: { name: string; level: string }[];
    citizenshipHeading: string;
    citizenship: string;
    citizenshipNote: string;
    baseHeading: string;
    base: string;
    baseNote: string;
  };
  projects: {
    heading: string;
    technologiesHeading: string;
    cta: string;
    items: { title: string; description: string; technologies: string[] }[];
  };
  writing: {
    heading: string;
    intro: string;
    minRead: (minutes: number) => string;
    read: string;
    repo: string;
    /** Shown on the German page for an article that exists only in English. */
    englishOnly: string;
  };
  contact: {
    heading: string;
    lookingForHeading: string;
    lookingFor: [string, string];
    location: string;
    linkedinLabel: string;
    githubLabel: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    sent: string;
    errorBefore: string;
    errorAfter: string;
    mailtoFrom: string;
  };
  footer: {
    rights: string;
    legalNotice: { label: string; href: string };
    privacy: { label: string; href: string };
  };
};
