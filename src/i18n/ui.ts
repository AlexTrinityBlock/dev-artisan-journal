import type { Lang } from './config';

/**
 * Site-chrome dictionary. Long-form page copy (the CV sections) lives in
 * `src/data/cv.ts`; article bodies live in the content collection.
 *
 * Furniture micro-labels (`SYSTEM // 01`, `CHART TYPE · SOURCE` source rows)
 * intentionally stay English in every locale — they read as instrument
 * readouts, not prose. Everything a reader has to *parse* is translated.
 */
export interface UIStrings {
  site: {
    title: string;
    description: string;
  };
  header: {
    logoSub: string;
    beacon: string;
    navLabel: string;
    nav: {
      home: string;
      articles: string;
      topics: string;
      contact: string;
    };
  };
  switcher: {
    label: string;
    aria: string;
    current: string;
    pending: string;
  };
  footer: {
    brandDesc: string;
    operational: string;
    navigation: string;
    navHome: string;
    navArticles: string;
    navTopics: string;
    credentials: string;
    copyright: (year: number) => string;
    fontMeta: string;
    paletteMeta: string;
  };
  card: {
    featured: string;
    read: string;
    readTag: string;
  };
  cv: {
    certId: string;
    verify: string;
    synopsis: string;
    stack: string;
    stackShort: string;
  };
  author: {
    tag: string;
    role: string;
    bio: string;
    button: string;
    creds: string[];
  };
  articles: {
    metaTitle: string;
    metaDescription: string;
    tag: string;
    title: string;
    desc: (posts: number, domains: number) => string;
    all: (posts: number) => string;
    latest: string;
    emptyTitle: string;
    emptyDesc: string;
    authorTag: string;
    authorRole: string;
    authorBio: string;
    cvButton: string;
    credsTag: string;
    topicsTag: string;
    dispatchTag: string;
    dispatchText: string;
    copyEmail: string;
  };
  topics: {
    metaTitle: string;
    metaDescription: string;
    tag: string;
    title: string;
    desc: (posts: number) => string;
    primary: string;
    tagCloud: (count: number) => string;
    articleCount: (count: number) => string;
    domainTag: string;
    domainDesc: (category: string) => string;
    viewDispatches: string;
  };
  tag: {
    metaTitle: (tag: string) => string;
    metaDescription: (tag: string) => string;
    backToTopics: string;
    count: (count: number) => string;
    tagLabel: string;
    desc: (tag: string) => string;
    backHome: string;
  };
  post: {
    breadcrumbArticles: string;
    share: string;
    copyLink: string;
    toc: string;
    topics: string;
    prev: string;
    next: string;
    backToArticles: string;
    authorTitle: string;
    readTime: (minutes: number) => string;
    translationPending: string;
    viewOriginal: string;
  };
  toast: {
    emailCopied: string;
    phoneCopied: string;
    linkCopied: string;
    copied: string;
  };
}

const en: UIStrings = {
  site: {
    title: 'DEV ARTISAN // JOURNAL — Alex.Hsiao',
    description:
      'Technical publication & systems architecture journal of Alex.Hsiao — FullStack & GenAI Systems Architect.',
  },
  header: {
    logoSub: 'Alex.Hsiao · FullStack & GenAI Architect',
    beacon: 'System Active: Taipei Node',
    navLabel: 'Main Navigation',
    nav: {
      home: 'HOME',
      articles: 'ARTICLES',
      topics: 'TOPICS',
      contact: 'CONTACT',
    },
  },
  switcher: {
    label: 'LANG',
    aria: 'Select language',
    current: 'Current language',
    pending: 'Not translated yet — opens the article index in that language.',
  },
  footer: {
    brandDesc:
      'A technical publication focused on bare-metal GPU clustering, multi-agent AI orchestration, Kubernetes infrastructure, and ISO/IEC 27001 DevSecOps governance.',
    operational: 'OPERATIONAL // TAIPEI, TAIWAN',
    navigation: 'NAVIGATION',
    navHome: 'Home & Profile',
    navArticles: 'Articles',
    navTopics: 'Topics & Taxonomy',
    credentials: 'CREDENTIALS',
    copyright: (year) =>
      `© ${year} Alex.Hsiao (Wei-Chun Hsiao). Crafted with Astro & Design Token Mono Palette.`,
    fontMeta: 'FONT: INTER / MONO',
    paletteMeta: 'PALETTE: #1C1C1A / #F0EFEB',
  },
  card: {
    featured: 'FEATURED',
    read: 'Read',
    readTag: 'DISPATCH //',
  },
  cv: {
    certId: 'VERIFICATION ID:',
    verify: 'Public Credential',
    synopsis: 'PRODUCTION ARCHITECTURE & DEPLOYMENT CONTEXT',
    stack: 'KEY STACK:',
    stackShort: 'STACK:',
  },
  author: {
    tag: 'AUTHOR PROFILE // 01',
    role: 'FullStack Engineer & GenAI Systems Architect',
    bio: 'GenAI Engineer specializing in on-premises bare-metal GPU clustering (NVIDIA GPU Operator & HAMi), stateful Multi-Agent LLMs with LangGraph, distributed microservices, and ISO/IEC 27001 ISMS governance.',
    button: 'Full Profile & CV',
    creds: [
      'NVIDIA GenAI',
      'CNCF CKA',
      'AWS SAP',
      'GCP PCA',
      'ISO 27001 Auditor',
      'IEEE Publication',
    ],
  },
  articles: {
    metaTitle: 'Articles — DEV ARTISAN // JOURNAL',
    metaDescription:
      'Technical articles and architecture dispatches by Alex.Hsiao — FullStack & GenAI Systems Architect.',
    tag: 'SYSTEM // 02 · TECHNICAL DISPATCHES',
    title: 'Articles & Architecture Briefs',
    desc: (posts, domains) =>
      `Browse ${posts} engineering articles across ${domains} domains.`,
    all: (posts) => `All Articles (${posts})`,
    latest: 'LATEST TECHNICAL DISPATCHES',
    emptyTitle: 'No dispatches published yet',
    emptyDesc:
      'The journal is fresh. Engineering articles on GPU clusters, multi-agent systems, and infrastructure will land here soon.',
    authorTag: 'SYSTEM // AUTHOR',
    authorRole: 'GenAI Engineer',
    authorBio:
      'Specializing in full-stack Python & Node systems, distributed message brokers (RabbitMQ), Kubernetes vGPU virtualization, and cloud infrastructure.',
    cvButton: 'View Profile & Credentials',
    credsTag: 'SYSTEM // VERIFIED CREDENTIALS',
    topicsTag: 'SYSTEM // TOPICS',
    dispatchTag: 'SYSTEM // DISPATCH CHANNEL',
    dispatchText:
      'Open for Senior FullStack, GenAI Systems, and GPU Cluster Architecture opportunities in Taipei & Remote.',
    copyEmail: 'Copy Email Address',
  },
  topics: {
    metaTitle: 'Topics & Architecture Taxonomy — DEV ARTISAN // JOURNAL',
    metaDescription:
      'Explore technical articles categorized by domain: Bare-Metal GPU Virtualization, Multi-Agent Systems, Kubernetes, Cloud Security, and ISO 27001 ISMS.',
    tag: 'SYSTEM // 03 · TAXONOMY INDEX',
    title: 'Technical Domains & Topic Tags',
    desc: (posts) =>
      `Browse ${posts} engineering articles categorized across primary systems domains and fine-grained technology tags.`,
    primary: 'PRIMARY SYSTEMS DOMAINS',
    tagCloud: (count) => `INDIVIDUAL TECHNOLOGY TAGS (${count})`,
    articleCount: (count) => `${count} ${count === 1 ? 'Article' : 'Articles'}`,
    domainTag: '// DOMAIN',
    domainDesc: (category) =>
      `Articles and architecture blueprints related to ${category.toLowerCase()}.`,
    viewDispatches: 'View dispatches',
  },
  tag: {
    metaTitle: (tag) => `Articles tagged with #${tag} — DEV ARTISAN // JOURNAL`,
    metaDescription: (tag) =>
      `Browse technical articles, architecture blueprints, and systems logs related to ${tag}.`,
    backToTopics: 'All Topics & Taxonomy',
    count: (count) => `${count} ${count === 1 ? 'Dispatch' : 'Dispatches'}`,
    tagLabel: 'SYSTEM // 04 · TOPIC FILTER',
    desc: (tag) =>
      `Technical publications and architectural blueprints indexed under ${tag}.`,
    backHome: 'Return to Home Feed',
  },
  post: {
    breadcrumbArticles: 'Articles',
    share: 'SHARE //',
    copyLink: 'Copy Link',
    toc: 'SYSTEM // TOC',
    topics: 'TOPICS:',
    prev: '← PREVIOUS ARTICLE',
    next: 'NEXT ARTICLE →',
    backToArticles: 'Back to All Articles',
    authorTitle: 'FullStack & GenAI Architect · CKA & ISO 27001 Auditor',
    readTime: (minutes) => `${minutes} min read`,
    translationPending: 'Not translated yet',
    viewOriginal: 'Read the English original',
  },
  toast: {
    emailCopied: 'Email copied to clipboard!',
    phoneCopied: 'Phone copied to clipboard!',
    linkCopied: 'Article URL copied to clipboard!',
    copied: 'Copied to clipboard',
  },
};

const zhHant: UIStrings = {
  site: {
    title: 'DEV ARTISAN // JOURNAL — Alex.Hsiao',
    description:
      'Alex.Hsiao 的技術刊物與系統架構筆記 — 全端與 GenAI 系統架構師。',
  },
  header: {
    logoSub: 'Alex.Hsiao · 全端與 GenAI 架構師',
    beacon: '系統運作中：台北節點',
    navLabel: '主要導覽',
    nav: {
      home: '首頁',
      articles: '文章',
      topics: '主題',
      contact: '聯絡',
    },
  },
  switcher: {
    label: 'LANG',
    aria: '選擇語言',
    current: '目前語言',
    pending: '此頁尚無翻譯 — 將前往該語言的文章索引。',
  },
  footer: {
    brandDesc:
      '專注於裸機 GPU 叢集、多代理 AI 協作、Kubernetes 基礎設施與 ISO/IEC 27001 DevSecOps 治理的技術刊物。',
    operational: 'OPERATIONAL // TAIPEI, TAIWAN',
    navigation: 'NAVIGATION',
    navHome: '首頁與簡介',
    navArticles: '文章',
    navTopics: '主題與分類',
    credentials: 'CREDENTIALS',
    copyright: (year) =>
      `© ${year} Alex.Hsiao（Wei-Chun Hsiao）· 以 Astro 與 Design Token Mono 色系手工構築。`,
    fontMeta: 'FONT: INTER / MONO',
    paletteMeta: 'PALETTE: #1C1C1A / #F0EFEB',
  },
  card: {
    featured: '精選',
    read: '閱讀',
    readTag: 'DISPATCH //',
  },
  cv: {
    certId: '驗證編號：',
    verify: '公開認證',
    synopsis: '生產架構與部署情境',
    stack: '關鍵技術：',
    stackShort: '技術棧：',
  },
  author: {
    tag: 'AUTHOR PROFILE // 01',
    role: '全端工程師暨 GenAI 系統架構師',
    bio: 'GenAI 工程師，專精於地端裸機 GPU 叢集（NVIDIA GPU Operator 與 HAMi）、以 LangGraph 建構具狀態的多代理 LLM 系統、分散式微服務，以及 ISO/IEC 27001 ISMS 治理。',
    button: '完整履歷與簡介',
    creds: [
      'NVIDIA GenAI',
      'CNCF CKA',
      'AWS SAP',
      'GCP PCA',
      'ISO 27001 主導稽核員',
      'IEEE 論文',
    ],
  },
  articles: {
    metaTitle: '文章 — DEV ARTISAN // JOURNAL',
    metaDescription:
      'Alex.Hsiao 的技術文章與架構筆記 — 全端與 GenAI 系統架構師。',
    tag: 'SYSTEM // 02 · TECHNICAL DISPATCHES',
    title: '文章與架構簡報',
    desc: (posts, domains) =>
      `瀏覽 ${posts} 篇工程文章，涵蓋 ${domains} 個技術領域。`,
    all: (posts) => `全部文章 (${posts})`,
    latest: 'LATEST TECHNICAL DISPATCHES',
    emptyTitle: '尚無發布的文章',
    emptyDesc:
      '刊物剛剛起步。關於 GPU 叢集、多代理系統與基礎設施的工程文章即將陸續上線。',
    authorTag: 'SYSTEM // AUTHOR',
    authorRole: 'GenAI 工程師',
    authorBio:
      '專精於 Python 與 Node 全端系統、分散式訊息中介（RabbitMQ）、Kubernetes vGPU 虛擬化與雲端基礎設施。',
    cvButton: '檢視簡介與認證',
    credsTag: 'SYSTEM // VERIFIED CREDENTIALS',
    topicsTag: 'SYSTEM // TOPICS',
    dispatchTag: 'SYSTEM // DISPATCH CHANNEL',
    dispatchText:
      '開放台北與遠端的資深全端、GenAI 系統與 GPU 叢集架構職缺合作機會。',
    copyEmail: '複製電子郵件',
  },
  topics: {
    metaTitle: '主題與架構分類 — DEV ARTISAN // JOURNAL',
    metaDescription:
      '依領域探索技術文章：裸機 GPU 虛擬化、多代理系統、Kubernetes、雲端安全與 ISO 27001 ISMS。',
    tag: 'SYSTEM // 03 · TAXONOMY INDEX',
    title: '技術領域與主題標籤',
    desc: (posts) =>
      `瀏覽 ${posts} 篇工程文章，依核心系統領域與細部技術標籤分類。`,
    primary: 'PRIMARY SYSTEMS DOMAINS',
    tagCloud: (count) => `INDIVIDUAL TECHNOLOGY TAGS (${count})`,
    articleCount: (count) => `${count} 篇文章`,
    domainTag: '// DOMAIN',
    domainDesc: (category) => `與 ${category} 相關的文章與架構藍圖。`,
    viewDispatches: '檢視相關文章',
  },
  tag: {
    metaTitle: (tag) => `標籤 #${tag} 的文章 — DEV ARTISAN // JOURNAL`,
    metaDescription: (tag) =>
      `瀏覽與 ${tag} 相關的技術文章、架構藍圖與系統紀錄。`,
    backToTopics: '所有主題與分類',
    count: (count) => `${count} 篇文章`,
    tagLabel: 'SYSTEM // 04 · TOPIC FILTER',
    desc: (tag) => `收錄於 ${tag} 之下的技術發布與架構藍圖。`,
    backHome: '回到首頁',
  },
  post: {
    breadcrumbArticles: '文章',
    share: 'SHARE //',
    copyLink: '複製連結',
    toc: 'SYSTEM // TOC',
    topics: 'TOPICS:',
    prev: '← 上一篇',
    next: '下一篇 →',
    backToArticles: '回到文章列表',
    authorTitle: '全端與 GenAI 架構師 · CKA 與 ISO 27001 主導稽核員',
    readTime: (minutes) => `約 ${minutes} 分鐘`,
    translationPending: '尚未翻譯',
    viewOriginal: '閱讀英文原文',
  },
  toast: {
    emailCopied: '電子郵件已複製',
    phoneCopied: '電話已複製',
    linkCopied: '文章網址已複製',
    copied: '已複製',
  },
};

const zhHans: UIStrings = {
  site: {
    title: 'DEV ARTISAN // JOURNAL — Alex.Hsiao',
    description:
      'Alex.Hsiao 的技术刊物与系统架构笔记 — 全栈与 GenAI 系统架构师。',
  },
  header: {
    logoSub: 'Alex.Hsiao · 全栈与 GenAI 架构师',
    beacon: '系统运行中：台北节点',
    navLabel: '主导航',
    nav: {
      home: '首页',
      articles: '文章',
      topics: '主题',
      contact: '联系',
    },
  },
  switcher: {
    label: 'LANG',
    aria: '选择语言',
    current: '当前语言',
    pending: '此页尚无翻译 — 将前往该语言的文章索引。',
  },
  footer: {
    brandDesc:
      '专注于裸机 GPU 集群、多代理 AI 协作、Kubernetes 基础设施与 ISO/IEC 27001 DevSecOps 治理的技术刊物。',
    operational: 'OPERATIONAL // TAIPEI, TAIWAN',
    navigation: 'NAVIGATION',
    navHome: '首页与简介',
    navArticles: '文章',
    navTopics: '主题与分类',
    credentials: 'CREDENTIALS',
    copyright: (year) =>
      `© ${year} Alex.Hsiao（Wei-Chun Hsiao）· 以 Astro 与 Design Token Mono 色系手工构建。`,
    fontMeta: 'FONT: INTER / MONO',
    paletteMeta: 'PALETTE: #1C1C1A / #F0EFEB',
  },
  card: {
    featured: '精选',
    read: '阅读',
    readTag: 'DISPATCH //',
  },
  cv: {
    certId: '验证编号：',
    verify: '公开认证',
    synopsis: '生产架构与部署场景',
    stack: '关键技术：',
    stackShort: '技术栈：',
  },
  author: {
    tag: 'AUTHOR PROFILE // 01',
    role: '全栈工程师暨 GenAI 系统架构师',
    bio: 'GenAI 工程师，专精于本地裸机 GPU 集群（NVIDIA GPU Operator 与 HAMi）、以 LangGraph 构建有状态的多代理 LLM 系统、分布式微服务，以及 ISO/IEC 27001 ISMS 治理。',
    button: '完整履历与简介',
    creds: [
      'NVIDIA GenAI',
      'CNCF CKA',
      'AWS SAP',
      'GCP PCA',
      'ISO 27001 主任审核员',
      'IEEE 论文',
    ],
  },
  articles: {
    metaTitle: '文章 — DEV ARTISAN // JOURNAL',
    metaDescription:
      'Alex.Hsiao 的技术文章与架构笔记 — 全栈与 GenAI 系统架构师。',
    tag: 'SYSTEM // 02 · TECHNICAL DISPATCHES',
    title: '文章与架构简报',
    desc: (posts, domains) =>
      `浏览 ${posts} 篇工程文章，涵盖 ${domains} 个技术领域。`,
    all: (posts) => `全部文章 (${posts})`,
    latest: 'LATEST TECHNICAL DISPATCHES',
    emptyTitle: '暂无发布的文章',
    emptyDesc:
      '刊物刚刚起步。关于 GPU 集群、多代理系统与基础设施的工程文章即将陆续上线。',
    authorTag: 'SYSTEM // AUTHOR',
    authorRole: 'GenAI 工程师',
    authorBio:
      '专精于 Python 与 Node 全栈系统、分布式消息中间件（RabbitMQ）、Kubernetes vGPU 虚拟化与云基础设施。',
    cvButton: '查看简介与认证',
    credsTag: 'SYSTEM // VERIFIED CREDENTIALS',
    topicsTag: 'SYSTEM // TOPICS',
    dispatchTag: 'SYSTEM // DISPATCH CHANNEL',
    dispatchText:
      '开放台北与远程的资深全栈、GenAI 系统与 GPU 集群架构职位合作机会。',
    copyEmail: '复制电子邮件',
  },
  topics: {
    metaTitle: '主题与架构分类 — DEV ARTISAN // JOURNAL',
    metaDescription:
      '按领域探索技术文章：裸机 GPU 虚拟化、多代理系统、Kubernetes、云安全与 ISO 27001 ISMS。',
    tag: 'SYSTEM // 03 · TAXONOMY INDEX',
    title: '技术领域与主题标签',
    desc: (posts) =>
      `浏览 ${posts} 篇工程文章，按核心系统领域与细分技术标签分类。`,
    primary: 'PRIMARY SYSTEMS DOMAINS',
    tagCloud: (count) => `INDIVIDUAL TECHNOLOGY TAGS (${count})`,
    articleCount: (count) => `${count} 篇文章`,
    domainTag: '// DOMAIN',
    domainDesc: (category) => `与 ${category} 相关的文章与架构蓝图。`,
    viewDispatches: '查看相关文章',
  },
  tag: {
    metaTitle: (tag) => `标签 #${tag} 的文章 — DEV ARTISAN // JOURNAL`,
    metaDescription: (tag) =>
      `浏览与 ${tag} 相关的技术文章、架构蓝图与系统记录。`,
    backToTopics: '所有主题与分类',
    count: (count) => `${count} 篇文章`,
    tagLabel: 'SYSTEM // 04 · TOPIC FILTER',
    desc: (tag) => `收录于 ${tag} 之下的技术发布与架构蓝图。`,
    backHome: '返回首页',
  },
  post: {
    breadcrumbArticles: '文章',
    share: 'SHARE //',
    copyLink: '复制链接',
    toc: 'SYSTEM // TOC',
    topics: 'TOPICS:',
    prev: '← 上一篇',
    next: '下一篇 →',
    backToArticles: '返回文章列表',
    authorTitle: '全栈与 GenAI 架构师 · CKA 与 ISO 27001 主任审核员',
    readTime: (minutes) => `约 ${minutes} 分钟`,
    translationPending: '尚未翻译',
    viewOriginal: '阅读英文原文',
  },
  toast: {
    emailCopied: '电子邮件已复制',
    phoneCopied: '电话已复制',
    linkCopied: '文章网址已复制',
    copied: '已复制',
  },
};

export const ui: Record<Lang, UIStrings> = {
  en,
  'zh-hant': zhHant,
  'zh-hans': zhHans,
};

export function useTranslations(lang: Lang): UIStrings {
  return ui[lang];
}
