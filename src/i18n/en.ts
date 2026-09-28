import type { Messages } from './messages';

export const en: Messages = {
  meta: {
    title: 'Luka Engels — Lead Software Engineer, Agentic AI & LLM Platforms',
    description:
      'Luka Engels, Lead Software Engineer in Hamburg, fully remote. 25 years of production software. Builds agentic SDLC platforms on Claude skills, MCP servers and RAG, with TypeScript, Node.js and AWS.',
    ogTitle: 'Luka Engels — Lead Software Engineer, Agentic AI & LLM Platforms',
    ogDescription:
      '25 years of production software. Builds agentic SDLC platforms on Claude skills, MCP servers and RAG, with TypeScript, Node.js and AWS. Hamburg, fully remote.',
    ogLocale: 'en_GB',
    imageAlt: 'Portrait of Luka Engels',
    jsonLd: {
      description:
        'Lead Software Engineer with 25 years of production software experience across real estate SaaS, banking, insurance and telecommunications. Builds and maintains an agentic SDLC platform of AI agents on large language models, with a harness of Claude skills, slash commands, hooks and rules, Model Context Protocol servers and RAG retrieval. Domain-driven design and event-driven serverless architecture on AWS, with TypeScript as the lead language.',
      jobTitle: 'Lead Software Engineer',
      seeks: 'Permanent, fully remote Staff, Principal, Lead or Head of Engineering roles employed in Germany',
      nationality: ['Germany', 'Croatia'],
      languages: ['Croatian', 'English', 'Italian', 'German'],
    },
  },

  nav: {
    home: 'Home',
    about: 'About',
    experience: 'Experience',
    skills: 'Skills',
    writing: 'Writing',
    contact: 'Contact',
    portfolio: 'Portfolio',
    more: 'More',
    cv: 'CV',
    cvTitle: 'Printable A4 CV',
    switchLanguage: 'Language',
  },

  hero: {
    imageAlt: 'Luka Engels, Lead Software Engineer, Hamburg',
    title: 'Lead Software Engineer',
    tagline: 'Agentic AI & LLM Platforms · TypeScript / AWS · Hamburg, fully remote',
    intro:
      '25 years of production software across real estate SaaS, banking, insurance and telecommunications, the last six fully remote. Today my team builds and maintains an agentic SDLC platform: AI agents on large language models, with a harness of Claude skills, commands, hooks and rules that our engineers work through every day. It holds up in production because the foundation underneath is ordinary engineering discipline, domain-driven design and event-driven serverless architecture on AWS.',
    focusAreas: [
      { label: 'Agentic AI', href: '#skills-ai-agents' },
      { label: 'LLM platforms', href: '#skills-ai-agents' },
      { label: 'MCP servers', href: '#skills-ai-agents' },
      { label: 'RAG pipelines', href: '#skills-ai-agents' },
      { label: 'TypeScript', href: '#skills-languages' },
      { label: 'Python', href: '#skills-languages' },
      { label: 'AWS', href: '#skills-cloud-devops' },
      { label: 'Azure & Kubernetes', href: '#skills-cloud-devops' },
      { label: 'Full stack', href: '#about' },
      { label: 'Node.js / NestJS', href: '#skills-backend' },
      { label: 'Angular', href: '#skills-frontend' },
      { label: 'Team leadership', href: '#skills-practices' },
    ],
    moreLabel: 'More about me',
  },

  about: {
    heading: 'About Me',
    paragraphs: [
      '25 years in software development and team leadership, across real estate SaaS, banking, insurance and telecommunications. As Lead Software Engineer I hold the technical direction for a modern SaaS CRM for real estate brokers and I lead six developers inside an eleven-person cross-functional team.',
      'Our team builds and maintains the agentic SDLC that delivers that product. The harness layer is the set of Claude skills, slash commands, hooks and rules the team works through, with Model Context Protocol servers and RAG retrieval connecting agents to our repositories, pipelines and issue tracking. A stakeholder-approved prototype enters the pipeline through specification extraction; agents then groom, implement, review and test, while hooks and rules enforce our standards so throughput does not turn into verification debt.',
      'We also took that capability into the product itself, shipping a customer-facing agentic UI on the Agno framework. None of it would survive contact with production without ordinary engineering discipline underneath.',
      'That discipline is where most of the 25 years went, and the work has always spanned both ends of the stack: Angular and React interfaces, Node.js, NestJS and .NET Core services behind them, and the schemas, queues and indexes underneath. Today that means domain-driven design and event-driven serverless architecture on AWS, using Lambda, DynamoDB, S3, CloudFront and CDK, alongside Azure Kubernetes Service, PostgreSQL and Elasticsearch, with infrastructure as code, tests that mean something, and CI/CD people actually trust. Our team also owns an Angular design system of 87 components in an Nx monorepo.',
    ],
    facts: [
      {
        figure: 'Full stack',
        detail:
          'Angular and React at the front, Node.js, NestJS and .NET Core behind them, and the data layer underneath. Shipping at every layer, not only coordinating the people who do.',
      },
      {
        figure: 'AWS and Azure',
        detail:
          'Event-driven serverless on AWS with Lambda, DynamoDB, S3, CloudFront and CDK, alongside Azure Kubernetes Service, PostgreSQL and Elasticsearch. Infrastructure as code, CI/CD by default.',
      },
      {
        figure: '6,000+ customers',
        detail: 'The real estate CRM we build serves more than 95,000 users and over 4.2 million managed properties.',
      },
      {
        figure: '11-person team',
        detail:
          'Six developers, two QA engineers, two product owners and a scrum master. I hold the technical direction and lead the developers.',
      },
    ],
  },

  experience: {
    heading: 'Professional Experience',
    showEarlier: 'Show earlier roles',
    showLess: 'Show less',
    roles: [
      {
        title: 'Lead Software Engineer',
        company: 'Empro (Whise Group)',
        context:
          'Real estate CRM, 6,000+ customers, 95,000+ users, 4.2M+ managed properties. Formed within AVIV Group in Sep 2024, now part of Whise.',
        location: 'Hamburg, Germany · Fully remote',
        period: 'Sep 2024 – Present',
        description:
          'Leading engineering direction for a modern SaaS CRM: architectural decisions, the full delivery lifecycle from technical planning to release, and mentoring of developers.',
        highlights: [
          'We built and maintain an agentic SDLC platform with a harness of Claude skills, slash commands, hooks and rules, plus MCP servers and RAG retrieval over our repositories, pipelines and issue tracking.',
          'We delivered LLM-powered inquiry automation and Elasticsearch-based search across the platform.',
          'We shipped a customer-facing agentic UI on the Agno framework in Python, extending agent capability from internal delivery tooling into the product itself.',
          'Our team owns an Angular design system of 87 components in an Nx monorepo. Infrastructure spans AWS with CDK and Azure Kubernetes Service, with PostgreSQL.',
          'Technical lead for six developers within an eleven-person cross-functional team; co-designed the agent workflow underpinning delivery.',
        ],
      },
      {
        title: 'Senior Software Developer (Full-Stack)',
        company: 'immowelt GmbH / AVIV Group GmbH',
        context: "One of Germany's largest property portals.",
        location: 'Hamburg, Germany · Fully remote',
        period: 'Aug 2020 – Sep 2024',
        description:
          'Designing and building scalable microservices and web applications for a high-traffic real estate platform.',
        highlights: [
          'We built cloud services on AWS following domain-driven design, with functional, unit and integration test coverage.',
          'We contributed to the CI/CD pipelines and worked in Scrum across backlog refinement, sprint planning, wireframes and prototypes.',
        ],
      },
      {
        title: 'Senior Software Developer',
        company: 'neveling.net GmbH (now Neveling Reply)',
        context: 'Software development agency.',
        location: 'Hamburg, Germany',
        period: 'Sep 2015 – Aug 2020',
        description:
          'Building and maintaining CMS solutions and custom web applications in C#, JavaScript and Sitecore. Responsive front-ends, backend services and third-party API integrations, with release versioning and CI/CD.',
      },
      {
        title: 'Senior Software Developer',
        company: 'Spencer Stuart',
        context: 'Global executive search.',
        location: 'Dublin, Ireland',
        period: 'Jul 2014 – May 2015',
        description:
          'Developing an executive search and recruitment platform in C#, JavaScript and T-SQL, and establishing CI/CD for continuous delivery.',
      },
      {
        title: 'Team Lead & Principal Software Developer',
        company: 'Clarity Consulting (acquired by Perficient Inc.)',
        context: 'Software consulting.',
        location: 'Rijeka, Croatia',
        period: 'Jan 2012 – Jul 2014',
        description:
          'Leading the team building Clarity Connect, a unified communications platform integrating with Microsoft Lync. Driving technical direction, coordinating sprint delivery, defining engineering standards, and running training and performance reviews.',
      },
      {
        title: 'Head of Satellite Application Development',
        company: 'Erste Group Bank AG',
        context: 'Banking and finance.',
        location: 'Rijeka, Croatia',
        period: 'Jul 2008 – Jan 2012',
        description:
          'Leading a team of 10 developers building satellite applications around a complex core banking platform: online banking, reporting and customer services on C# .NET, ASP.NET and Oracle PL/SQL. Owning technical direction and delivery across the satellite application portfolio.',
      },
      {
        title: 'Senior Software Developer',
        company: 'Multilink',
        context: 'Telecommunications.',
        location: 'Croatia',
        period: 'Dec 2004 – Jul 2008',
        description:
          'Building a web portal and supporting services for T-Mobile, handling client requirements analysis and full-stack feature delivery.',
      },
      {
        title: 'Software Developer',
        company: 'Euris',
        context: 'On-site at Allianz S.p.A.',
        location: 'Trieste, Italy',
        period: 'Dec 2000 – Dec 2004',
        description:
          'Building Windows desktop applications for the insurance sector and industrial support systems using VB6, C++ and MS SQL Server.',
      },
    ],
  },

  skills: {
    heading: 'Technical Expertise',
    intro: 'Everything below is in daily or recent production use, not a wish list.',
    categories: [
      {
        id: 'skills-ai-agents',
        category: 'AI & Agents',
        lead: true,
        skills: [
          'Generative AI (GenAI)',
          'Large language models (LLMs)',
          'AI agents and multi-agent systems',
          'Agno',
          'Prompt and context engineering',
          'Claude skills, subagents, slash commands, hooks and rules',
          'Model Context Protocol (MCP) server design',
          'RAG pipelines',
          'Agent workflow architecture',
          'Guardrail and policy design',
          'Token-cost engineering',
        ],
      },
      {
        id: 'skills-languages',
        category: 'Languages',
        skills: ['TypeScript', 'JavaScript', 'C#', 'Python', 'SQL', 'Elasticsearch Query Language', 'HTML / CSS / Sass'],
      },
      {
        id: 'skills-frontend',
        category: 'Frontend',
        skills: ['Angular', 'React', 'Design systems and component libraries', 'Nx monorepos'],
      },
      {
        id: 'skills-backend',
        category: 'Backend',
        skills: ['Node.js', 'NestJS', '.NET Core', 'REST', 'Event-driven services'],
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
        category: 'Practices',
        skills: ['Domain-Driven Design', 'Microservices', 'TDD', 'Agile / Scrum', 'Technical leadership and mentoring'],
      },
    ],
  },

  education: {
    heading: 'Education & Languages',
    academicHeading: 'Academic Background',
    items: [
      {
        degree: 'Master of Economics',
        institution: 'University of Rijeka',
        period: '1998 – 2007',
        description:
          'Studied part-time alongside employment. A broad economics curriculum covering human resource management, accounting, information technology and marketing, which built the analytical and organisational foundations that bridge business strategy and technical delivery.',
      },
    ],
    certificationsHeading: 'Certifications',
    certifications: ['MCSD: Web Applications', 'MCSA: Web Applications'],
    languagesHeading: 'Languages',
    languages: [
      { name: 'Croatian', level: 'Native' },
      { name: 'English', level: 'C2' },
      { name: 'Italian', level: 'C1' },
      { name: 'German', level: 'B2' },
    ],
    citizenshipHeading: 'Citizenship',
    citizenship: 'German and Croatian',
    citizenshipNote: 'No work authorisation or visa sponsorship needed anywhere in the EU.',
    baseHeading: 'Base',
    base: 'Hamburg, Germany',
    baseNote: 'Fully remote since 2020, comfortable across European time zones.',
  },

  projects: {
    heading: 'Portfolio Highlights',
    technologiesHeading: 'Technologies',
    cta: 'Get in touch',
    items: [
      {
        title: 'Agentic SDLC platform',
        description:
          'The delivery platform our team built and maintains for the CRM below. A harness of Claude skills, slash commands, hooks and rules that engineers work through daily, with MCP servers and RAG retrieval connecting agents to repositories, pipelines and issue tracking. Used every day by an eleven-person cross-functional team.',
        technologies: ['Claude skills, hooks & rules', 'MCP servers', 'RAG', 'TypeScript', 'Python', 'GitHub Actions'],
      },
      {
        title: 'Empro — Real estate CRM',
        description:
          'A modern SaaS CRM for real estate brokers, serving over 6,000 customers, 95,000 users and 4.2 million managed properties. We deliver LLM-powered inquiry automation, search profile matching, AI-generated property descriptions, Elasticsearch-based search, and calendar and email integrations, alongside a customer-facing agentic UI built on the Agno framework.',
        technologies: ['Angular', 'TypeScript', 'NestJS', 'AWS CDK', 'DynamoDB', 'Elasticsearch', 'Agno', 'Azure AKS', 'PostgreSQL'],
      },
      {
        title: 'immowelt — Property portal',
        description:
          "Scalable microservices and web applications for one of Germany's largest property portals. We built cloud services on AWS following domain-driven design, with functional, unit and integration test coverage, and contributed to the CI/CD pipelines that shipped them.",
        technologies: ['TypeScript', 'Node.js', 'AWS', 'Microservices', 'DDD', 'CI/CD'],
      },
      {
        title: 'Nivea — Portal & Web Shop',
        description:
          'Feature development for the Nivea customer portal and web shop. We built product catalogue pages, shopping cart functionality, loyalty programme integration, and CMS-driven content management across multiple markets, on Sitecore and .NET with Azure underneath.',
        technologies: ['Sitecore CMS', '.NET', 'C#', 'SCSS', 'REST API', 'Azure'],
      },
    ],
  },

  writing: {
    heading: 'Writing',
    intro: 'Longer pieces, written up properly rather than left as notes.',
    minRead: minutes => `${minutes} min read`,
    read: 'Read the article',
    repo: 'GitHub Repo',
    englishOnly: 'Article in English',
  },

  contact: {
    heading: 'Get In Touch',
    lookingForHeading: 'What I am looking for',
    lookingFor: [
      'Permanent, fully remote roles employed in Germany, at Staff, Principal, Lead or Head of Engineering level, where the agentic and LLM platform work is the job rather than a side quest.',
      'If that is the kind of team you are building, write to me directly. Recruiters are welcome, provided the role is permanent and genuinely remote.',
    ],
    location: 'Hamburg, Germany · fully remote',
    linkedinLabel: 'LinkedIn profile',
    githubLabel: 'GitHub profile',
    name: 'Name',
    namePlaceholder: 'Your name',
    email: 'Email',
    emailPlaceholder: 'Your email',
    subject: 'Subject',
    subjectPlaceholder: 'Subject',
    message: 'Message',
    messagePlaceholder: 'Your message',
    send: 'Send message',
    sending: 'Sending...',
    sent: 'Thank you. Your message is on its way and I will come back to you.',
    errorBefore: 'Something went wrong on the way. Please write to ',
    errorAfter: ' instead.',
    mailtoFrom: 'From',
  },

  footer: {
    rights: 'All rights reserved.',
    legalNotice: { label: 'Legal notice', href: '/legal-notice.html' },
    privacy: { label: 'Privacy', href: '/privacy.html' },
  },
};
