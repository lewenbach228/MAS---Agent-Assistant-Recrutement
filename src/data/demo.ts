import type {
  AgentRunTrace,
  CandidateEvaluation,
  CandidateSubmission,
  JobDescriptionInput,
  PlaygroundProviderConfig,
  ResponseDraft,
} from "../types";

export const jobDescription: JobDescriptionInput = {
  title: "Product Engineer IA - Recrutement assisté",
  missions: [
    "Concevoir une expérience web claire pour un recruteur non technique.",
    "Orchestrer plusieurs agents LLM sur un flux de candidature email.",
    "Rendre les décisions explicables et auditables dans l'interface.",
  ],
  requiredSkills: [
    "React",
    "TypeScript",
    "LLM orchestration",
    "Prompt engineering",
    "UX dashboard",
  ],
  bonusSkills: ["Gemini", "OpenAI", "Email parsing", "Scoring heuristique"],
  seniority: "3+ ans",
  language: "Français + anglais professionnel",
  location: "Remote Europe",
  mustHave: [
    "A déjà construit une application web livrable",
    "Peut expliquer clairement ses choix techniques",
    "Sait transformer un flux métier en interface actionnable",
  ],
  niceToHave: [
    "Expérience sur des agents ou workflows LLM",
    "Sens produit et portfolio démonstratif",
  ],
};

export const jobDescriptionRaw = `Titre : Product Engineer IA - Recrutement assisté
Seniorité : 3+ ans
Langue : Français + anglais professionnel
Localisation : Remote Europe

Missions :
- Concevoir une expérience web claire pour un recruteur non technique.
- Orchestrer plusieurs agents LLM sur un flux de candidature email.
- Rendre les décisions explicables et auditables dans l'interface.

Compétences requises :
- React
- TypeScript
- LLM orchestration
- Prompt engineering
- UX dashboard

Compétences bonus :
- Gemini
- OpenAI
- Email parsing
- Scoring heuristique

Must-have :
- A déjà construit une application web livrable
- Peut expliquer clairement ses choix techniques
- Sait transformer un flux métier en interface actionnable

Nice-to-have :
- Expérience sur des agents ou workflows LLM
- Sens produit et portfolio démonstratif`;

export const candidates: CandidateSubmission[] = [
  {
    id: "cand-ada",
    candidateName: "Ada Mensah",
    emailSubject: "Candidature - Product Engineer IA",
    sender: "ada.mensah@example.com",
    receivedAt: "2026-05-03T08:20:00Z",
    source: "seed",
    emailBody:
      "Bonjour, je vous partage mon CV et un lien vers une application web de matching RH que j'ai construite. Je travaille en React/TS et j'ai intégré OpenAI et Gemini sur plusieurs workflows internes.",
    attachments: ["ada-mensah-cv.pdf", "portfolio-link.txt"],
    extractedText:
      "4 ans d'expérience. React, TypeScript, tableaux de bord, orchestration LLM, design produit, explications claires.",
  },
  {
    id: "cand-lucas",
    candidateName: "Lucas Bernard",
    emailSubject: "Développeur fullstack - candidature spontanée",
    sender: "lucas.bernard@example.com",
    receivedAt: "2026-05-03T09:10:00Z",
    source: "seed",
    emailBody:
      "Je postule pour votre rôle. Mon profil est davantage backend Node/Python. Je joins mon CV. Je n'ai pas encore travaillé sur des expériences RH ou des interfaces de supervision.",
    attachments: ["lucas-bernard-cv.pdf"],
    extractedText:
      "6 ans de backend. Node, Python, API. Peu d'UX de tableau de bord. Pas d'expérience LLM visible.",
  },
  {
    id: "cand-sarah",
    candidateName: "Sarah Klein",
    emailSubject: "Application - AI Product Engineer",
    sender: "sarah.klein@example.com",
    receivedAt: "2026-05-03T11:42:00Z",
    source: "seed",
    emailBody:
      "Bonjour, je suis intéressée par le poste. J'ai livré des interfaces IA orientées client et des outils pour recruteurs, mais mon e-mail est court et j'ai oublié d'ajouter mon portfolio. Je peux envoyer plus de détails.",
    attachments: ["sarah-klein-cv.pdf"],
    extractedText:
      "3 ans de product engineering. UX IA. Bon alignement sur le front-end et les flux IA. Portfolio manquant et quelques compétences peu explicites.",
  },
];

export const evaluations: CandidateEvaluation[] = [
  {
    candidateId: "cand-ada",
    overallScore: 92,
    skillScore: 95,
    experienceScore: 88,
    communicationScore: 93,
    decision: "acceptation shortlist",
    recommendation:
      "Passer en présélection et proposer un entretien de 30 minutes avec focus architecture + UX.",
    confidenceLabel: "haute",
    strengths: [
      "Correspondance directe sur React, TypeScript et orchestration LLM",
      "Preuve de livraison produit déjà mentionnée",
      "Signal fort sur la capacité à expliquer ses choix",
    ],
    gaps: ["Pas de détail sur le parsing d'e-mail complexe ou la sécurité"],
    rationale:
      "Le profil couvre les compétences cœur et montre une articulation claire entre produit, interface et agents LLM.",
    riskFlags: ["Vérifier la profondeur backend si la V2 devient plus technique"],
  },
  {
    candidateId: "cand-lucas",
    overallScore: 51,
    skillScore: 46,
    experienceScore: 71,
    communicationScore: 58,
    decision: "refus",
    recommendation:
      "Refuser poliment car le cœur du besoin front/UX/agentique n'est pas suffisamment couvert.",
    confidenceLabel: "moyenne",
    strengths: ["Base technique backend solide", "Expérience générale correcte"],
    gaps: [
      "Peu de signal sur l'UX de tableau de bord",
      "Pas de preuve d'orchestration LLM",
      "Mauvais alignement avec la dimension produit visible",
    ],
    rationale:
      "Le profil semble compétent mais trop décalé par rapport à la priorité produit et interface de la fiche de poste.",
    riskFlags: ["Possibilité de faux négatif si le portfolio complet n'a pas été fourni"],
  },
  {
    candidateId: "cand-sarah",
    overallScore: 78,
    skillScore: 82,
    experienceScore: 77,
    communicationScore: 73,
    decision: "demande de complement",
    recommendation:
      "Demander le portfolio, des cas concrets et des précisions sur son expérience LLM avant décision finale.",
    confidenceLabel: "à vérifier",
    strengths: [
      "Bon signal sur l'UX IA et les interfaces client",
      "Correspondance plausible avec l'orientation produit",
    ],
    gaps: [
      "Portfolio manquant",
      "Détails techniques insuffisants dans l'e-mail initial",
    ],
    rationale:
      "Le potentiel est bon mais la preuve envoyée est incomplète pour une présélection immédiate.",
    riskFlags: ["Décision sensible à l'absence de pièces de preuve jointes"],
  },
];

export const traces: AgentRunTrace[] = [
  {
    candidateId: "cand-ada",
    agentName: "Candidate Intake Agent",
    handoffTo: "Extraction Agent",
    status: "done",
    durationMs: 420,
    inputSummary: "E-mail + 2 pièces jointes",
    outputSummary: "Corps normalisé et contenu des pièces répertorié",
    artifactLabel: "Candidature normalisée",
  },
  {
    candidateId: "cand-ada",
    agentName: "Extraction Agent",
    handoffTo: "Match Agent",
    status: "done",
    durationMs: 830,
    inputSummary: "Texte de l'e-mail et CV",
    outputSummary: "Compétences, séniorité, preuves portfolio, signaux forts",
    artifactLabel: "Profil candidat",
  },
  {
    candidateId: "cand-ada",
    agentName: "Match Agent",
    handoffTo: "Decision Agent",
    status: "done",
    durationMs: 510,
    inputSummary: "Profil candidat + fiche de poste",
    outputSummary: "Correspondances must-have et bonus cartographiées",
    artifactLabel: "Matrice de correspondance",
  },
  {
    candidateId: "cand-ada",
    agentName: "Decision Agent",
    handoffTo: "Response Draft Agent",
    status: "done",
    durationMs: 380,
    inputSummary: "Matrice de correspondance",
    outputSummary: "Score 92, présélection, justification haute confiance",
    artifactLabel: "Décision candidat",
  },
  {
    candidateId: "cand-ada",
    agentName: "Response Draft Agent",
    handoffTo: "Review Gate Agent",
    status: "review",
    durationMs: 270,
    inputSummary: "Décision de présélection",
    outputSummary: "Brouillon d'invitation à relire avant envoi",
    artifactLabel: "Brouillon de réponse",
  },
  {
    candidateId: "cand-lucas",
    agentName: "Candidate Intake Agent",
    handoffTo: "Extraction Agent",
    status: "done",
    durationMs: 390,
    inputSummary: "E-mail + CV",
    outputSummary: "Contenu normalisé",
    artifactLabel: "Candidature normalisée",
  },
  {
    candidateId: "cand-lucas",
    agentName: "Extraction Agent",
    handoffTo: "Match Agent",
    status: "done",
    durationMs: 760,
    inputSummary: "Texte de l'e-mail et CV",
    outputSummary: "Profil backend dominant, peu de preuves UX",
    artifactLabel: "Profil candidat",
  },
  {
    candidateId: "cand-lucas",
    agentName: "Match Agent",
    handoffTo: "Decision Agent",
    status: "done",
    durationMs: 490,
    inputSummary: "Profil candidat + fiche de poste",
    outputSummary: "Plusieurs must-have manquants",
    artifactLabel: "Matrice de correspondance",
  },
  {
    candidateId: "cand-lucas",
    agentName: "Decision Agent",
    handoffTo: "Response Draft Agent",
    status: "done",
    durationMs: 350,
    inputSummary: "Matrice de correspondance",
    outputSummary: "Score 51, refus recommandé",
    artifactLabel: "Décision candidat",
  },
  {
    candidateId: "cand-lucas",
    agentName: "Response Draft Agent",
    handoffTo: "Review Gate Agent",
    status: "review",
    durationMs: 250,
    inputSummary: "Décision de refus",
    outputSummary: "Brouillon de refus poli",
    artifactLabel: "Brouillon de réponse",
  },
  {
    candidateId: "cand-sarah",
    agentName: "Candidate Intake Agent",
    handoffTo: "Extraction Agent",
    status: "done",
    durationMs: 400,
    inputSummary: "E-mail + CV",
    outputSummary: "E-mail normalisé et portfolio manquant détecté",
    artifactLabel: "Candidature normalisée",
  },
  {
    candidateId: "cand-sarah",
    agentName: "Extraction Agent",
    handoffTo: "Match Agent",
    status: "done",
    durationMs: 810,
    inputSummary: "Texte de l'e-mail et CV",
    outputSummary: "Profil UX IA crédible mais incomplet",
    artifactLabel: "Profil candidat",
  },
  {
    candidateId: "cand-sarah",
    agentName: "Match Agent",
    handoffTo: "Decision Agent",
    status: "done",
    durationMs: 520,
    inputSummary: "Profil candidat + fiche de poste",
    outputSummary: "Bonne correspondance partielle, preuves manquantes",
    artifactLabel: "Matrice de correspondance",
  },
  {
    candidateId: "cand-sarah",
    agentName: "Decision Agent",
    handoffTo: "Response Draft Agent",
    status: "done",
    durationMs: 370,
    inputSummary: "Matrice de correspondance",
    outputSummary: "Score 78, demande de complément",
    artifactLabel: "Décision candidat",
  },
  {
    candidateId: "cand-sarah",
    agentName: "Response Draft Agent",
    handoffTo: "Review Gate Agent",
    status: "review",
    durationMs: 260,
    inputSummary: "Décision de complément",
    outputSummary: "Brouillon demandant portfolio et cas concrets",
    artifactLabel: "Brouillon de réponse",
  },
];

export const drafts: ResponseDraft[] = [
  {
    candidateId: "cand-ada",
    status: "draft",
    subject: "Suite à votre candidature - entretien exploratoire",
    body:
      "Bonjour Ada,\n\nMerci pour votre candidature. Votre parcours semble bien aligné avec notre besoin sur l'orchestration d'agents et l'UX produit. Nous aimerions vous proposer un entretien de 30 minutes pour approfondir votre expérience récente.\n\nBien à vous,",
    variables: ["candidateName", "interviewSlot", "jobTitle"],
  },
  {
    candidateId: "cand-lucas",
    status: "draft",
    subject: "Suite a votre candidature",
    body:
      "Bonjour Lucas,\n\nMerci pour votre intérêt. Après revue de votre candidature, nous ne poursuivons pas sur ce rôle car le besoin actuel est très centré sur l'interface produit et l'orchestration LLM côté expérience utilisateur.\n\nNous vous souhaitons une bonne continuation.",
    variables: ["candidateName", "jobTitle"],
  },
  {
    candidateId: "cand-sarah",
    status: "draft",
    subject: "Demande d'informations complémentaires",
    body:
      "Bonjour Sarah,\n\nMerci pour votre candidature. Votre profil semble intéressant pour le rôle. Avant de décider de la suite, pourriez-vous nous envoyer votre portfolio ainsi qu'un ou deux exemples concrets de projets IA orientés produit ?\n\nMerci d'avance,",
    variables: ["candidateName", "jobTitle", "requestedArtifacts"],
  },
];

export const providerConfigs: PlaygroundProviderConfig[] = [
  {
    provider: "openai",
    model: "gpt-4.1-mini",
    apiKeyLabel: "OPENAI_API_KEY",
    usageNote: "Utilisable pour tester le scoring ou comparer le brouillon de réponse.",
  },
  {
    provider: "gemini",
    model: "gemini-2.5-flash",
    apiKeyLabel: "GEMINI_API_KEY",
    usageNote: "Utile pour un mode BYOK sans backend complexe côté démo.",
  },
];
