/**
 * Regenerate the two printable A4 CV pages in public/ from a single content
 * model, so the English and German versions cannot drift apart.
 *
 *   pnpm cv
 *
 * This script does NOT read any .docx file. The content model below is the
 * source of truth for the website, and it is a deliberate copy rather than a
 * live import: the Word CVs live in a private folder outside this repository
 * and must never become a build dependency of a public repo.
 *
 * SYNCED_FROM below records which Word CV the copy was last reconciled against.
 * Luka versions his CVs by number and never overwrites an earlier one, so when a
 * higher-numbered file exists, re-read it, update the model here, and bump
 * SYNCED_FROM. Nothing breaks if that is forgotten; the pages simply keep saying
 * what they said last time, which is the failure mode this file exists to make
 * visible.
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';

const SYNCED_FROM = {
  document: 'Luka_Engels_CV_13.docx',
  date: '2026-08-28',
};

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = resolve(ROOT, 'public');

type Language = { name: string; level: string };
type SkillGroup = { group: string; items: string[] };
type KeyProjectLine = { label?: string; text: string };
type Role = {
  company: string;
  industry: string;
  location: string;
  role: string;
  period: string;
  bullets: string[];
};

type Labels = {
  contact: string;
  email: string;
  location: string;
  website: string;
  citizenship: string;
  languages: string;
  education: string;
  certifications: string;
  profile: string;
  keyProject: string;
  experience: string;
  earlier: string;
  side: string;
};

type CvContent = {
  lang: 'en' | 'de';
  title: string;
  bannerTitle: string;
  bannerLabel: string;
  printButton: string;
  labels: Labels;
  location: string;
  citizenship: string;
  languages: Language[];
  skillGroups: SkillGroup[];
  education: { period: string; degree: string; school: string; desc: string };
  certifications: string[];
  profile: string;
  keyProject: { heading: string; lines: KeyProjectLine[] };
  experience: Role[];
  earlier: string[];
  side: string;
};

const EXTRA_CSS = `
  /* ── SKILL TAGS (replaced self-assessed percentage bars) ── */
  .tag-group { display: flex; flex-wrap: wrap; gap: 3px; }
  .tag {
    font-size: 6.6pt;
    line-height: 1.25;
    border: 0.5pt solid #bbb;
    background: #fff;
    padding: 1.5px 4px;
    color: #333;
  }
  .right .tag { border-color: #ccc; }

  /* ── PROFILE ── */
  .profile-text { font-size: 7.4pt; line-height: 1.5; color: #333; }

  /* ── KEY PROJECT ── */
  .kp-line { font-size: 7.2pt; line-height: 1.45; color: #333; margin-bottom: 3px; }
  .kp-line strong { color: #111; }

  /* Languages are stated as CEFR levels, not as filled dots: a dot count is a
     self-assessment with no shared scale, the same reason the skill percentage
     bars were dropped. Row layout itself lives in cv-styles.css. */
  .lang-level { font-size: 7pt; color: #666; white-space: nowrap; }

  /* ── PRINT BUTTON (screen only) ── */
  .print-btn {
    position: fixed; bottom: 16px; right: 16px; z-index: 10;
    box-shadow: 0 2px 10px rgba(0,0,0,0.35);
    font: 500 9pt/1 Arial, sans-serif; letter-spacing: 0.5px;
    background: #1a1a1a; color: #fff; border: none;
    padding: 9px 14px; cursor: pointer;
  }
  .print-btn:hover { background: #000; }
  @media print { .print-btn { display: none !important; } }
`;

const EN: CvContent = {
  lang: 'en',
  title: 'Luka Engels – CV',
  bannerTitle: 'Lead Software Engineer &nbsp;·&nbsp; Agentic AI &amp; LLM Platforms &nbsp;·&nbsp; TypeScript / AWS',
  bannerLabel: 'CV',
  printButton: 'Print / Save as PDF',
  labels: {
    contact: 'Contact',
    email: 'Email',
    location: 'Location',
    website: 'Website',
    citizenship: 'Citizenship',
    languages: 'Languages',
    education: 'Education',
    certifications: 'Certifications',
    profile: 'Profile',
    keyProject: 'Key Project',
    experience: 'Professional Experience',
    earlier: 'Earlier Career',
    side: 'Side Projects',
  },
  location: 'Hamburg, Germany · fully remote',
  citizenship: 'German and Croatian',
  languages: [
    { name: 'Croatian', level: 'native' },
    { name: 'English', level: 'C2' },
    { name: 'Italian', level: 'C1' },
    { name: 'German', level: 'B2' },
  ],
  skillGroups: [
    {
      group: 'AI &amp; Agents',
      items: [
        'Generative AI', 'LLMs', 'AI agents &amp; multi-agent systems', 'Agno',
        'Prompt &amp; context engineering', 'Claude skills, subagents, hooks &amp; rules',
        'MCP server design', 'RAG pipelines', 'Agent workflow architecture',
        'Guardrail &amp; policy design', 'Token-cost engineering',
      ],
    },
    {
      group: 'Programming Languages',
      items: ['TypeScript', 'JavaScript', 'C#', 'Python', 'SQL', 'Elasticsearch Query Language', 'HTML / CSS / Sass'],
    },
    { group: 'Frontend', items: ['Angular', 'React', 'Design systems', 'Nx monorepos'] },
    { group: 'Backend', items: ['Node.js', 'NestJS', '.NET Core', 'REST', 'Event-driven services'] },
    {
      group: 'Cloud &amp; DevOps',
      items: [
        'AWS (Lambda, DynamoDB, S3, CloudFront, CDK)', 'Azure (AKS)', 'Kubernetes',
        'PostgreSQL', 'Elasticsearch', 'Docker', 'GitHub Actions', 'CI/CD',
      ],
    },
    {
      group: 'Practices',
      items: ['Domain-Driven Design', 'Microservices', 'TDD', 'Agile / Scrum', 'Technical leadership &amp; mentoring'],
    },
  ],
  education: {
    period: '1998 – 2007',
    degree: 'Master of Economics',
    school: 'University of Rijeka',
    desc: 'Studied part-time alongside employment. Human resource management, accounting, information technology and marketing, building the analytical and organisational foundations that bridge business strategy and technical delivery.',
  },
  certifications: ['MCSD: Web Applications', 'MCSA: Web Applications'],
  profile:
    'Lead Software Engineer with 25 years building production software across real estate SaaS, banking, insurance and telecommunications, the last six fully remote across immowelt, Empro and now Whise. My team builds and maintains an agentic SDLC platform of AI agents on large language models (LLMs), with a harness of Claude skills, commands, hooks and rules that engineers work through daily. That background is why it holds up in production: domain-driven design and event-driven serverless architecture on AWS, alongside Azure Kubernetes and PostgreSQL.',
  keyProject: {
    heading: 'AI-assisted build of a real estate CRM',
    lines: [
      { text: 'Our team is building a new web and mobile real-estate CRM, migrating functionality out of legacy systems, and we built and maintain the agentic SDLC that delivers it.' },
      { label: 'Harness layer.', text: 'The Claude skills, slash commands, hooks and rules the team works through, with Model Context Protocol (MCP) servers and RAG retrieval connecting agents to repositories, pipelines and issue tracking.' },
      { label: 'How it runs.', text: 'A stakeholder-approved prototype enters the pipeline through specification extraction; agents then groom, implement, review and test, with hooks and rules enforcing standards so throughput does not turn into verification debt.' },
      { label: 'Reach.', text: 'Used daily across our 11-person cross-functional team: 6 developers, 2 QA engineers, 2 product owners and a scrum master.' },
    ],
  },
  experience: [
    {
      company: 'Empro (Whise Group)',
      industry: 'Real estate CRM, 6,000+ customers, 95,000+ users, 4.2M+ managed properties',
      location: 'Hamburg, Germany · Fully remote',
      role: 'Lead Software Engineer',
      period: 'Sep 2024 – Present',
      bullets: [
        'Lead engineering direction for a modern SaaS CRM: architectural decisions, full delivery lifecycle from technical planning to release, and mentoring of developers.',
        'Delivered LLM-powered (generative AI) inquiry automation and Elasticsearch-based search across the platform.',
        'Built a customer-facing agentic UI on the Agno framework (Python), extending agent capability from internal delivery tooling into the product itself.',
        'Own an Angular design system of 87 components in an Nx monorepo. Infrastructure spans AWS (CDK) and Azure Kubernetes Service, with PostgreSQL.',
        'Technical lead for 6 developers within an 11-person cross-functional team; co-designed the agent workflow underpinning delivery.',
      ],
    },
    {
      company: 'immowelt GmbH / AVIV Group GmbH',
      industry: "One of Germany's largest property portals",
      location: 'Hamburg, Germany · Fully remote',
      role: 'Senior Software Developer (Full-Stack)',
      period: 'Aug 2020 – Sep 2024',
      bullets: [
        'Designed and built scalable microservices and web applications for a high-traffic real estate platform.',
        'Built cloud services on AWS following Domain-Driven Design, with functional, unit and integration test coverage.',
        'Contributed to CI/CD pipelines; worked in Scrum across backlog refinement, sprint planning, wireframes and prototypes.',
      ],
    },
    {
      company: 'neveling.net GmbH (now Neveling Reply)',
      industry: 'Software development agency',
      location: 'Hamburg, Germany',
      role: 'Senior Software Developer',
      period: 'Sep 2015 – Aug 2020',
      bullets: [
        'Built and maintained CMS solutions and custom web applications in C#, JavaScript and Sitecore.',
        'Responsive front-ends, backend services and third-party API integrations, with release versioning and CI/CD.',
      ],
    },
    {
      company: 'Spencer Stuart',
      industry: 'Global executive search',
      location: 'Dublin, Ireland',
      role: 'Senior Software Developer',
      period: 'Jul 2014 – May 2015',
      bullets: [
        'Developed an executive search and recruitment platform in C#, JavaScript and T-SQL.',
        'Established CI/CD for continuous delivery.',
      ],
    },
    {
      company: 'Clarity Consulting (acquired by Perficient Inc.)',
      industry: 'Software consulting',
      location: 'Rijeka, Croatia',
      role: 'Team Lead &amp; Principal Software Developer',
      period: 'Jan 2012 – Jul 2014',
      bullets: [
        'Led the team building Clarity Connect, a unified communications platform integrating with Microsoft Lync.',
        'Drove technical direction, coordinated sprint delivery, defined engineering standards, and ran training and performance reviews.',
      ],
    },
    {
      company: 'Erste Group Bank AG',
      industry: 'Banking &amp; finance',
      location: 'Rijeka, Croatia',
      role: 'Head of Satellite Application Development',
      period: 'Jul 2008 – Jan 2012',
      bullets: [
        'Led a team of 10 developers building satellite applications around a complex core banking platform: online banking, reporting and customer services on C# .NET, ASP.NET and Oracle PL/SQL.',
        'Owned technical direction and delivery across the satellite application portfolio.',
      ],
    },
  ],
  earlier: [
    '<strong>Multilink</strong> — Senior Software Developer (Dec 2004 – Jul 2008), Croatia. Web portal and supporting services for T-Mobile.',
    '<strong>Euris</strong> — Software Developer (Dec 2000 – Dec 2004), on-site at Allianz S.p.A., Trieste, Italy. Windows desktop applications for the insurance sector and industrial support systems; VB6, C++, MS SQL Server.',
  ],
  side: '<strong>Personal agent tooling.</strong> Self-directed work outside the workplace: n8n orchestration for AI workflow automation and knowledge management, and rapid LLM prototyping on AWS with TypeScript.',
};

const DE: CvContent = {
  lang: 'de',
  title: 'Luka Engels – Lebenslauf',
  bannerTitle: 'Lead Software Engineer &nbsp;·&nbsp; Agentic AI &amp; LLM-Plattformen &nbsp;·&nbsp; TypeScript / AWS',
  bannerLabel: 'LEBENSLAUF',
  printButton: 'Drucken / Als PDF sichern',
  labels: {
    contact: 'Kontaktdaten',
    email: 'E-Mail',
    location: 'Standort',
    website: 'Website',
    citizenship: 'Staatsangehörigkeit',
    languages: 'Sprachen',
    education: 'Ausbildung',
    certifications: 'Zertifizierungen',
    profile: 'Profil',
    keyProject: 'Schwerpunktprojekt',
    experience: 'Beruflicher Werdegang',
    earlier: 'Frühere Stationen',
    side: 'Eigene Projekte',
  },
  location: 'Hamburg, Deutschland · vollständig remote',
  citizenship: 'deutsch und kroatisch',
  languages: [
    { name: 'Kroatisch', level: 'Muttersprache' },
    { name: 'Englisch', level: 'C2' },
    { name: 'Italienisch', level: 'C1' },
    { name: 'Deutsch', level: 'B2' },
  ],
  skillGroups: [
    {
      group: 'KI &amp; Agenten',
      items: [
        'Generative KI', 'Large Language Models', 'KI-Agenten &amp; Multi-Agenten-Systeme', 'Agno',
        'Prompt- und Context-Engineering', 'Claude Skills, Subagents, Hooks &amp; Rules',
        'MCP-Server-Design', 'RAG-Pipelines', 'Agenten-Workflow-Architektur',
        'Guardrail- und Policy-Design', 'Token-Kosten-Optimierung',
      ],
    },
    {
      group: 'Programmiersprachen',
      items: ['TypeScript', 'JavaScript', 'C#', 'Python', 'SQL', 'Elasticsearch Query Language', 'HTML / CSS / Sass'],
    },
    { group: 'Frontend', items: ['Angular', 'React', 'Design-Systeme', 'Nx-Monorepos'] },
    { group: 'Backend', items: ['Node.js', 'NestJS', '.NET Core', 'REST', 'Event-getriebene Services'] },
    {
      group: 'Cloud &amp; DevOps',
      items: [
        'AWS (Lambda, DynamoDB, S3, CloudFront, CDK)', 'Azure (AKS)', 'Kubernetes',
        'PostgreSQL', 'Elasticsearch', 'Docker', 'GitHub Actions', 'CI/CD',
      ],
    },
    {
      group: 'Methoden',
      items: ['Domain-Driven Design', 'Microservices', 'TDD', 'Agile / Scrum', 'Technische Führung &amp; Mentoring'],
    },
  ],
  education: {
    period: '1998 – 2007',
    degree: 'Master of Economics',
    school: 'Universität Rijeka',
    desc: 'Berufsbegleitend studiert. Personalmanagement, Rechnungswesen, Informationstechnologie und Marketing, als analytische und organisatorische Grundlage zwischen Geschäftsstrategie und technischer Umsetzung.',
  },
  certifications: ['MCSD: Web Applications', 'MCSA: Web Applications'],
  profile:
    'Lead Software Engineer mit 25 Jahren Erfahrung in der Entwicklung produktiver Software für Immobilien-SaaS, Banken, Versicherungen und Telekommunikation, davon die letzten sechs Jahre vollständig remote bei immowelt, Empro und jetzt Whise. Unser Team entwickelt und betreibt eine agentische SDLC-Plattform aus KI-Agenten auf Basis von Large Language Models (LLMs), mit einem Harness aus Claude Skills, Commands, Hooks und Rules, mit dem die Entwickler täglich arbeiten. Dass sie im Produktivbetrieb trägt, liegt an der Grundlage darunter: Domain-Driven Design und event-getriebene Serverless-Architektur auf AWS, dazu Azure Kubernetes und PostgreSQL.',
  keyProject: {
    heading: 'KI-gestützte Entwicklung eines Immobilien-CRM',
    lines: [
      { text: 'Unser Team baut ein neues Web- und Mobile-CRM für die Immobilienbranche, migriert Funktionalität aus Altsystemen und hat den agentischen SDLC entwickelt, der diese Arbeit trägt.' },
      { label: 'Harness-Ebene.', text: 'Die Claude Skills, Slash Commands, Hooks und Rules, mit denen das Team arbeitet, mit Model-Context-Protocol-Servern (MCP) und RAG-Retrieval, die Agenten mit Repositories, Pipelines und Issue-Tracking verbinden.' },
      { label: 'Ablauf.', text: 'Ein durch die Stakeholder freigegebener Prototyp geht über Spezifikationsextraktion in die Pipeline; Agenten verfeinern, implementieren, prüfen und testen, während Hooks und Rules die Standards durchsetzen, damit aus Durchsatz keine Prüfschuld wird.' },
      { label: 'Reichweite.', text: 'Täglich im Einsatz in unserem elfköpfigen cross-funktionalen Team: 6 Entwickler, 2 QA-Engineers, 2 Product Owner und ein Scrum Master.' },
    ],
  },
  experience: [
    {
      company: 'Empro (Whise Group)',
      industry: 'Immobilien-CRM, 6.000+ Kunden, 95.000+ Nutzer, 4,2 Mio.+ verwaltete Objekte',
      location: 'Hamburg, Deutschland · Vollständig remote',
      role: 'Lead Software Engineer',
      period: 'Sep 2024 – heute',
      bullets: [
        'Technische Leitung eines modernen SaaS-CRM: Architekturentscheidungen, End-to-End-Verantwortung von der technischen Planung bis zum Release, Mentoring der Entwickler.',
        'LLM-gestützte Anfrageautomatisierung (generative KI) und Elasticsearch-basierte Suche über die gesamte Plattform ausgeliefert.',
        'Kundenseitige agentische Oberfläche auf dem Agno-Framework (Python) gebaut und damit Agentenfähigkeit vom internen Werkzeug ins Produkt selbst getragen.',
        'Verantwortung für ein Angular-Design-System mit 87 Komponenten in einem Nx-Monorepo. Infrastruktur auf AWS (CDK) und Azure Kubernetes Service, mit PostgreSQL.',
        'Technische Führung von 6 Entwicklern in einem elfköpfigen cross-funktionalen Team; Mitgestaltung des Agenten-Workflows, der die Auslieferung trägt.',
      ],
    },
    {
      company: 'immowelt GmbH / AVIV Group GmbH',
      industry: 'Eines der größten Immobilienportale Deutschlands',
      location: 'Hamburg, Deutschland · Vollständig remote',
      role: 'Senior Softwareentwickler (Full-Stack)',
      period: 'Aug 2020 – Sep 2024',
      bullets: [
        'Skalierbare Microservices und Webanwendungen für eine Immobilienplattform mit hohem Traffic entworfen und gebaut.',
        'Cloud-Services auf AWS nach Domain-Driven Design entwickelt, mit funktionalen, Unit- und Integrationstests.',
        'Mitarbeit an den CI/CD-Pipelines; Arbeit in Scrum über Backlog-Refinement, Sprint-Planung, Wireframes und Prototypen.',
      ],
    },
    {
      company: 'neveling.net GmbH (heute Neveling Reply)',
      industry: 'Softwareagentur',
      location: 'Hamburg, Deutschland',
      role: 'Senior Softwareentwickler',
      period: 'Sep 2015 – Aug 2020',
      bullets: [
        'CMS-Lösungen und individuelle Webanwendungen in C#, JavaScript und Sitecore entwickelt und betreut.',
        'Responsive Frontends, Backend-Services und Anbindung von Drittanbieter-APIs, mit Release-Versionierung und CI/CD.',
      ],
    },
    {
      company: 'Spencer Stuart',
      industry: 'Internationale Personalberatung',
      location: 'Dublin, Irland',
      role: 'Senior Softwareentwickler',
      period: 'Jul 2014 – Mai 2015',
      bullets: [
        'Plattform für Executive Search und Recruiting in C#, JavaScript und T-SQL entwickelt.',
        'CI/CD für kontinuierliche Auslieferung aufgebaut.',
      ],
    },
    {
      company: 'Clarity Consulting (übernommen von Perficient Inc.)',
      industry: 'Software-Beratung',
      location: 'Rijeka, Kroatien',
      role: 'Teamleiter &amp; Principal Softwareentwickler',
      period: 'Jan 2012 – Jul 2014',
      bullets: [
        'Leitung des Teams hinter Clarity Connect, einer Unified-Communications-Plattform mit Microsoft-Lync-Integration.',
        'Technische Ausrichtung, Koordination der Sprint-Auslieferung, Definition der Engineering-Standards sowie Schulungen und Mitarbeitergespräche.',
      ],
    },
    {
      company: 'Erste Group Bank AG',
      industry: 'Banken &amp; Finanzen',
      location: 'Rijeka, Kroatien',
      role: 'Leiter Satellite Application Development',
      period: 'Jul 2008 – Jan 2012',
      bullets: [
        'Führung eines zehnköpfigen Entwicklerteams für Satellitenanwendungen rund um eine komplexe Kernbankenplattform: Online-Banking, Reporting und Kundenservices auf C# .NET, ASP.NET und Oracle PL/SQL.',
        'Verantwortung für technische Ausrichtung und Auslieferung des gesamten Anwendungsportfolios.',
      ],
    },
  ],
  earlier: [
    '<strong>Multilink</strong> — Senior Softwareentwickler (Dez 2004 – Jul 2008), Kroatien. Webportal und begleitende Services für T-Mobile.',
    '<strong>Euris</strong> — Softwareentwickler (Dez 2000 – Dez 2004), vor Ort bei Allianz S.p.A., Triest, Italien. Windows-Desktopanwendungen für die Versicherungsbranche und industrielle Unterstützungssysteme; VB6, C++, MS SQL Server.',
  ],
  side: '<strong>Eigene Agenten-Werkzeuge.</strong> Arbeit außerhalb des Arbeitsplatzes: n8n-Orchestrierung für KI-Workflow-Automatisierung und Wissensmanagement sowie schnelles LLM-Prototyping auf AWS mit TypeScript.',
};

function build(cv: CvContent, css: string): string {
  const t = cv.labels;

  const languages = cv.languages
    .map(
      l =>
        `<div class="lang-row"><div class="lang-name">${l.name}</div>` +
        `<div class="lang-level">${l.level}</div></div>`,
    )
    .join('');

  const skills = cv.skillGroups
    .map(
      g =>
        `<div><div class="section-title">${g.group}</div><div class="tag-group">` +
        g.items.map(s => `<span class="tag">${s}</span>`).join('') +
        `</div></div>`,
    )
    .join('');

  const certifications = cv.certifications.map(c => `<div class="cert-item">${c}</div>`).join('');

  const keyProjectLines = cv.keyProject.lines
    .map(l => `<div class="kp-line">${l.label ? `<strong>${l.label}</strong> ` : ''}${l.text}</div>`)
    .join('');

  const experience = cv.experience
    .map(
      e => `<div class="exp-entry">
        <div class="exp-header">
          <div>
            <div class="exp-company">${e.company}</div>
            <div class="exp-industry">${e.industry}</div>
            <div class="exp-location">${e.location}</div>
            <div class="exp-role">${e.role}</div>
          </div>
          <div class="exp-period">${e.period}</div>
        </div>
        <ul class="exp-bullets">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
      </div>`,
    )
    .join('');

  const earlier = cv.earlier.map(line => `<div class="kp-line">${line}</div>`).join('');

  return `<!doctype html>
<html lang="${cv.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cv.title}</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<!-- Generated by scripts/build-cv-pages.ts from ${SYNCED_FROM.document} (${SYNCED_FROM.date}). Do not hand-edit. -->
<style>
${css}
${EXTRA_CSS}
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">${cv.printButton}</button>
<div class="page">

  <div class="banner">
    <img class="banner-photo" src="images/luka-web-bw.jpg" alt="Luka Engels">
    <div class="banner-name">
      <div class="first">Luka</div>
      <div class="last">ENGELS</div>
      <div class="banner-title">${cv.bannerTitle}</div>
    </div>
    <div class="banner-label">${cv.bannerLabel}</div>
  </div>

  <div class="body">

    <div class="left">

      <div>
        <div class="section-title">${t.contact}</div>
        <div class="contact-item"><strong>${t.email}</strong>luka.engels@outlook.de</div>
        <div class="contact-item"><strong>${t.location}</strong>${cv.location}</div>
        <div class="contact-item"><strong>${t.citizenship}</strong>${cv.citizenship}</div>
        <div class="contact-item"><strong>${t.website}</strong>luka-engels.de</div>
        <div class="contact-item"><strong>LinkedIn</strong>linkedin.com/in/lukaengels</div>
        <div class="contact-item"><strong>GitHub</strong>github.com/srnux</div>
      </div>

      <div>
        <div class="section-title">${t.languages}</div>
        ${languages}
      </div>

      ${skills}

      <div>
        <div class="section-title">${t.education}</div>
        <div class="edu-period">${cv.education.period}</div>
        <div class="edu-degree">${cv.education.degree}</div>
        <div class="edu-school">${cv.education.school}</div>
        <div class="edu-desc">${cv.education.desc}</div>
      </div>

      <div>
        <div class="section-title">${t.certifications}</div>
        ${certifications}
      </div>

    </div>

    <div class="right">

      <div>
        <div class="section-title">${t.profile}</div>
        <div class="profile-text">${cv.profile}</div>
      </div>

      <div>
        <div class="section-title">${t.keyProject}: ${cv.keyProject.heading}</div>
        ${keyProjectLines}
      </div>

      <div>
        <div class="section-title">${t.experience}</div>
        ${experience}
      </div>

      <div>
        <div class="section-title">${t.earlier}</div>
        ${earlier}
      </div>

      <div>
        <div class="section-title">${t.side}</div>
        <div class="kp-line">${cv.side}</div>
      </div>

    </div>

  </div>
</div>
</body>
</html>
`;
}

// The base stylesheet lives in its own file rather than being scraped back out
// of the generated page. Reading its own output would make the script
// non-idempotent: EXTRA_CSS would be appended again on every run.
const css = readFileSync(resolve(ROOT, 'scripts/cv-styles.css'), 'utf8').replace(/^\n+|\n+$/g, '');

for (const cv of [EN, DE]) {
  const out = resolve(PUBLIC, `cv-luka-engels-${cv.lang}.html`);
  writeFileSync(out, build(cv, css), 'utf8');
  const kb = (statSync(out).size / 1024).toFixed(1);
  console.log(`wrote ${relative(ROOT, out)} (${kb} kB)`);
}
console.log(`content model last synced from ${SYNCED_FROM.document} on ${SYNCED_FROM.date}`);
