type TableDefinition = {
	Row: Record<string, any>;
	Insert: Record<string, any>;
	Update: Record<string, any>;
	Relationships: [];
};

type PublicTables = {
	profiles: TableDefinition;
	user_roles: TableDefinition;
	clientes: TableDefinition;
	cliente_usuarios: TableDefinition;
	contratos: TableDefinition;
	postos_servico: TableDefinition;
	funcionarios: TableDefinition;
	alocacoes: TableDefinition;
	holerites: TableDefinition;
	assinaturas_digitais: TableDefinition;
	registros_ponto: TableDefinition;
	folhas_ponto: TableDefinition;
	escalas: TableDefinition;
	avisos: TableDefinition;
	avisos_leituras: TableDefinition;
	beneficios: TableDefinition;
	funcionario_beneficios: TableDefinition;
	solicitacoes_ferias: TableDefinition;
	solicitacoes_atualizacao_cadastral: TableDefinition;
	chamados: TableDefinition;
	chamados_mensagens: TableDefinition;
	contatos_site: TableDefinition;
	audit_log: TableDefinition;
};

export type Database = {
	public: {
		Tables: PublicTables;
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, string>;
		CompositeTypes: Record<string, never>;
	};
};
