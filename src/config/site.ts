import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  DoorOpen,
  Sparkles,
  Wrench,
  Trees,
  Footprints,
  KeyRound,
  Building2,
} from "lucide-react";

export const siteConfig = {
  name: "Santo Serviços Terceirizados",
  shortName: "Santo",
  description:
    "Segurança patrimonial e facilities para condomínios, indústrias e empresas em Limeira e região.",
  city: "Limeira",
  state: "SP",
  phone: "(19) 3441-2200",
  whatsapp: "5519994412200",
  email: "contato@santoservicos.com.br",
  address: "Av. Sete de Setembro, 1450 — Centro, Limeira/SP — CEP 13480-000",
  url: "https://www.santoservicos.com.br",
};

export interface ServicoInfo {
  slug: string;
  categoria:
    | "portaria"
    | "controle_acesso"
    | "limpeza"
    | "zeladoria"
    | "jardinagem"
    | "ronda_interna"
    | "seguranca_patrimonial"
    | "facilities";
  nome: string;
  resumo: string;
  descricao: string;
  icon: LucideIcon;
}

export const servicos: ServicoInfo[] = [
  {
    slug: "portaria",
    categoria: "portaria",
    nome: "Portaria",
    resumo: "Recepção, triagem e controle de fluxo com equipe treinada e uniformizada.",
    descricao:
      "Profissionais dedicados à recepção de visitantes, prestadores e moradores, com protocolos de identificação, registro de entrada/saída e atendimento cordial que representa a imagem do seu negócio.",
    icon: DoorOpen,
  },
  {
    slug: "controle-de-acesso",
    categoria: "controle_acesso",
    nome: "Controle de Acesso",
    resumo: "Gestão de catracas, biometria e credenciais para áreas restritas.",
    descricao:
      "Operação de sistemas eletrônicos de acesso integrada a procedimentos manuais de contingência, garantindo que apenas pessoas autorizadas circulem em áreas sensíveis.",
    icon: KeyRound,
  },
  {
    slug: "limpeza",
    categoria: "limpeza",
    nome: "Limpeza",
    resumo: "Limpeza técnica e conservação predial com insumos próprios.",
    descricao:
      "Equipes dimensionadas conforme a metragem e o fluxo do local, com plano de trabalho, checklist de qualidade e materiais adequados a cada tipo de superfície.",
    icon: Sparkles,
  },
  {
    slug: "zeladoria",
    categoria: "zeladoria",
    nome: "Zeladoria",
    resumo: "Manutenção preventiva e cuidado contínuo com as instalações.",
    descricao:
      "Zeladores capacitados para pequenos reparos, rondas de manutenção e acompanhamento de fornecedores, mantendo o patrimônio sempre em ordem.",
    icon: Wrench,
  },
  {
    slug: "jardinagem",
    categoria: "jardinagem",
    nome: "Jardinagem",
    resumo: "Paisagismo e manutenção de áreas verdes.",
    descricao:
      "Poda, irrigação, adubação e manutenção periódica de jardins e áreas comuns, preservando a estética e a valorização do imóvel.",
    icon: Trees,
  },
  {
    slug: "ronda-interna",
    categoria: "ronda_interna",
    nome: "Ronda Interna",
    resumo: "Rondas programadas com checkpoints e registro digital.",
    descricao:
      "Percursos de vigilância interna com pontos de checagem por app, garantindo cobertura total das áreas críticas e rastreabilidade em tempo real para o cliente.",
    icon: Footprints,
  },
  {
    slug: "seguranca-patrimonial",
    categoria: "seguranca_patrimonial",
    nome: "Segurança Patrimonial",
    resumo: "Vigilância especializada para proteção de pessoas e bens.",
    descricao:
      "Vigilantes treinados conforme normas do DPF, com planos de segurança personalizados, integração a CFTV e protocolos de resposta a ocorrências.",
    icon: ShieldCheck,
  },
  {
    slug: "facilities",
    categoria: "facilities",
    nome: "Facilities",
    resumo: "Gestão integrada de serviços prediais sob um único contrato.",
    descricao:
      "Coordenação centralizada de portaria, limpeza, manutenção e demais serviços, com um único ponto de contato e relatórios consolidados de performance.",
    icon: Building2,
  },
];
