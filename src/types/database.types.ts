/**
 * Este arquivo é gerado automaticamente por:
 *   npm run supabase:gen-types
 *
 * Rode esse comando após aplicar as migrations em supabase/migrations/
 * para obter os tipos reais de todas as tabelas, views, enums e funções.
 * O placeholder abaixo evita erros de import antes da primeira geração.
 */
export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: "master" | "administrador" | "rh" | "supervisor" | "cliente" | "funcionario";
      contrato_status: "ativo" | "suspenso" | "encerrado" | "em_negociacao";
      funcionario_status: "ativo" | "ferias" | "afastado" | "desligado";
      servico_categoria:
        | "portaria"
        | "controle_acesso"
        | "limpeza"
        | "zeladoria"
        | "jardinagem"
        | "ronda_interna"
        | "seguranca_patrimonial"
        | "facilities";
    };
  };
};
