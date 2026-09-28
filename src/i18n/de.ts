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
      'Luka Engels, Lead Software Engineer in Hamburg, vollständig remote. 25 Jahre Erfahrung mit Software im Produktivbetrieb. Baut agentische SDLC-Plattformen auf Claude Skills, MCP-Servern und RAG, mit TypeScript, Node.js und AWS.',
    ogTitle: 'Luka Engels — Lead Software Engineer, Agentic AI & LLM-Plattformen',
    ogDescription:
      '25 Jahre Erfahrung mit Software im Produktivbetrieb. Baut agentische SDLC-Plattformen auf Claude Skills, MCP-Servern und RAG, mit TypeScript, Node.js und AWS. Hamburg, vollständig remote.',
    ogLocale: 'de_DE',
    imageAlt: 'Porträt von Luka Engels',
    jsonLd: {
      description:
        'Lead Software Engineer mit 25 Jahren Erfahrung mit Software im Produktivbetrieb für Immobilien-SaaS, Banken, Versicherungen und Telekommunikation. Entwickelt und betreibt eine agentische SDLC-Plattform aus KI-Agenten auf Basis von Large Language Models, mit einem Harness aus Claude Skills, Slash Commands, Hooks und Rules, Model-Context-Protocol-Servern und RAG-Retrieval. Domain-Driven Design und ereignisgesteuerte Serverless-Architektur auf AWS, mit TypeScript als Hauptprogrammiersprache.',
      jobTitle: 'Lead Software Engineer',
      seeks: 'Unbefristete Festanstellung in Deutschland mit vollständig ortsunabhängiger Arbeit als Staff, Principal, Lead oder Head of Engineering',
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
    cvTitle: 'Lebenslauf als A4-Seite zum Drucken',
    switchLanguage: 'Sprache',
  },

  hero: {
    imageAlt: 'Luka Engels, Lead Software Engineer, Hamburg',
    title: 'Lead Software Engineer',
    tagline: 'Agentic AI & LLM-Plattformen · TypeScript / AWS · Hamburg, vollständig remote',
    intro:
      '25 Jahre Erfahrung mit Software im Produktivbetrieb für Immobilien-SaaS, Banken, Versicherungen und Telekommunikation, die letzten sechs davon vollständig remote. Heute entwickelt und betreibt mein Team eine agentische SDLC-Plattform: KI-Agenten auf Basis von Large Language Models, mit einem Harness aus Claude Skills, Commands, Hooks und Rules, mit dem unsere Entwickler jeden Tag arbeiten. Dass sie sich im Produktivbetrieb bewährt, liegt an ihrer Grundlage: solides Engineering-Handwerk, Domain-Driven Design und ereignisgesteuerte Serverless-Architektur auf AWS.',
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
      '25 Jahre in Softwareentwicklung und Teamführung, in Immobilien-SaaS, Banken, Versicherungen und Telekommunikation. Als Lead Software Engineer verantworte ich die technische Ausrichtung eines modernen SaaS-CRM für Immobilienmakler und führe sechs Entwickler in einem elfköpfigen funktionsübergreifenden Team.',
      'Unser Team entwickelt und betreibt den agentischen SDLC, der dieses Produkt ausliefert. Die Harness-Ebene besteht aus den Claude Skills, Slash Commands, Hooks und Rules, mit denen das Team arbeitet, dazu Model-Context-Protocol-Server und RAG-Retrieval, die Agenten mit unseren Repositories, Pipelines und dem Issue-Tracking verbinden. Ein von den Stakeholdern freigegebener Prototyp gelangt über Spezifikationsextraktion in die Pipeline; Agenten präzisieren die Anforderungen, implementieren, prüfen und testen anschließend, während Hooks und Rules unsere Standards durchsetzen, damit höherer Durchsatz nicht zu einem Rückstau ungeprüfter Änderungen führt.',
      'Diese Möglichkeiten haben wir auch in das Produkt integriert und eine agentische Benutzeroberfläche für Kunden auf dem Agno-Framework ausgeliefert. Die Grundlage für den zuverlässigen Produktivbetrieb ist solides Engineering-Handwerk.',
      'Dieses Handwerk hat den Großteil meiner 25 Berufsjahre geprägt. Meine Arbeit hat dabei immer den gesamten Stack umfasst: Oberflächen in Angular und React, dahinter Services in Node.js, NestJS und .NET Core, darunter die Schemata, Queues und Indizes. Heute heißt das Domain-Driven Design und ereignisgesteuerte Serverless-Architektur auf AWS mit Lambda, DynamoDB, S3, CloudFront und CDK, dazu Azure Kubernetes Service, PostgreSQL und Elasticsearch, mit Infrastructure as Code, aussagekräftigen Tests und zuverlässigen CI/CD-Prozessen. Außerdem verantwortet unser Team ein Angular-Design-System mit 87 Komponenten in einem Nx-Monorepo.',
    ],
    facts: [
      {
        figure: 'Full Stack',
        detail:
          'Angular und React im Frontend, dahinter Node.js, NestJS und .NET Core, darunter die Datenschicht. Ich entwickle selbst auf jeder Ebene und koordiniere die Arbeit des Teams.',
      },
      {
        figure: 'AWS und Azure',
        detail:
          'Ereignisgesteuerte Serverless-Architektur auf AWS mit Lambda, DynamoDB, S3, CloudFront und CDK, dazu Azure Kubernetes Service, PostgreSQL und Elasticsearch. Infrastructure as Code, CI/CD als Standard.',
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
          'Immobilien-CRM, 6.000+ Kunden, 95.000+ Nutzer, 4,2 Mio.+ verwaltete Objekte. Im September 2024 innerhalb der AVIV Group gegründet, heute Teil von Whise.',
        location: 'Hamburg, Deutschland · Vollständig remote',
        period: 'Sept. 2024 – heute',
        description:
          'Technische Leitung eines modernen SaaS-CRM: Architekturentscheidungen, der gesamte Entwicklungszyklus von der technischen Planung bis zum Release und das Mentoring der Entwickler.',
        highlights: [
          'Wir haben eine agentische SDLC-Plattform aufgebaut und betreiben sie: ein Harness aus Claude Skills, Slash Commands, Hooks und Rules, dazu MCP-Server und RAG-Retrieval über unsere Repositories, Pipelines und das Issue-Tracking.',
          'Wir haben LLM-gestützte Anfrageautomatisierung und Elasticsearch-basierte Suche über die gesamte Plattform ausgeliefert.',
          'Wir haben eine agentische Benutzeroberfläche für Kunden auf dem Agno-Framework in Python ausgeliefert und damit KI-Agenten aus unseren internen Entwicklungswerkzeugen auch im Produkt nutzbar gemacht.',
          'Unser Team verantwortet ein Angular-Design-System mit 87 Komponenten in einem Nx-Monorepo. Die Infrastruktur umfasst AWS mit CDK und Azure Kubernetes Service, mit PostgreSQL.',
          'Technische Führung von sechs Entwicklern in einem elfköpfigen funktionsübergreifenden Team; Mitgestaltung des Agenten-Workflows, der die Softwareauslieferung unterstützt.',
        ],
      },
      {
        title: 'Senior Softwareentwickler (Full-Stack)',
        company: 'immowelt GmbH / AVIV Group GmbH',
        context: 'Eines der größten Immobilienportale Deutschlands.',
        location: 'Hamburg, Deutschland · Vollständig remote',
        period: 'Aug. 2020 – Sept. 2024',
        description:
          'Entwurf und Entwicklung skalierbarer Microservices und Webanwendungen für eine Immobilienplattform mit hohem Traffic.',
        highlights: [
          'Wir haben Cloud-Services auf AWS nach Domain-Driven Design entwickelt, mit Funktions-, Unit- und Integrationstests.',
          'Wir haben zu den CI/CD-Pipelines beigetragen und in Scrum gearbeitet, von Backlog-Refinement und Sprint-Planung bis zu Wireframes und Prototypen.',
        ],
      },
      {
        title: 'Senior Softwareentwickler',
        company: 'neveling.net GmbH (heute Neveling Reply)',
        context: 'Softwareagentur.',
        location: 'Hamburg, Deutschland',
        period: 'Sept. 2015 – Aug. 2020',
        description:
          'Entwicklung und Betreuung von CMS-Lösungen und individuellen Webanwendungen in C#, JavaScript und Sitecore. Responsive Frontends, Backend-Services und Anbindung von Drittanbieter-APIs, mit Release-Versionierung und CI/CD.',
      },
      {
        title: 'Senior Softwareentwickler',
        company: 'Spencer Stuart',
        context: 'Internationale Personalberatung.',
        location: 'Dublin, Irland',
        period: 'Jul. 2014 – Mai 2015',
        description:
          'Entwicklung einer Plattform für Executive Search und Recruiting in C#, JavaScript und T-SQL sowie Aufbau von CI/CD für kontinuierliche Auslieferung.',
      },
      {
        title: 'Teamleiter & Principal Softwareentwickler',
        company: 'Clarity Consulting (übernommen von Perficient Inc.)',
        context: 'Software-Beratung.',
        location: 'Rijeka, Kroatien',
        period: 'Jan. 2012 – Jul. 2014',
        description:
          'Leitung des Teams hinter Clarity Connect, einer Unified-Communications-Plattform mit Microsoft-Lync-Integration. Technische Ausrichtung, Koordination der Auslieferung von Sprint-Ergebnissen, Definition der Engineering-Standards sowie Schulungen und Mitarbeitergespräche.',
      },
      {
        title: 'Leiter der Entwicklung von Satellitenanwendungen',
        company: 'Erste Group Bank AG',
        context: 'Banken und Finanzen.',
        location: 'Rijeka, Kroatien',
        period: 'Jul. 2008 – Jan. 2012',
        description:
          'Führung eines zehnköpfigen Entwicklerteams für Satellitenanwendungen rund um eine komplexe Kernbankenplattform: Online-Banking, Reporting und Kundenservices auf C# .NET, ASP.NET und Oracle PL/SQL. Verantwortung für technische Ausrichtung und Auslieferung des gesamten Portfolios an Satellitenanwendungen.',
      },
      {
        title: 'Senior Softwareentwickler',
        company: 'Multilink',
        context: 'Telekommunikation.',
        location: 'Kroatien',
        period: 'Dez. 2004 – Jul. 2008',
        description:
          'Entwicklung eines Webportals und begleitender Services für T-Mobile, von der Anforderungsanalyse mit dem Kunden bis zur Full-Stack-Umsetzung der Features.',
      },
      {
        title: 'Softwareentwickler',
        company: 'Euris',
        context: 'Vor Ort bei Allianz S.p.A.',
        location: 'Triest, Italien',
        period: 'Dez. 2000 – Dez. 2004',
        description:
          'Entwicklung von Windows-Desktopanwendungen für die Versicherungsbranche und industrielle Unterstützungssysteme mit VB6, C++ und MS SQL Server.',
      },
    ],
  },

  skills: {
    heading: 'Technische Kenntnisse',
    intro: 'Alle aufgeführten Technologien und Methoden setzen wir täglich ein oder haben sie bis vor Kurzem im Produktivbetrieb genutzt. Das ist keine Wunschliste.',
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
        skills: ['Node.js', 'NestJS', '.NET Core', 'REST', 'Ereignisgesteuerte Services'],
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
          'Berufsbegleitend studiert. Ein breites wirtschaftswissenschaftliches Studium mit Personalmanagement, Rechnungswesen, Informationstechnologie und Marketing, das die analytischen und organisatorischen Grundlagen für die Verbindung von Geschäftsstrategie und technischer Umsetzung geschaffen hat.',
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
    citizenshipNote: 'In der gesamten EU ohne zusätzliche Arbeitserlaubnis oder Visum arbeitsberechtigt.',
    baseHeading: 'Standort',
    base: 'Hamburg, Deutschland',
    baseNote: 'Seit 2020 vollständig remote, mit Erfahrung in der Zusammenarbeit über europäische Zeitzonen hinweg.',
  },

  projects: {
    heading: 'Ausgewählte Projekte',
    technologiesHeading: 'Technologien',
    cta: 'Kontakt aufnehmen',
    items: [
      {
        title: 'Agentische SDLC-Plattform',
        description:
          'Die Delivery-Plattform, die unser Team für das unten genannte CRM aufgebaut hat und betreibt. Ein Harness aus Claude Skills, Slash Commands, Hooks und Rules, mit dem die Entwickler täglich arbeiten, dazu MCP-Server und RAG-Retrieval, die Agenten mit Repositories, Pipelines und Issue-Tracking verbinden. Täglich im Einsatz in einem elfköpfigen funktionsübergreifenden Team.',
        technologies: ['Claude Skills, Hooks & Rules', 'MCP-Server', 'RAG', 'TypeScript', 'Python', 'GitHub Actions'],
      },
      {
        title: 'Empro — Immobilien-CRM',
        description:
          'Ein modernes SaaS-CRM für Immobilienmakler mit über 6.000 Kunden, 95.000 Nutzern und 4,2 Millionen verwalteten Objekten. Wir liefern LLM-gestützte Anfrageautomatisierung, Suchprofil-Matching, KI-generierte Objektbeschreibungen, Elasticsearch-basierte Suche sowie Kalender- und E-Mail-Integrationen, dazu eine agentische Benutzeroberfläche für Kunden auf dem Agno-Framework.',
        technologies: ['Angular', 'TypeScript', 'NestJS', 'AWS CDK', 'DynamoDB', 'Elasticsearch', 'Agno', 'Azure AKS', 'PostgreSQL'],
      },
      {
        title: 'immowelt — Immobilienportal',
        description:
          'Skalierbare Microservices und Webanwendungen für eines der größten Immobilienportale Deutschlands. Wir haben Cloud-Services auf AWS nach Domain-Driven Design entwickelt, mit Funktions-, Unit- und Integrationstests, und zu den CI/CD-Pipelines beigetragen, über die sie ausgeliefert wurden.',
        technologies: ['TypeScript', 'Node.js', 'AWS', 'Microservices', 'DDD', 'CI/CD'],
      },
      {
        title: 'Nivea — Portal & Webshop',
        description:
          'Feature-Entwicklung für das Nivea-Kundenportal und den Webshop. Wir haben Produktkatalogseiten, Warenkorbfunktionen, die Anbindung des Treueprogramms und CMS-gestützte Inhaltspflege für mehrere Märkte umgesetzt, auf Basis von Sitecore und .NET, gehostet auf Azure.',
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
      'Eine unbefristete Festanstellung in Deutschland, vollständig remote, als Staff, Principal, Lead oder Head of Engineering, bei der die Arbeit an agentischen und LLM-Plattformen die eigentliche Aufgabe ist und kein Nebenschauplatz.',
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
