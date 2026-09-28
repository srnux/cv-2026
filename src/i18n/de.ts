import type { Messages } from './messages';

/**
 * German site copy. Wherever the site and the German CV say the same thing,
 * the wording follows the DE model in scripts/build-cv-pages.ts, so the two do
 * not drift apart in tone or terminology.
 */
export const de: Messages = {
  meta: {
    title: 'Luka Engels — Lead Software Engineer, Agentic AI & LLM-Plattformen',
    description:
      'Luka Engels, Lead Software Engineer in Hamburg, vollständig remote. 25 Jahre produktive Software. Baut agentische SDLC-Plattformen auf Claude Skills, MCP-Servern und RAG, mit TypeScript, Node.js und AWS.',
    ogTitle: 'Luka Engels — Lead Software Engineer, Agentic AI & LLM-Plattformen',
    ogDescription:
      '25 Jahre produktive Software. Baut agentische SDLC-Plattformen auf Claude Skills, MCP-Servern und RAG, mit TypeScript, Node.js und AWS. Hamburg, vollständig remote.',
    ogLocale: 'de_DE',
    imageAlt: 'Porträt von Luka Engels',
    jsonLd: {
      description:
        'Lead Software Engineer mit 25 Jahren Erfahrung in produktiver Software für Immobilien-SaaS, Banken, Versicherungen und Telekommunikation. Entwickelt und betreibt eine agentische SDLC-Plattform aus KI-Agenten auf Basis von Large Language Models, mit einem Harness aus Claude Skills, Slash Commands, Hooks und Rules, Model-Context-Protocol-Servern und RAG-Retrieval. Domain-Driven Design und event-getriebene Serverless-Architektur auf AWS, mit TypeScript als führender Sprache.',
      jobTitle: 'Lead Software Engineer',
      seeks: 'Unbefristete, vollständig remote Festanstellung in Deutschland als Staff, Principal, Lead oder Head of Engineering',
      nationality: ['Deutschland', 'Kroatien'],
      languages: ['Kroatisch', 'Englisch', 'Italienisch', 'Deutsch'],
    },
  },

  nav: {
    home: 'Start',
    about: 'Über mich',
    experience: 'Werdegang',
    skills: 'Kenntnisse',
    writing: 'Artikel',
    contact: 'Kontakt',
    portfolio: 'Portfolio',
    more: 'Mehr',
    cv: 'Lebenslauf',
    cvTitle: 'Lebenslauf als A4-Seite zum Drucken',
    switchLanguage: 'Sprache',
  },

  hero: {
    imageAlt: 'Luka Engels, Lead Software Engineer, Hamburg',
    title: 'Lead Software Engineer',
    tagline: 'Agentic AI & LLM-Plattformen · TypeScript / AWS · Hamburg, vollständig remote',
    intro:
      '25 Jahre produktive Software für Immobilien-SaaS, Banken, Versicherungen und Telekommunikation, die letzten sechs davon vollständig remote. Heute entwickelt und betreibt mein Team eine agentische SDLC-Plattform: KI-Agenten auf Basis von Large Language Models, mit einem Harness aus Claude Skills, Commands, Hooks und Rules, mit dem unsere Entwickler jeden Tag arbeiten. Dass sie im Produktivbetrieb trägt, liegt am Fundament darunter: solides Engineering-Handwerk, Domain-Driven Design und event-getriebene Serverless-Architektur auf AWS.',
    focusAreas: [
      { label: 'Agentic AI', href: '#skills-ai-agents' },
      { label: 'LLM-Plattformen', href: '#skills-ai-agents' },
      { label: 'MCP-Server', href: '#skills-ai-agents' },
      { label: 'RAG-Pipelines', href: '#skills-ai-agents' },
      { label: 'TypeScript', href: '#skills-languages' },
      { label: 'Python', href: '#skills-languages' },
      { label: 'AWS', href: '#skills-cloud-devops' },
      { label: 'Azure & Kubernetes', href: '#skills-cloud-devops' },
      { label: 'Full Stack', href: '#about' },
      { label: 'Node.js / NestJS', href: '#skills-backend' },
      { label: 'Angular', href: '#skills-frontend' },
      { label: 'Teamführung', href: '#skills-practices' },
    ],
    moreLabel: 'Mehr über mich',
  },

  about: {
    heading: 'Über mich',
    paragraphs: [
      '25 Jahre in Softwareentwicklung und Teamführung, in Immobilien-SaaS, Banken, Versicherungen und Telekommunikation. Als Lead Software Engineer verantworte ich die technische Ausrichtung eines modernen SaaS-CRM für Immobilienmakler und führe sechs Entwickler in einem elfköpfigen cross-funktionalen Team.',
      'Unser Team entwickelt und betreibt den agentischen SDLC, der dieses Produkt ausliefert. Die Harness-Ebene besteht aus den Claude Skills, Slash Commands, Hooks und Rules, mit denen das Team arbeitet, dazu Model-Context-Protocol-Server und RAG-Retrieval, die Agenten mit unseren Repositories, Pipelines und dem Issue-Tracking verbinden. Ein von den Stakeholdern freigegebener Prototyp gelangt über Spezifikationsextraktion in die Pipeline; Agenten verfeinern, implementieren, prüfen und testen anschließend, während Hooks und Rules unsere Standards durchsetzen, damit aus Durchsatz keine Prüfschuld wird.',
      'Diese Fähigkeit haben wir auch ins Produkt selbst getragen und eine kundenseitige agentische Oberfläche auf dem Agno-Framework ausgeliefert. Nichts davon würde den Produktivbetrieb überstehen, wenn darunter nicht solides Engineering-Handwerk stünde.',
      'In dieses Handwerk sind die meisten der 25 Jahre geflossen, und die Arbeit hat immer beide Enden des Stacks umfasst: Oberflächen in Angular und React, dahinter Services in Node.js, NestJS und .NET Core, darunter die Schemata, Queues und Indizes. Heute heißt das Domain-Driven Design und event-getriebene Serverless-Architektur auf AWS mit Lambda, DynamoDB, S3, CloudFront und CDK, dazu Azure Kubernetes Service, PostgreSQL und Elasticsearch, mit Infrastructure as Code, Tests, die etwas aussagen, und CI/CD, dem die Leute wirklich vertrauen. Außerdem verantwortet unser Team ein Angular-Design-System mit 87 Komponenten in einem Nx-Monorepo.',
    ],
    facts: [
      {
        figure: 'Full Stack',
        detail:
          'Angular und React im Frontend, dahinter Node.js, NestJS und .NET Core, darunter die Datenschicht. Selbst auf jeder Ebene ausliefern, nicht nur die Menschen koordinieren, die es tun.',
      },
      {
        figure: 'AWS und Azure',
        detail:
          'Event-getriebenes Serverless auf AWS mit Lambda, DynamoDB, S3, CloudFront und CDK, dazu Azure Kubernetes Service, PostgreSQL und Elasticsearch. Infrastructure as Code, CI/CD als Standard.',
      },
      {
        figure: '6.000+ Kunden',
        detail: 'Das Immobilien-CRM, das wir entwickeln, bedient mehr als 95.000 Nutzer und über 4,2 Millionen verwaltete Objekte.',
      },
      {
        figure: 'Elfköpfiges Team',
        detail:
          'Sechs Entwickler, zwei QA-Engineers, zwei Product Owner und ein Scrum Master. Ich verantworte die technische Ausrichtung und führe die Entwickler.',
      },
    ],
  },

  experience: {
    heading: 'Beruflicher Werdegang',
    showEarlier: 'Frühere Stationen anzeigen',
    showLess: 'Weniger anzeigen',
    roles: [
      {
        title: 'Lead Software Engineer',
        company: 'Empro (Whise Group)',
        context:
          'Immobilien-CRM, 6.000+ Kunden, 95.000+ Nutzer, 4,2 Mio.+ verwaltete Objekte. Im Sep 2024 innerhalb der AVIV Group gegründet, heute Teil von Whise.',
        location: 'Hamburg, Deutschland · Vollständig remote',
        period: 'Sep 2024 – heute',
        description:
          'Technische Leitung eines modernen SaaS-CRM: Architekturentscheidungen, der gesamte Lieferzyklus von der technischen Planung bis zum Release und das Mentoring der Entwickler.',
        highlights: [
          'Wir haben eine agentische SDLC-Plattform aufgebaut und betreiben sie: ein Harness aus Claude Skills, Slash Commands, Hooks und Rules, dazu MCP-Server und RAG-Retrieval über unsere Repositories, Pipelines und das Issue-Tracking.',
          'Wir haben LLM-gestützte Anfrageautomatisierung und Elasticsearch-basierte Suche über die gesamte Plattform ausgeliefert.',
          'Wir haben eine kundenseitige agentische Oberfläche auf dem Agno-Framework in Python ausgeliefert und damit Agentenfähigkeit vom internen Werkzeug für die Auslieferung ins Produkt selbst getragen.',
          'Unser Team verantwortet ein Angular-Design-System mit 87 Komponenten in einem Nx-Monorepo. Die Infrastruktur umfasst AWS mit CDK und Azure Kubernetes Service, mit PostgreSQL.',
          'Technische Führung von sechs Entwicklern in einem elfköpfigen cross-funktionalen Team; Mitgestaltung des Agenten-Workflows, der die Auslieferung trägt.',
        ],
      },
      {
        title: 'Senior Softwareentwickler (Full-Stack)',
        company: 'immowelt GmbH / AVIV Group GmbH',
        context: 'Eines der größten Immobilienportale Deutschlands.',
        location: 'Hamburg, Deutschland · Vollständig remote',
        period: 'Aug 2020 – Sep 2024',
        description:
          'Entwurf und Entwicklung skalierbarer Microservices und Webanwendungen für eine Immobilienplattform mit hohem Traffic.',
        highlights: [
          'Wir haben Cloud-Services auf AWS nach Domain-Driven Design entwickelt, mit funktionalen, Unit- und Integrationstests.',
          'Wir haben zu den CI/CD-Pipelines beigetragen und in Scrum gearbeitet, von Backlog-Refinement und Sprint-Planung bis zu Wireframes und Prototypen.',
        ],
      },
      {
        title: 'Senior Softwareentwickler',
        company: 'neveling.net GmbH (heute Neveling Reply)',
        context: 'Softwareagentur.',
        location: 'Hamburg, Deutschland',
        period: 'Sep 2015 – Aug 2020',
        description:
          'Entwicklung und Betreuung von CMS-Lösungen und individuellen Webanwendungen in C#, JavaScript und Sitecore. Responsive Frontends, Backend-Services und Anbindung von Drittanbieter-APIs, mit Release-Versionierung und CI/CD.',
      },
      {
        title: 'Senior Softwareentwickler',
        company: 'Spencer Stuart',
        context: 'Internationale Personalberatung.',
        location: 'Dublin, Irland',
        period: 'Jul 2014 – Mai 2015',
        description:
          'Entwicklung einer Plattform für Executive Search und Recruiting in C#, JavaScript und T-SQL sowie Aufbau von CI/CD für kontinuierliche Auslieferung.',
      },
      {
        title: 'Teamleiter & Principal Softwareentwickler',
        company: 'Clarity Consulting (übernommen von Perficient Inc.)',
        context: 'Software-Beratung.',
        location: 'Rijeka, Kroatien',
        period: 'Jan 2012 – Jul 2014',
        description:
          'Leitung des Teams hinter Clarity Connect, einer Unified-Communications-Plattform mit Microsoft-Lync-Integration. Technische Ausrichtung, Koordination der Sprint-Auslieferung, Definition der Engineering-Standards sowie Schulungen und Mitarbeitergespräche.',
      },
      {
        title: 'Leiter Satellite Application Development',
        company: 'Erste Group Bank AG',
        context: 'Banken und Finanzen.',
        location: 'Rijeka, Kroatien',
        period: 'Jul 2008 – Jan 2012',
        description:
          'Führung eines zehnköpfigen Entwicklerteams für Satellitenanwendungen rund um eine komplexe Kernbankenplattform: Online-Banking, Reporting und Kundenservices auf C# .NET, ASP.NET und Oracle PL/SQL. Verantwortung für technische Ausrichtung und Auslieferung des gesamten Portfolios an Satellitenanwendungen.',
      },
      {
        title: 'Senior Softwareentwickler',
        company: 'Multilink',
        context: 'Telekommunikation.',
        location: 'Kroatien',
        period: 'Dez 2004 – Jul 2008',
        description:
          'Entwicklung eines Webportals und begleitender Services für T-Mobile, von der Anforderungsanalyse mit dem Kunden bis zur Full-Stack-Umsetzung der Features.',
      },
      {
        title: 'Softwareentwickler',
        company: 'Euris',
        context: 'Vor Ort bei Allianz S.p.A.',
        location: 'Triest, Italien',
        period: 'Dez 2000 – Dez 2004',
        description:
          'Entwicklung von Windows-Desktopanwendungen für die Versicherungsbranche und industrielle Unterstützungssysteme mit VB6, C++ und MS SQL Server.',
      },
    ],
  },

  skills: {
    heading: 'Technische Kenntnisse',
    intro: 'Alles hier ist täglich oder bis vor Kurzem im Produktiveinsatz, keine Wunschliste.',
    categories: [
      {
        id: 'skills-ai-agents',
        category: 'KI & Agenten',
        lead: true,
        skills: [
          'Generative KI (GenAI)',
          'Large Language Models (LLMs)',
          'KI-Agenten und Multi-Agenten-Systeme',
          'Agno',
          'Prompt- und Context-Engineering',
          'Claude Skills, Subagents, Slash Commands, Hooks und Rules',
          'Design von Model-Context-Protocol-Servern (MCP)',
          'RAG-Pipelines',
          'Agenten-Workflow-Architektur',
          'Guardrail- und Policy-Design',
          'Token-Kosten-Optimierung',
        ],
      },
      {
        id: 'skills-languages',
        category: 'Programmiersprachen',
        skills: ['TypeScript', 'JavaScript', 'C#', 'Python', 'SQL', 'Elasticsearch Query Language', 'HTML / CSS / Sass'],
      },
      {
        id: 'skills-frontend',
        category: 'Frontend',
        skills: ['Angular', 'React', 'Design-Systeme und Komponentenbibliotheken', 'Nx-Monorepos'],
      },
      {
        id: 'skills-backend',
        category: 'Backend',
        skills: ['Node.js', 'NestJS', '.NET Core', 'REST', 'Event-getriebene Services'],
      },
      {
        id: 'skills-cloud-devops',
        category: 'Cloud & DevOps',
        skills: [
          'AWS (Lambda, DynamoDB, S3, CloudFront, CDK)',
          'Azure (AKS)',
          'Kubernetes',
          'PostgreSQL',
          'Elasticsearch',
          'Docker',
          'GitHub Actions',
          'CI/CD',
        ],
      },
      {
        id: 'skills-practices',
        category: 'Methoden',
        skills: ['Domain-Driven Design', 'Microservices', 'TDD', 'Agile / Scrum', 'Technische Führung und Mentoring'],
      },
    ],
  },

  education: {
    heading: 'Ausbildung & Sprachen',
    academicHeading: 'Akademischer Werdegang',
    items: [
      {
        degree: 'Master of Economics',
        institution: 'Universität Rijeka',
        period: '1998 – 2007',
        description:
          'Berufsbegleitend studiert. Ein breites wirtschaftswissenschaftliches Studium mit Personalmanagement, Rechnungswesen, Informationstechnologie und Marketing, das die analytische und organisatorische Grundlage zwischen Geschäftsstrategie und technischer Umsetzung gelegt hat.',
      },
    ],
    certificationsHeading: 'Zertifizierungen',
    certifications: ['MCSD: Web Applications', 'MCSA: Web Applications'],
    languagesHeading: 'Sprachen',
    languages: [
      { name: 'Kroatisch', level: 'Muttersprache' },
      { name: 'Englisch', level: 'C2' },
      { name: 'Italienisch', level: 'C1' },
      { name: 'Deutsch', level: 'B2' },
    ],
    citizenshipHeading: 'Staatsangehörigkeit',
    citizenship: 'Deutsch und kroatisch',
    citizenshipNote: 'Keine Arbeitserlaubnis und kein Visum nötig, überall in der EU.',
    baseHeading: 'Standort',
    base: 'Hamburg, Deutschland',
    baseNote: 'Seit 2020 vollständig remote, eingespielt über die europäischen Zeitzonen hinweg.',
  },

  projects: {
    heading: 'Ausgewählte Projekte',
    technologiesHeading: 'Technologien',
    cta: 'Kontakt aufnehmen',
    items: [
      {
        title: 'Agentische SDLC-Plattform',
        description:
          'Die Delivery-Plattform, die unser Team für das unten genannte CRM aufgebaut hat und betreibt. Ein Harness aus Claude Skills, Slash Commands, Hooks und Rules, mit dem die Entwickler täglich arbeiten, dazu MCP-Server und RAG-Retrieval, die Agenten mit Repositories, Pipelines und Issue-Tracking verbinden. Täglich im Einsatz in einem elfköpfigen cross-funktionalen Team.',
        technologies: ['Claude Skills, Hooks & Rules', 'MCP-Server', 'RAG', 'TypeScript', 'Python', 'GitHub Actions'],
      },
      {
        title: 'Empro — Immobilien-CRM',
        description:
          'Ein modernes SaaS-CRM für Immobilienmakler mit über 6.000 Kunden, 95.000 Nutzern und 4,2 Millionen verwalteten Objekten. Wir liefern LLM-gestützte Anfrageautomatisierung, Suchprofil-Matching, KI-generierte Objektbeschreibungen, Elasticsearch-basierte Suche sowie Kalender- und E-Mail-Integrationen, dazu eine kundenseitige agentische Oberfläche auf dem Agno-Framework.',
        technologies: ['Angular', 'TypeScript', 'NestJS', 'AWS CDK', 'DynamoDB', 'Elasticsearch', 'Agno', 'Azure AKS', 'PostgreSQL'],
      },
      {
        title: 'immowelt — Immobilienportal',
        description:
          'Skalierbare Microservices und Webanwendungen für eines der größten Immobilienportale Deutschlands. Wir haben Cloud-Services auf AWS nach Domain-Driven Design entwickelt, mit funktionalen, Unit- und Integrationstests, und zu den CI/CD-Pipelines beigetragen, über die sie ausgeliefert wurden.',
        technologies: ['TypeScript', 'Node.js', 'AWS', 'Microservices', 'DDD', 'CI/CD'],
      },
      {
        title: 'Nivea — Portal & Webshop',
        description:
          'Feature-Entwicklung für das Nivea-Kundenportal und den Webshop. Wir haben Produktkatalogseiten, Warenkorbfunktionen, die Anbindung des Treueprogramms und CMS-gestützte Inhaltspflege für mehrere Märkte umgesetzt, auf Sitecore und .NET mit Azure darunter.',
        technologies: ['Sitecore CMS', '.NET', 'C#', 'SCSS', 'REST API', 'Azure'],
      },
    ],
  },

  writing: {
    heading: 'Artikel',
    intro: 'Längere Texte, sorgfältig ausgearbeitet statt als Notizen liegen gelassen.',
    minRead: minutes => `${minutes} Min. Lesezeit`,
    read: 'Artikel lesen',
    repo: 'GitHub-Repo',
    englishOnly: 'Artikel auf Englisch',
  },

  contact: {
    heading: 'Kontakt',
    lookingForHeading: 'Was ich suche',
    lookingFor: [
      'Eine unbefristete Festanstellung in Deutschland, vollständig remote, auf Ebene Staff, Principal, Lead oder Head of Engineering, bei der die Arbeit an agentischen und LLM-Plattformen die eigentliche Aufgabe ist und kein Nebenschauplatz.',
      'Wenn Sie ein solches Team aufbauen, schreiben Sie mir direkt. Recruiter sind willkommen, sofern die Stelle unbefristet und wirklich remote ist.',
    ],
    location: 'Hamburg, Deutschland · vollständig remote',
    linkedinLabel: 'LinkedIn-Profil',
    githubLabel: 'GitHub-Profil',
    name: 'Name',
    namePlaceholder: 'Ihr Name',
    email: 'E-Mail',
    emailPlaceholder: 'Ihre E-Mail-Adresse',
    subject: 'Betreff',
    subjectPlaceholder: 'Betreff',
    message: 'Nachricht',
    messagePlaceholder: 'Ihre Nachricht',
    send: 'Nachricht senden',
    sending: 'Wird gesendet...',
    sent: 'Vielen Dank. Ihre Nachricht ist unterwegs, und ich melde mich bei Ihnen.',
    errorBefore: 'Beim Senden ist etwas schiefgegangen. Bitte schreiben Sie stattdessen an ',
    errorAfter: '.',
    mailtoFrom: 'Von',
  },

  footer: {
    rights: 'Alle Rechte vorbehalten.',
    legalNotice: { label: 'Impressum', href: '/impressum.html' },
    privacy: { label: 'Datenschutz', href: '/datenschutz.html' },
  },
};
