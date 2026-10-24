import type { Lang } from '../i18n/config';

/**
 * CV / profile page content, one payload per locale.
 * Certification and product names stay in their official form; the prose
 * around them is translated.
 */

export interface SectionHead {
  tag: string;
  title: string;
  desc?: string;
}

export interface Certification {
  tag: string;
  title: string;
  issuer: string;
  id: string;
  url: string;
  image: string;
  description: string;
  meta: string;
}

export interface SkillGroup {
  tag: string;
  title: string;
  skills: { name: string; level: string }[];
  synopsis: string;
  stack: string;
}

export interface TimelineEntry {
  tag: string;
  period: string;
  company: string;
  location: string;
  role: string;
  bullets: string[];
  stack?: string;
}

export interface CVData {
  seo: { title: string; description: string };
  hero: {
    tag: string;
    role: string;
    status: string;
    name: string;
    alias: string;
    intro: string;
    ledger: { k: string; v: string }[];
  };
  sections: {
    certs: SectionHead;
    skills: SectionHead;
    timeline: SectionHead;
    dispatch: SectionHead;
  };
  certs: Certification[];
  skillGroups: SkillGroup[];
  timeline: TimelineEntry[];
  dispatch: {
    tag: string;
    telemetry: string;
    locationTitle: string;
    locationText: string;
    term: { k: string; v: string }[];
    mail: string;
    copyEmail: string;
    copyPhone: string;
    src: string;
    mapTooltip: string;
    mapSub: string;
    mapLabel: string;
  };
}

const en: CVData = {
  seo: {
    title: 'Alex.Hsiao (Wei-Chun Hsiao) — FullStack & GenAI Systems Architect',
    description:
      'Curriculum Vitae and verified credentials of Alex.Hsiao — FullStack Engineer & GenAI Systems Architect. 6 professional certifications, IEEE publication, and ~3 years enterprise experience.',
  },
  hero: {
    tag: 'SYSTEM // 01 · CANDIDATE PROFILE',
    role: 'FULLSTACK & GENAI ARCHITECT',
    status: 'ACTIVE // TAIPEI NODE',
    name: 'Alex Hsiao',
    alias: '(Wei-Chun Hsiao)',
    intro:
      'Currently serving as a <strong>GenAI Engineer</strong> with hands-on expertise spanning full-stack application development, bare-metal GPU virtualization (NVIDIA GPU Operator & HAMi), stateful Multi-Agent LLMs with LangGraph, distributed microservices, and ISO/IEC 27001 security compliance.',
    ledger: [
      { k: 'TARGET ROLES', v: 'FullStack Engineer / GenAI Systems Architect' },
      { k: 'EXPERIENCE', v: '~3 Years Enterprise FullStack & ML' },
      { k: 'EDUCATION', v: 'M.S. in CSIE, National Chiayi University' },
      { k: 'LANGUAGE', v: 'English (~3 Yrs Professional Proficiency)' },
    ],
  },
  sections: {
    certs: {
      tag: '// 01 · VERIFIED CREDENTIALS',
      title: 'Six Professional Certifications & IEEE Peer-Reviewed Publication',
      desc: '100% authentic credentials with direct public verification badges.',
    },
    skills: {
      tag: '// 02 · PRODUCTION TECHNICAL TAXONOMY',
      title: 'End-to-End Technology Stack & Infrastructure Tools',
    },
    timeline: {
      tag: '// 03 · CAREER CHRONICLE',
      title: 'Professional Experience & Research Trajectory',
    },
    dispatch: {
      tag: '// 04 · DISPATCH & CONTACT',
      title: 'Direct Communication Channel & Availability',
    },
  },
  certs: [
    {
      tag: 'CREDENTIAL // 01 · GENAI',
      title: 'NVIDIA Certified Professional: Generative AI LLMs',
      issuer: 'NVIDIA // CREDLY VERIFIED',
      id: 'f2df353f-b36d-41d5-b652-fbcea74abc6c',
      url: 'https://www.credly.com/badges/f2df353f-b36d-41d5-b652-fbcea74abc6c/public_url',
      image: '/images/certifications/nvidia-genai-llms-full.png',
      description:
        'Validates enterprise mastery in building, deploying, and accelerating large language model architectures. Encompasses parameter-efficient fine-tuning (PEFT/LoRA), vLLM & Triton inference serving, retrieval-augmented generation (RAG), and production LLM evaluation.',
      meta: 'NVIDIA Deep Learning Institute · Verified',
    },
    {
      tag: 'CREDENTIAL // 02 · CLOUD NATIVE',
      title: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'LINUX FOUNDATION / CNCF',
      id: 'fcbae132-9ad2-4995-ae14-6feeaa914d28',
      url: 'https://www.credly.com/badges/fcbae132-9ad2-4995-ae14-6feeaa914d28/public_url',
      image: '/images/certifications/cka-full.png',
      description:
        'Demonstrates production competence in Kubernetes cluster architecture, core component troubleshooting, networking (CNI/Ingress), storage volumes (CSI), cluster security, RBAC policies, and container workload maintenance.',
      meta: 'Cloud Native Computing Foundation · Verified',
    },
    {
      tag: 'CREDENTIAL // 03 · CLOUD ARCHITECTURE',
      title: 'AWS Certified Solutions Architect – Professional (SAP)',
      issuer: 'AMAZON WEB SERVICES',
      id: '13a54046-b8d0-40df-9094-8222ec7b0d2e',
      url: 'https://www.credly.com/badges/13a54046-b8d0-40df-9094-8222ec7b0d2e',
      image: '/images/certifications/aws-sap-full.png',
      description:
        'Pinnacle AWS professional credential validating advanced expertise in complex multi-tier enterprise architecture, multi-account governance (AWS Control Tower), high availability, disaster recovery, cost optimization, and hybrid cloud migrations.',
      meta: 'Amazon Web Services · SAP-C02 Professional',
    },
    {
      tag: 'CREDENTIAL // 04 · CLOUD ARCHITECTURE',
      title: 'Google Cloud Professional Cloud Architect (PCA)',
      issuer: 'GOOGLE CLOUD',
      id: 'd0031cb8-c858-4a63-8f54-521020f54a44',
      url: 'https://www.credly.com/badges/d0031cb8-c858-4a63-8f54-521020f54a44',
      image: '/images/certifications/gcp-pca-full.png',
      description:
        'Certifies comprehensive architecture competence on Google Cloud Platform, encompassing scalable microservice topologies on GKE, VPC network security, IAM least-privilege governance, data migration pipelines, and enterprise reliability engineering.',
      meta: 'Google Cloud Certified · Professional Tier',
    },
    {
      tag: 'CREDENTIAL // 05 · SECURITY GOVERNANCE',
      title: 'ISO/IEC 27001 Lead Auditor (Information Security)',
      issuer: 'TKSG // ISMS GOVERNANCE',
      id: '5615205852WH',
      url: 'https://tksg.org/admin/tool/certificate/index.php?code=5615205852WH',
      image: '/images/certifications/iso27001-full.png',
      description:
        'Professional Lead Auditor certification validating deep knowledge in Information Security Management Systems (ISMS), risk assessment methodologies, Annex A security control implementation, compliance audits, and security baseline governance.',
      meta: 'TKSG ISMS Lead Auditor · Certified',
    },
    {
      tag: 'CREDENTIAL // 06 · PYTHON ENGINEERING',
      title: 'PCPP1™ – Certified Professional Python Programmer Level 1',
      issuer: 'OPENEDG PYTHON INSTITUTE // CREDLY VERIFIED',
      id: '07249b48-0f1a-4b15-bf4a-f875a4fbec6b',
      url: 'https://www.credly.com/badges/07249b48-0f1a-4b15-bf4a-f875a4fbec6b',
      image: '/images/certifications/python-pcpp-1.png',
      description:
        'Flagship professional-level Python certification from the OpenEDG Python Institute validating advanced object-oriented programming, coding conventions and design standards, GUI application development with standard toolkits, network programming fundamentals (sockets, HTTP methods, and REST clients), and core Python standard library mastery. An industry-recognized credential that signals production-ready Python engineering capability.',
      meta: 'OpenEDG Python Institute · PCPP-32-101 Professional',
    },
    {
      tag: 'PUBLICATION // 07 · IEEE PEER-REVIEWED',
      title: 'IEEE Xplore: Deep Learning SQLi & XSS Detection',
      issuer: 'IEEE XPLORE // PEER REVIEWED',
      id: '10210155',
      url: 'https://ieeexplore.ieee.org/abstract/document/10210155',
      image: '/images/paper/paper.png',
      description:
        'Peer-reviewed research publication in IEEE Xplore introducing a novel hybrid deep learning architecture combining Multi-Model CNN, Bidirectional GRU, and Multi-Head Self-Attention mechanisms for robust real-time detection of SQLi and XSS attacks.',
      meta: 'IEEE Xplore Doc: 10210155 · Master Thesis',
    },
  ],
  skillGroups: [
    {
      tag: 'SYSTEM // ML & INFERENCE',
      title: 'GenAI & Machine Learning',
      skills: [
        { name: 'vLLM Inference Engine', level: 'Enterprise' },
        { name: 'LangGraph Multi-Agents', level: 'Production' },
        { name: 'HAMi vGPU Slicing', level: 'Enterprise' },
        { name: 'NVIDIA GPU Operator', level: 'Production' },
        { name: 'PyTorch & TensorFlow', level: '~3 Years' },
      ],
      synopsis:
        'Architecting containerized GPU clusters on bare-metal Kubernetes with NVIDIA GPU Operator and HAMi vGPU dynamic slicing to maximize compute density and hardware utilization. Designing stateful, autonomous multi-agent orchestration pipelines with LangGraph and low-latency LLM streaming inference endpoints via vLLM.',
      stack: 'K8s GPU Operator · HAMi · LangGraph · vLLM · PyTorch · HuggingFace',
    },
    {
      tag: 'SYSTEM // BACKEND & AMQP',
      title: 'FullStack & Distributed Systems',
      skills: [
        { name: 'FastAPI / Python', level: '~3 Years' },
        { name: 'Node.js (Async Runtimes)', level: '~3 Years' },
        { name: 'RabbitMQ (AMQP Broker)', level: 'Production' },
        { name: 'Django / Flask', level: '~2 Years' },
        { name: 'PHP / Laravel', level: '~1 Year' },
      ],
      synopsis:
        'Engineering high-throughput, non-blocking asynchronous microservices and reactive interfaces using FastAPI, modern Node.js, and React. Implementing enterprise AMQP message broker topologies with RabbitMQ to decouple critical distributed workloads and ensure reliable, fault-tolerant asynchronous task execution.',
      stack: 'FastAPI · Python · React.js · Node.js · RabbitMQ · RESTful / WebSockets',
    },
    {
      tag: 'SYSTEM // K8S & CLOUD',
      title: 'Cloud Fabric & Orchestration',
      skills: [
        { name: 'Kubernetes (CKA Certified)', level: '~2 Years' },
        { name: 'AWS Cloud (SAP Certified)', level: '~3 Years' },
        { name: 'Google Cloud (PCA Certified)', level: '~3 Years' },
        { name: 'Terraform (IaC Automation)', level: 'Production' },
        { name: 'Docker & Podman', level: '~3 Years' },
      ],
      synopsis:
        'Certified across Kubernetes (CKA), AWS Solutions Architect Professional (SAP), and GCP Professional Cloud Architect (PCA). Designing declarative Infrastructure as Code (IaC) with Terraform, orchestrating production container fabrics, executing complex cross-cloud migrations, and establishing zero-trust security baselines.',
      stack: 'Kubernetes · Terraform · AWS · Google Cloud · Ansible · RBAC & WAF',
    },
    {
      tag: 'SYSTEM // STORAGE & HA',
      title: 'Databases & Resilient Storage',
      skills: [
        { name: 'PostgreSQL', level: '~3 Years' },
        { name: 'Microsoft SQL Server', level: 'Enterprise' },
        { name: 'MongoDB & MySQL', level: '~3 Years' },
        { name: 'Longhorn HA Block Storage', level: 'Enterprise' },
        { name: 'MinIO / S3 Parquet', level: 'Production' },
      ],
      synopsis:
        'Structuring highly resilient, low-latency relational and document database layers across PostgreSQL, Microsoft SQL Server, and MongoDB. Deploying cloud-native distributed persistent block storage with Longhorn replication in Kubernetes alongside MinIO S3 object storage for analytical Parquet storage.',
      stack: 'PostgreSQL · SQL Server · MongoDB · Longhorn · MinIO / S3 · Redis',
    },
  ],
  timeline: [
    {
      tag: 'NODE // CURRENT',
      period: 'NOV 2025 – PRESENT',
      company: 'Tatung System Technologies Inc. (Tatung World Tech)',
      location: 'Zhongshan Dist., Taipei',
      role: 'GenAI Engineer / AI Engineer',
      bullets: [
        'Introduced LLM AI Agents into office automation, building an internal web application that automates form filling and classification.',
        'Delivered an enterprise asset management system for a client, integrating hybrid AI Agent, Document Search, Tool Call, <strong>RAG</strong>, and BM25 with S3-compatible file management, GIS coordinates, agent-based SQL querying, and automated AI Agent performance evaluation; deployed local models on <strong>RTX PRO 6000</strong> GPUs with Multi-Token Prediction, serving inference via vLLM and llama.cpp on Kubernetes across multiple GPUs.',
        'Contributed to <strong>WAF (CrowdSec)</strong> and <strong>Vault (OpenBao)</strong> deployments, establishing reliable and secure containerized infrastructure.',
        'Contributed to an agent-based business card automation system.',
        'Assisted in rolling out GPU server clusters and establishing standard operating procedures for LLM deployment.',
        'Spearheaded full-stack development for Generative AI Agent web applications utilizing React.js, FastAPI, and LangGraph multi-agent orchestration.',
        'Architected and managed containerized GPU clusters for AI workloads, optimizing compute density and vGPU allocation with <strong>NVIDIA GPU Operator and HAMi</strong>.',
        'Engineered custom QR code applications and high-throughput asynchronous message queues via RabbitMQ.',
      ],
      stack:
        'React.js, FastAPI, LangGraph, SQL Server, PostgreSQL, RabbitMQ, IIS, HAMi, GPU Operator, Longhorn, Cloudflare Tunnel, llama.cpp',
    },
    {
      tag: 'NODE // ACADEMIC ADVISORY',
      period: 'SEP 2025 – JUN 2026',
      company: 'AIGC Research Club, National Chiayi University',
      location: 'Chiayi City',
      role: 'Faculty Advisor / Technical Consultant',
      bullets: [
        'Invited as faculty advisor and guest lecturer during the club’s founding period, helping define its AIGC research direction and academic ethics guidelines.',
        'Taught in person throughout the term, sharing the latest generative AI trends and hands-on practice with members and raising the club’s overall technical level.',
        'Advised club operations and organizational development, helping the club clear the university’s review and run stably.',
      ],
    },
    {
      tag: 'NODE // NATIONAL CYBER SECURITY',
      period: 'MAR 2025 – NOV 2025 (9 MOS)',
      company: 'National Institute of Cyber Security (NICS)',
      location: 'Zhongzheng Dist., Taipei',
      role: 'Software Engineer',
      bullets: [
        'Drove cloud security initiatives and contributed directly to the development of the <strong>AWS Government Configuration Baseline</strong> for national infrastructure.',
        'Researched and implemented cutting-edge AI features and autonomous workflows using LangGraph and Multi-Agent LLMs.',
        'Constructed secure serverless and containerized APIs with Next.js, FastAPI, and MongoDB backend storage.',
      ],
      stack:
        'Python, Next.js, LangGraph, FastAPI, CloudFormation, MongoDB, AWS Security Baselines',
    },
    {
      tag: 'NODE // CLOUD ARCHITECTURE',
      period: 'JUN 2024 – MAR 2025 (10 MOS)',
      company: 'Cloud Service Provider (Agency)',
      location: 'Nangang Dist., Taipei',
      role: 'Project Engineer / Software Engineer',
      bullets: [
        'Architected and implemented enterprise GCP and AWS cloud environments, executed complex cross-cloud migrations, and configured secure site-to-site VPNs.',
        'Designed centralized monitoring platforms and deployed production Kubernetes clusters with fine-grained RBAC security policies.',
        'Managed network topology planning and security perimeters: WAF, Firewalls, Load Balancers, and VPC peering.',
        'Authored automated Infrastructure as Code (IaC) with Terraform and resolved mission-critical infrastructure incidents.',
      ],
      stack: 'Kubernetes, GCP, AWS, Terraform, Ansible, WAF, Cloud Architecture',
    },
    {
      tag: 'NODE // RESEARCH & THESIS',
      period: 'SEP 2021 – OCT 2023 (2 YRS 2 MOS)',
      company: 'Information Security Lab, NCYU CSIE',
      location: 'Chiayi City, Taiwan',
      role: "Master's Researcher & Project Assistant",
      bullets: [
        'Conducted advanced research in deep learning and cybersecurity intrusion detection for web application security.',
        'Designed a novel hybrid architecture combining Multi-Model CNN, Bidirectional GRU, and Multi-Head Self-Attention for SQLi and XSS attack detection.',
        "Published peer-reviewed master's thesis research in IEEE Xplore (Doc: 10210155).",
        'Developed machine learning pipelines and research demonstration web platforms with Python, Django, Flask, PyTorch, and TensorFlow.',
      ],
      stack:
        'Python, PyTorch, TensorFlow, Django, Flask, Deep Learning, IEEE Publication',
    },
    {
      tag: 'NODE // EARLY CAREER',
      period: 'DEC 2019 – MAR 2020 (4 MOS)',
      company: 'Ticrown Asset Management Ltd.',
      location: 'Daliao Dist., Kaohsiung City',
      role: 'PHP Assistant Engineer / Web Designer',
      bullets: [
        'Collaborated on the development and UI implementation of a PHP Laravel-based logistics management system for a shipping container enterprise.',
        'Designed database schemas and responsive web views before transitioning to graduate studies in computer science.',
      ],
      stack: 'PHP, Laravel, MySQL, JavaScript, CSS',
    },
  ],
  dispatch: {
    tag: 'TERMINAL // GLOBAL TELEMETRY & DISPATCH NODE',
    telemetry: 'LOC: 25.0330° N, 121.5654° E · UTC+8 · [DRAG & ZOOM ENABLED]',
    locationTitle: 'PRIMARY NODE // TAIPEI, TAIWAN',
    locationText:
      'Stationed in <strong>Taipei, Taiwan (UTC+8)</strong>. Available for on-site & hybrid engineering roles in Taipei, and worldwide remote collaboration across distributed teams.',
    term: [
      { k: '> CANDIDATE:', v: 'Alex.Hsiao (Wei-Chun Hsiao)' },
      { k: '> LOCATION:', v: 'Taipei, Taiwan (UTC+8 · CST)' },
      { k: '> WORK MODE:', v: 'Taipei Hybrid / On-Site & Global Remote' },
      { k: '> STATUS:', v: 'ONLINE // OPEN FOR SENIOR ROLES' },
      { k: '> EMAIL:', v: 'q123717111@gmail.com' },
      { k: '> PHONE:', v: '+886 0970-565-709' },
    ],
    mail: 'Send Direct Email',
    copyEmail: 'Copy Email',
    copyPhone: 'Copy Phone',
    src: 'GEOJSON 1:110M · ECHARTS MONO TELEMETRY · TAIPEI UTC+8 NODE',
    mapTooltip: 'PRIMARY NODE // TAIPEI, TAIWAN',
    mapSub: '25.0330° N, 121.5654° E · UTC+8 (CST)',
    mapLabel: 'TAIPEI, TAIWAN [UTC+8]',
  },
};

const zhHant: CVData = {
  seo: {
    title: 'Alex.Hsiao（Wei-Chun Hsiao）— 全端與 GenAI 系統架構師',
    description:
      'Alex.Hsiao 的完整履歷與可驗證認證 — 全端工程師暨 GenAI 系統架構師。六項專業認證、IEEE 論文發表，以及約 3 年企業級實務經驗。',
  },
  hero: {
    tag: 'SYSTEM // 01 · CANDIDATE PROFILE',
    role: 'FULLSTACK & GENAI ARCHITECT',
    status: 'ACTIVE // TAIPEI NODE',
    name: 'Alex Hsiao',
    alias: '（Wei-Chun Hsiao）',
    intro:
      '目前擔任 <strong>GenAI 工程師</strong>，實務經驗涵蓋全端應用開發、裸機 GPU 虛擬化（NVIDIA GPU Operator 與 HAMi）、以 LangGraph 打造具狀態的多代理 LLM、分散式微服務，以及 ISO/IEC 27001 安全合規。',
    ledger: [
      { k: 'TARGET ROLES', v: '全端工程師 / GenAI 系統架構師' },
      { k: 'EXPERIENCE', v: '約 3 年企業級全端與 ML 經驗' },
      { k: 'EDUCATION', v: '國立嘉義大學資訊工程學系碩士' },
      { k: 'LANGUAGE', v: '英文（約 3 年專業工作程度）' },
    ],
  },
  sections: {
    certs: {
      tag: '// 01 · VERIFIED CREDENTIALS',
      title: '六項專業認證與 IEEE 同儕審查論文',
      desc: '100% 真實可驗證的公開認證徽章。',
    },
    skills: {
      tag: '// 02 · PRODUCTION TECHNICAL TAXONOMY',
      title: '端到端技術棧與基礎設施工具',
    },
    timeline: {
      tag: '// 03 · CAREER CHRONICLE',
      title: '工作經歷與研究軌跡',
    },
    dispatch: {
      tag: '// 04 · DISPATCH & CONTACT',
      title: '直接聯絡管道與合作狀態',
    },
  },
  certs: [
    {
      tag: 'CREDENTIAL // 01 · GENAI',
      title: 'NVIDIA 生成式 AI 大型語言模型專業認證',
      issuer: 'NVIDIA // CREDLY VERIFIED',
      id: 'f2df353f-b36d-41d5-b652-fbcea74abc6c',
      url: 'https://www.credly.com/badges/f2df353f-b36d-41d5-b652-fbcea74abc6c/public_url',
      image: '/images/certifications/nvidia-genai-llms-full.png',
      description:
        '驗證在大型語言模型架構的建置、部署與加速上的企業級實力，涵蓋參數高效微調（PEFT/LoRA）、vLLM 與 Triton 推論服務、檢索增強生成（RAG），以及生產環境的 LLM 評估。',
      meta: 'NVIDIA 深度學習機構 · 已驗證',
    },
    {
      tag: 'CREDENTIAL // 02 · CLOUD NATIVE',
      title: 'Kubernetes 管理員認證（CKA）',
      issuer: 'LINUX FOUNDATION / CNCF',
      id: 'fcbae132-9ad2-4995-ae14-6feeaa914d28',
      url: 'https://www.credly.com/badges/fcbae132-9ad2-4995-ae14-6feeaa914d28/public_url',
      image: '/images/certifications/cka-full.png',
      description:
        '證明具備 Kubernetes 叢集架構、核心元件疑難排解、網路（CNI/Ingress）、儲存卷（CSI）、叢集安全、RBAC 策略與容器工作負載維運的生產級能力。',
      meta: 'CNCF · 已驗證',
    },
    {
      tag: 'CREDENTIAL // 03 · CLOUD ARCHITECTURE',
      title: 'AWS 解決方案架構師 – 專業級（SAP）',
      issuer: 'AMAZON WEB SERVICES',
      id: '13a54046-b8d0-40df-9094-8222ec7b0d2e',
      url: 'https://www.credly.com/badges/13a54046-b8d0-40df-9094-8222ec7b0d2e',
      image: '/images/certifications/aws-sap-full.png',
      description:
        'AWS 最高階專業認證，驗證在多層企業架構、多帳號治理（AWS Control Tower）、高可用性、災難復原、成本最佳化與混合雲遷移上的進階專業。',
      meta: 'Amazon Web Services · SAP-C02 專業級',
    },
    {
      tag: 'CREDENTIAL // 04 · CLOUD ARCHITECTURE',
      title: 'Google Cloud 專業雲端架構師（PCA）',
      issuer: 'GOOGLE CLOUD',
      id: 'd0031cb8-c858-4a63-8f54-521020f54a44',
      url: 'https://www.credly.com/badges/d0031cb8-c858-4a63-8f54-521020f54a44',
      image: '/images/certifications/gcp-pca-full.png',
      description:
        '認證在 Google Cloud Platform 上的整體架構能力，涵蓋 GKE 可擴展微服務拓撲、VPC 網路安全、IAM 最小權限治理、資料遷移管線與企業級可靠性工程。',
      meta: 'Google Cloud 認證 · 專業級',
    },
    {
      tag: 'CREDENTIAL // 05 · SECURITY GOVERNANCE',
      title: 'ISO/IEC 27001 資訊安全主導稽核員',
      issuer: 'TKSG // ISMS GOVERNANCE',
      id: '5615205852WH',
      url: 'https://tksg.org/admin/tool/certificate/index.php?code=5615205852WH',
      image: '/images/certifications/iso27001-full.png',
      description:
        '專業主導稽核員認證，驗證對資訊安全管理系統（ISMS）、風險評鑑方法、附錄 A 安全控制實作、合規稽核與安全基線治理的深入掌握。',
      meta: 'TKSG ISMS 主導稽核員 · 已認證',
    },
    {
      tag: 'CREDENTIAL // 06 · PYTHON ENGINEERING',
      title: 'PCPP1™ – Python 專業程式設計師認證 Level 1',
      issuer: 'OPENEDG PYTHON INSTITUTE // CREDLY VERIFIED',
      id: '07249b48-0f1a-4b15-bf4a-f875a4fbec6b',
      url: 'https://www.credly.com/badges/07249b48-0f1a-4b15-bf4a-f875a4fbec6b',
      image: '/images/certifications/python-pcpp-1.png',
      description:
        'OpenEDG Python Institute 的旗艦專業級認證，驗證進階物件導向程式設計、編碼慣例與設計標準、以標準工具組開發 GUI 應用、網路程式設計基礎（socket、HTTP 方法與 REST 用戶端），以及 Python 標準函式庫的掌握。',
      meta: 'OpenEDG Python Institute · PCPP-32-101 專業級',
    },
    {
      tag: 'PUBLICATION // 07 · IEEE PEER-REVIEWED',
      title: 'IEEE Xplore：SQLi 與 XSS 深度學習偵測論文',
      issuer: 'IEEE XPLORE // PEER REVIEWED',
      id: '10210155',
      url: 'https://ieeexplore.ieee.org/abstract/document/10210155',
      image: '/images/paper/paper.png',
      description:
        '收錄於 IEEE Xplore 的同儕審查研究，提出結合多模型 CNN、雙向 GRU 與多頭自注意力機制的新型混合深度學習架構，用於穩健地即時偵測 SQLi 與 XSS 攻擊。',
      meta: 'IEEE Xplore 文獻 10210155 · 碩士論文',
    },
  ],
  skillGroups: [
    {
      tag: 'SYSTEM // ML & INFERENCE',
      title: 'GenAI 與機器學習',
      skills: [
        { name: 'vLLM 推論引擎', level: '企業級' },
        { name: 'LangGraph 多代理系統', level: '生產環境' },
        { name: 'HAMi vGPU 切分', level: '企業級' },
        { name: 'NVIDIA GPU Operator', level: '生產環境' },
        { name: 'PyTorch 與 TensorFlow', level: '約 3 年' },
      ],
      synopsis:
        '在裸機 Kubernetes 上以 NVIDIA GPU Operator 與 HAMi vGPU 動態切分建構容器化 GPU 叢集，最大化運算密度與硬體使用率。以 LangGraph 設計具狀態、可自主運作的多代理協作流程，並透過 vLLM 提供低延遲的 LLM 串流推論端點。',
      stack: 'K8s GPU Operator · HAMi · LangGraph · vLLM · PyTorch · HuggingFace',
    },
    {
      tag: 'SYSTEM // BACKEND & AMQP',
      title: '全端與分散式系統',
      skills: [
        { name: 'FastAPI / Python', level: '約 3 年' },
        { name: 'Node.js（非同步執行環境）', level: '約 3 年' },
        { name: 'RabbitMQ（AMQP 訊息中介）', level: '生產環境' },
        { name: 'Django / Flask', level: '約 2 年' },
        { name: 'PHP / Laravel', level: '約 1 年' },
      ],
      synopsis:
        '以 FastAPI、現代 Node.js 與 React 打造高吞吐、非阻塞的非同步微服務與反應式介面。以 RabbitMQ 實作企業級 AMQP 訊息中介拓撲，解耦關鍵分散式工作負載，確保可靠且容錯的非同步任務執行。',
      stack: 'FastAPI · Python · React.js · Node.js · RabbitMQ · RESTful / WebSockets',
    },
    {
      tag: 'SYSTEM // K8S & CLOUD',
      title: '雲端架構與編排',
      skills: [
        { name: 'Kubernetes（CKA 認證）', level: '約 2 年' },
        { name: 'AWS 雲端（SAP 認證）', level: '約 3 年' },
        { name: 'Google Cloud（PCA 認證）', level: '約 3 年' },
        { name: 'Terraform（IaC 自動化）', level: '生產環境' },
        { name: 'Docker 與 Podman', level: '約 3 年' },
      ],
      synopsis:
        '取得 Kubernetes（CKA）、AWS 解決方案架構師專業級（SAP）與 GCP 專業雲端架構師（PCA）認證。以 Terraform 設計宣告式基礎設施即程式碼（IaC），編排生產容器環境、執行複雜的跨雲遷移，並建立零信任安全基線。',
      stack: 'Kubernetes · Terraform · AWS · Google Cloud · Ansible · RBAC & WAF',
    },
    {
      tag: 'SYSTEM // STORAGE & HA',
      title: '資料庫與韌性儲存',
      skills: [
        { name: 'PostgreSQL', level: '約 3 年' },
        { name: 'Microsoft SQL Server', level: '企業級' },
        { name: 'MongoDB 與 MySQL', level: '約 3 年' },
        { name: 'Longhorn 高可用區塊儲存', level: '企業級' },
        { name: 'MinIO / S3 Parquet', level: '生產環境' },
      ],
      synopsis:
        '在 PostgreSQL、Microsoft SQL Server 與 MongoDB 上建構高韌性、低延遲的關聯式與文件資料庫層。於 Kubernetes 中部署具 Longhorn 複寫的雲原生分散式持久區塊儲存，並以 MinIO S3 物件儲存支援分析用 Parquet 資料。',
      stack: 'PostgreSQL · SQL Server · MongoDB · Longhorn · MinIO / S3 · Redis',
    },
  ],
  timeline: [
    {
      tag: 'NODE // CURRENT',
      period: '2025 年 11 月 – 迄今',
      company: '大同世界科技（Tatung System Technologies）',
      location: '台北市中山區',
      role: 'GenAI 工程師 / AI 工程師',
      bullets: [
        '將 LLM AI Agent 導入辦公室自動化，建立公司內部網頁應用，讓表單填寫與分類自動化。',
        '於專案中為客戶建置企業資產管理系統，整合混合 AI Agent、Document Search、Tool Call、<strong>RAG</strong> 與 BM25，具備 S3 相容檔案管理、GIS 地理座標、Agent 式 SQL 查詢與 AI Agent 效能自動評估；以 <strong>RTX PRO 6000</strong> GPU 本地部署模型並支援 Multi-Token Prediction，推論服務運行於 Kubernetes 上的 vLLM 與 llama.cpp，採多卡執行。',
        '參與 <strong>WAF（CrowdSec）</strong>與 <strong>Vault（OpenBao）</strong>建置，打造可靠且安全的容器化環境。',
        '參與基於 Agent 的名片自動化系統建置。',
        '協助導入 GPU Server 叢集，並協助建立大語言模型部署標準作業流程。',
        '主導生成式 AI Agent 網頁應用的全端開發，採用 React.js、FastAPI 與 LangGraph 多代理協作。',
        '規劃並維運容器化 GPU 叢集，以 <strong>NVIDIA GPU Operator 與 HAMi</strong> 最佳化運算密度與 vGPU 配置。',
        '開發自訂 QR Code 應用，並以 RabbitMQ 建構高吞吐非同步訊息佇列。',
      ],
      stack:
        'React.js、FastAPI、LangGraph、SQL Server、PostgreSQL、RabbitMQ、IIS、HAMi、GPU Operator、Longhorn、Cloudflare Tunnel、llama.cpp',
    },
    {
      tag: 'NODE // ACADEMIC ADVISORY',
      period: '2025 年 9 月 – 2026 年 6 月',
      company: '國立嘉義大學 AIGC 研究社',
      location: '嘉義市',
      role: '社團指導老師 / 專業技術顧問（Faculty Advisor）',
      bullets: [
        '於社團草創期受邀擔任指導老師與專業講師，協助定義 AIGC 技術研究方向與學術倫理規範。',
        '於學期中親自授課，將生成式 AI 的最新趨勢與實作經驗傳授給社員，提升整體技術水平。',
        '指導社務運作與組織發展，協助社團順利通過校方審核並穩定運作。',
      ],
    },
    {
      tag: 'NODE // NATIONAL CYBER SECURITY',
      period: '2025 年 3 月 – 2025 年 11 月（9 個月）',
      company: '國家資通安全研究院（NICS）',
      location: '台北市中正區',
      role: '軟體工程師',
      bullets: [
        '推動雲端安全計畫，直接參與國家基礎設施的 <strong>AWS 政府組態基準（GCB）</strong>制定。',
        '研究並實作以 LangGraph 與多代理 LLM 為核心的前沿 AI 功能與自主工作流程。',
        '以 Next.js、FastAPI 與 MongoDB 建構安全的無伺服器與容器化 API。',
      ],
      stack:
        'Python、Next.js、LangGraph、FastAPI、CloudFormation、MongoDB、AWS 安全基準',
    },
    {
      tag: 'NODE // CLOUD ARCHITECTURE',
      period: '2024 年 6 月 – 2025 年 3 月（10 個月）',
      company: '雲端服務代理商',
      location: '台北市南港區',
      role: '專案工程師 / 軟體工程師',
      bullets: [
        '規劃並實作企業級 GCP 與 AWS 雲端環境，執行複雜的跨雲遷移並配置安全的站對站 VPN。',
        '設計集中式監控平台，部署具細緻 RBAC 策略的生產 Kubernetes 叢集。',
        '負責網路拓撲規劃與安全邊界：WAF、防火牆、負載平衡器與 VPC 對等連線。',
        '以 Terraform 撰寫自動化 IaC，並處理關鍵基礎設施事故。',
      ],
      stack: 'Kubernetes、GCP、AWS、Terraform、Ansible、WAF、雲端架構',
    },
    {
      tag: 'NODE // RESEARCH & THESIS',
      period: '2021 年 9 月 – 2023 年 10 月（2 年 2 個月）',
      company: '國立嘉義大學資訊工程學系 資訊安全實驗室',
      location: '嘉義市',
      role: '碩士研究員 / 專案助理',
      bullets: [
        '從事深度學習與網路安全入侵偵測研究，聚焦網頁應用安全。',
        '設計結合多模型 CNN、雙向 GRU 與多頭自注意力的混合架構，用於 SQLi 與 XSS 攻擊偵測。',
        '碩士論文研究發表於 IEEE Xplore（文獻編號 10210155）。',
        '以 Python、Django、Flask、PyTorch 與 TensorFlow 開發機器學習管線與研究展示平台。',
      ],
      stack:
        'Python、PyTorch、TensorFlow、Django、Flask、深度學習、IEEE 論文',
    },
    {
      tag: 'NODE // EARLY CAREER',
      period: '2019 年 12 月 – 2020 年 3 月（4 個月）',
      company: 'Ticrown Asset Management Ltd.',
      location: '高雄市大寮區',
      role: 'PHP 助理工程師 / 網頁設計',
      bullets: [
        '參與貨櫃運輸企業的 PHP Laravel 物流管理系統開發與介面實作。',
        '設計資料庫結構與響應式網頁，隨後轉攻資訊工程研究所。',
      ],
      stack: 'PHP、Laravel、MySQL、JavaScript、CSS',
    },
  ],
  dispatch: {
    tag: 'TERMINAL // GLOBAL TELEMETRY & DISPATCH NODE',
    telemetry: 'LOC: 25.0330° N, 121.5654° E · UTC+8 · [DRAG & ZOOM ENABLED]',
    locationTitle: '主要節點 // 台北，台灣',
    locationText:
      '常駐<strong>台北，台灣（UTC+8）</strong>。可配合台北的到班與混合辦公職務，並支援全球分散式團隊的遠端協作。',
    term: [
      { k: '> 應徵者：', v: 'Alex.Hsiao（Wei-Chun Hsiao）' },
      { k: '> 地點：', v: '台北，台灣（UTC+8 · CST）' },
      { k: '> 工作模式：', v: '台北混合 / 到班，以及全球遠端' },
      { k: '> 狀態：', v: 'ONLINE // 開放資深職缺' },
      { k: '> 電子郵件：', v: 'q123717111@gmail.com' },
      { k: '> 電話：', v: '+886 0970-565-709' },
    ],
    mail: '直接寄送電子郵件',
    copyEmail: '複製電子郵件',
    copyPhone: '複製電話',
    src: 'GEOJSON 1:110M · ECHARTS MONO TELEMETRY · TAIPEI UTC+8 NODE',
    mapTooltip: '主要節點 // 台北，台灣',
    mapSub: '25.0330° N, 121.5654° E · UTC+8（CST）',
    mapLabel: '台北，台灣 [UTC+8]',
  },
};

const zhHans: CVData = {
  seo: {
    title: 'Alex.Hsiao（Wei-Chun Hsiao）— 全栈与 GenAI 系统架构师',
    description:
      'Alex.Hsiao 的完整履历与可验证认证 — 全栈工程师暨 GenAI 系统架构师。六项专业认证、IEEE 论文发表，以及约 3 年企业级实践经验。',
  },
  hero: {
    tag: 'SYSTEM // 01 · CANDIDATE PROFILE',
    role: 'FULLSTACK & GENAI ARCHITECT',
    status: 'ACTIVE // TAIPEI NODE',
    name: 'Alex Hsiao',
    alias: '（Wei-Chun Hsiao）',
    intro:
      '目前担任 <strong>GenAI 工程师</strong>，实践经验涵盖全栈应用开发、裸机 GPU 虚拟化（NVIDIA GPU Operator 与 HAMi）、以 LangGraph 构建有状态的多代理 LLM、分布式微服务，以及 ISO/IEC 27001 安全合规。',
    ledger: [
      { k: 'TARGET ROLES', v: '全栈工程师 / GenAI 系统架构师' },
      { k: 'EXPERIENCE', v: '约 3 年企业级全栈与 ML 经验' },
      { k: 'EDUCATION', v: '国立嘉义大学信息工程学系硕士' },
      { k: 'LANGUAGE', v: '英文（约 3 年专业工作程度）' },
    ],
  },
  sections: {
    certs: {
      tag: '// 01 · VERIFIED CREDENTIALS',
      title: '六项专业认证与 IEEE 同行评审论文',
      desc: '100% 真实可验证的公开认证徽章。',
    },
    skills: {
      tag: '// 02 · PRODUCTION TECHNICAL TAXONOMY',
      title: '端到端技术栈与基础设施工具',
    },
    timeline: {
      tag: '// 03 · CAREER CHRONICLE',
      title: '工作经历与研究轨迹',
    },
    dispatch: {
      tag: '// 04 · DISPATCH & CONTACT',
      title: '直接联系渠道与合作状态',
    },
  },
  certs: [
    {
      tag: 'CREDENTIAL // 01 · GENAI',
      title: 'NVIDIA 生成式 AI 大语言模型专业认证',
      issuer: 'NVIDIA // CREDLY VERIFIED',
      id: 'f2df353f-b36d-41d5-b652-fbcea74abc6c',
      url: 'https://www.credly.com/badges/f2df353f-b36d-41d5-b652-fbcea74abc6c/public_url',
      image: '/images/certifications/nvidia-genai-llms-full.png',
      description:
        '验证在大语言模型架构的构建、部署与加速上的企业级实力，涵盖参数高效微调（PEFT/LoRA）、vLLM 与 Triton 推理服务、检索增强生成（RAG），以及生产环境的 LLM 评估。',
      meta: 'NVIDIA 深度学习机构 · 已验证',
    },
    {
      tag: 'CREDENTIAL // 02 · CLOUD NATIVE',
      title: 'Kubernetes 管理员认证（CKA）',
      issuer: 'LINUX FOUNDATION / CNCF',
      id: 'fcbae132-9ad2-4995-ae14-6feeaa914d28',
      url: 'https://www.credly.com/badges/fcbae132-9ad2-4995-ae14-6feeaa914d28/public_url',
      image: '/images/certifications/cka-full.png',
      description:
        '证明具备 Kubernetes 集群架构、核心组件故障排查、网络（CNI/Ingress）、存储卷（CSI）、集群安全、RBAC 策略与容器工作负载运维的生产级能力。',
      meta: 'CNCF · 已验证',
    },
    {
      tag: 'CREDENTIAL // 03 · CLOUD ARCHITECTURE',
      title: 'AWS 解决方案架构师 – 专业级（SAP）',
      issuer: 'AMAZON WEB SERVICES',
      id: '13a54046-b8d0-40df-9094-8222ec7b0d2e',
      url: 'https://www.credly.com/badges/13a54046-b8d0-40df-9094-8222ec7b0d2e',
      image: '/images/certifications/aws-sap-full.png',
      description:
        'AWS 最高阶专业认证，验证在多层级企业架构、多账号治理（AWS Control Tower）、高可用性、灾难恢复、成本优化与混合云迁移上的进阶专业。',
      meta: 'Amazon Web Services · SAP-C02 专业级',
    },
    {
      tag: 'CREDENTIAL // 04 · CLOUD ARCHITECTURE',
      title: 'Google Cloud 专业云架构师（PCA）',
      issuer: 'GOOGLE CLOUD',
      id: 'd0031cb8-c858-4a63-8f54-521020f54a44',
      url: 'https://www.credly.com/badges/d0031cb8-c858-4a63-8f54-521020f54a44',
      image: '/images/certifications/gcp-pca-full.png',
      description:
        '认证在 Google Cloud Platform 上的整体架构能力，涵盖 GKE 可扩展微服务拓扑、VPC 网络安全、IAM 最小权限治理、数据迁移管道与企业级可靠性工程。',
      meta: 'Google Cloud 认证 · 专业级',
    },
    {
      tag: 'CREDENTIAL // 05 · SECURITY GOVERNANCE',
      title: 'ISO/IEC 27001 信息安全主任审核员',
      issuer: 'TKSG // ISMS GOVERNANCE',
      id: '5615205852WH',
      url: 'https://tksg.org/admin/tool/certificate/index.php?code=5615205852WH',
      image: '/images/certifications/iso27001-full.png',
      description:
        '专业主任审核员认证，验证对信息安全管理体系（ISMS）、风险评估方法、附录 A 安全控制实现、合规审核与安全基线治理的深入掌握。',
      meta: 'TKSG ISMS 主任审核员 · 已认证',
    },
    {
      tag: 'CREDENTIAL // 06 · PYTHON ENGINEERING',
      title: 'PCPP1™ – Python 专业程序员认证 Level 1',
      issuer: 'OPENEDG PYTHON INSTITUTE // CREDLY VERIFIED',
      id: '07249b48-0f1a-4b15-bf4a-f875a4fbec6b',
      url: 'https://www.credly.com/badges/07249b48-0f1a-4b15-bf4a-f875a4fbec6b',
      image: '/images/certifications/python-pcpp-1.png',
      description:
        'OpenEDG Python Institute 的旗舰专业级认证，验证进阶面向对象编程、编码规范与设计标准、以标准工具包开发 GUI 应用、网络编程基础（socket、HTTP 方法与 REST 客户端），以及 Python 标准库的掌握。',
      meta: 'OpenEDG Python Institute · PCPP-32-101 专业级',
    },
    {
      tag: 'PUBLICATION // 07 · IEEE PEER-REVIEWED',
      title: 'IEEE Xplore：SQLi 与 XSS 深度学习检测论文',
      issuer: 'IEEE XPLORE // PEER REVIEWED',
      id: '10210155',
      url: 'https://ieeexplore.ieee.org/abstract/document/10210155',
      image: '/images/paper/paper.png',
      description:
        '收录于 IEEE Xplore 的同行评审研究，提出结合多模型 CNN、双向 GRU 与多头自注意力机制的新型混合深度学习架构，用于稳健地实时检测 SQLi 与 XSS 攻击。',
      meta: 'IEEE Xplore 文献 10210155 · 硕士论文',
    },
  ],
  skillGroups: [
    {
      tag: 'SYSTEM // ML & INFERENCE',
      title: 'GenAI 与机器学习',
      skills: [
        { name: 'vLLM 推理引擎', level: '企业级' },
        { name: 'LangGraph 多代理系统', level: '生产环境' },
        { name: 'HAMi vGPU 切分', level: '企业级' },
        { name: 'NVIDIA GPU Operator', level: '生产环境' },
        { name: 'PyTorch 与 TensorFlow', level: '约 3 年' },
      ],
      synopsis:
        '在裸机 Kubernetes 上以 NVIDIA GPU Operator 与 HAMi vGPU 动态切分构建容器化 GPU 集群，最大化计算密度与硬件利用率。以 LangGraph 设计有状态、可自主运行的多代理协作流程，并通过 vLLM 提供低延迟的 LLM 流式推理端点。',
      stack: 'K8s GPU Operator · HAMi · LangGraph · vLLM · PyTorch · HuggingFace',
    },
    {
      tag: 'SYSTEM // BACKEND & AMQP',
      title: '全栈与分布式系统',
      skills: [
        { name: 'FastAPI / Python', level: '约 3 年' },
        { name: 'Node.js（异步运行时）', level: '约 3 年' },
        { name: 'RabbitMQ（AMQP 消息中间件）', level: '生产环境' },
        { name: 'Django / Flask', level: '约 2 年' },
        { name: 'PHP / Laravel', level: '约 1 年' },
      ],
      synopsis:
        '以 FastAPI、现代 Node.js 与 React 打造高吞吐、非阻塞的异步微服务与响应式界面。以 RabbitMQ 实现企业级 AMQP 消息中间件拓扑，解耦关键分布式工作负载，确保可靠且容错的异步任务执行。',
      stack: 'FastAPI · Python · React.js · Node.js · RabbitMQ · RESTful / WebSockets',
    },
    {
      tag: 'SYSTEM // K8S & CLOUD',
      title: '云架构与编排',
      skills: [
        { name: 'Kubernetes（CKA 认证）', level: '约 2 年' },
        { name: 'AWS 云（SAP 认证）', level: '约 3 年' },
        { name: 'Google Cloud（PCA 认证）', level: '约 3 年' },
        { name: 'Terraform（IaC 自动化）', level: '生产环境' },
        { name: 'Docker 与 Podman', level: '约 3 年' },
      ],
      synopsis:
        '取得 Kubernetes（CKA）、AWS 解决方案架构师专业级（SAP）与 GCP 专业云架构师（PCA）认证。以 Terraform 设计声明式基础设施即代码（IaC），编排生产容器环境、执行复杂的跨云迁移，并建立零信任安全基线。',
      stack: 'Kubernetes · Terraform · AWS · Google Cloud · Ansible · RBAC & WAF',
    },
    {
      tag: 'SYSTEM // STORAGE & HA',
      title: '数据库与韧性存储',
      skills: [
        { name: 'PostgreSQL', level: '约 3 年' },
        { name: 'Microsoft SQL Server', level: '企业级' },
        { name: 'MongoDB 与 MySQL', level: '约 3 年' },
        { name: 'Longhorn 高可用块存储', level: '企业级' },
        { name: 'MinIO / S3 Parquet', level: '生产环境' },
      ],
      synopsis:
        '在 PostgreSQL、Microsoft SQL Server 与 MongoDB 上构建高韧性、低延迟的关系型与文档数据库层。在 Kubernetes 中部署具备 Longhorn 复制的云原生分布式持久块存储，并以 MinIO S3 对象存储支撑分析用 Parquet 数据。',
      stack: 'PostgreSQL · SQL Server · MongoDB · Longhorn · MinIO / S3 · Redis',
    },
  ],
  timeline: [
    {
      tag: 'NODE // CURRENT',
      period: '2025 年 11 月 – 至今',
      company: '大同世界科技（Tatung System Technologies）',
      location: '台北市中山区',
      role: 'GenAI 工程师 / AI 工程师',
      bullets: [
        '将 LLM AI Agent 导入办公室自动化，建立公司内部网页应用，让表单填写与分类自动化。',
        '于项目中为客户构建企业资产管理系统，集成混合 AI Agent、Document Search、Tool Call、<strong>RAG</strong> 与 BM25，具备 S3 兼容文件管理、GIS 地理坐标、Agent 式 SQL 查询与 AI Agent 性能自动评估；以 <strong>RTX PRO 6000</strong> GPU 本地部署模型并支持 Multi-Token Prediction，推理服务运行于 Kubernetes 上的 vLLM 与 llama.cpp，采多卡运行。',
        '参与 <strong>WAF（CrowdSec）</strong>与 <strong>Vault（OpenBao）</strong>搭建，打造可靠且安全的容器化环境。',
        '参与基于 Agent 的名片自动化系统搭建。',
        '协助导入 GPU Server 集群，并协助建立大语言模型部署标准操作流程。',
        '主导生成式 AI Agent 网页应用的全栈开发，采用 React.js、FastAPI 与 LangGraph 多代理协作。',
        '规划并运维容器化 GPU 集群，以 <strong>NVIDIA GPU Operator 与 HAMi</strong> 优化计算密度与 vGPU 分配。',
        '开发自定义 QR Code 应用，并以 RabbitMQ 构建高吞吐异步消息队列。',
      ],
      stack:
        'React.js、FastAPI、LangGraph、SQL Server、PostgreSQL、RabbitMQ、IIS、HAMi、GPU Operator、Longhorn、Cloudflare Tunnel、llama.cpp',
    },
    {
      tag: 'NODE // ACADEMIC ADVISORY',
      period: '2025 年 9 月 – 2026 年 6 月',
      company: '国立嘉义大学 AIGC 研究社',
      location: '嘉义市',
      role: '社团指导老师 / 专业技术顾问（Faculty Advisor）',
      bullets: [
        '在社团草创期受邀担任指导老师与专业讲师，协助定义 AIGC 技术研究方向与学术伦理规范。',
        '于学期中亲自授课，将生成式 AI 的最新趋势与实作经验传授给社员，提升整体技术水平。',
        '指导社务运作与组织发展，协助社团通过校方审核并稳定运作。',
      ],
    },
    {
      tag: 'NODE // NATIONAL CYBER SECURITY',
      period: '2025 年 3 月 – 2025 年 11 月（9 个月）',
      company: '国家资通安全研究院（NICS）',
      location: '台北市中正区',
      role: '软件工程师',
      bullets: [
        '推动云安全计划，直接参与国家基础设施的 <strong>AWS 政府配置基线（GCB）</strong>制定。',
        '研究并实现以 LangGraph 与多代理 LLM 为核心的前沿 AI 功能与自主工作流。',
        '以 Next.js、FastAPI 与 MongoDB 构建安全的无服务器与容器化 API。',
      ],
      stack:
        'Python、Next.js、LangGraph、FastAPI、CloudFormation、MongoDB、AWS 安全基线',
    },
    {
      tag: 'NODE // CLOUD ARCHITECTURE',
      period: '2024 年 6 月 – 2025 年 3 月（10 个月）',
      company: '云服务代理商',
      location: '台北市南港区',
      role: '项目工程师 / 软件工程师',
      bullets: [
        '规划并实现企业级 GCP 与 AWS 云环境，执行复杂的跨云迁移并配置安全的站点到站点 VPN。',
        '设计集中式监控平台，部署具备精细 RBAC 策略的生产 Kubernetes 集群。',
        '负责网络拓扑规划与安全边界：WAF、防火墙、负载均衡器与 VPC 对等连接。',
        '以 Terraform 编写自动化 IaC，并处理关键基础设施事故。',
      ],
      stack: 'Kubernetes、GCP、AWS、Terraform、Ansible、WAF、云架构',
    },
    {
      tag: 'NODE // RESEARCH & THESIS',
      period: '2021 年 9 月 – 2023 年 10 月（2 年 2 个月）',
      company: '国立嘉义大学信息工程学系 信息安全实验室',
      location: '嘉义市',
      role: '硕士研究员 / 项目助理',
      bullets: [
        '从事深度学习与网络安全入侵检测研究，聚焦 Web 应用安全。',
        '设计结合多模型 CNN、双向 GRU 与多头自注意力的混合架构，用于 SQLi 与 XSS 攻击检测。',
        '硕士论文研究发表于 IEEE Xplore（文献编号 10210155）。',
        '以 Python、Django、Flask、PyTorch 与 TensorFlow 开发机器学习管道与研究展示平台。',
      ],
      stack: 'Python、PyTorch、TensorFlow、Django、Flask、深度学习、IEEE 论文',
    },
    {
      tag: 'NODE // EARLY CAREER',
      period: '2019 年 12 月 – 2020 年 3 月（4 个月）',
      company: 'Ticrown Asset Management Ltd.',
      location: '高雄市大寮区',
      role: 'PHP 助理工程师 / 网页设计',
      bullets: [
        '参与集装箱运输企业的 PHP Laravel 物流管理系统开发与界面实现。',
        '设计数据库结构与响应式网页，随后转攻信息工程研究所。',
      ],
      stack: 'PHP、Laravel、MySQL、JavaScript、CSS',
    },
  ],
  dispatch: {
    tag: 'TERMINAL // GLOBAL TELEMETRY & DISPATCH NODE',
    telemetry: 'LOC: 25.0330° N, 121.5654° E · UTC+8 · [DRAG & ZOOM ENABLED]',
    locationTitle: '主要节点 // 台北，台湾',
    locationText:
      '常驻<strong>台北，台湾（UTC+8）</strong>。可配合台北的到岗与混合办公职位，并支持全球分布式团队的远程协作。',
    term: [
      { k: '> 应聘者：', v: 'Alex.Hsiao（Wei-Chun Hsiao）' },
      { k: '> 地点：', v: '台北，台湾（UTC+8 · CST）' },
      { k: '> 工作模式：', v: '台北混合 / 到岗，以及全球远程' },
      { k: '> 状态：', v: 'ONLINE // 开放资深职位' },
      { k: '> 电子邮件：', v: 'q123717111@gmail.com' },
      { k: '> 电话：', v: '+886 0970-565-709' },
    ],
    mail: '直接发送电子邮件',
    copyEmail: '复制电子邮件',
    copyPhone: '复制电话',
    src: 'GEOJSON 1:110M · ECHARTS MONO TELEMETRY · TAIPEI UTC+8 NODE',
    mapTooltip: '主要节点 // 台北，台湾',
    mapSub: '25.0330° N, 121.5654° E · UTC+8（CST）',
    mapLabel: '台北，台湾 [UTC+8]',
  },
};

export const cv: Record<Lang, CVData> = {
  en,
  'zh-hant': zhHant,
  'zh-hans': zhHans,
};

export function getCV(lang: Lang): CVData {
  return cv[lang];
}
