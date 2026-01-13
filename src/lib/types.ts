// Interface para representar os dados de uma resposta da pesquisa
export interface SurveyResponse {
    id: string;
    nome: string;
    telefone: string;
    comoNosConheceu: string;
    blogueiraNome?: string;
    avaliacaoGeral: number;
    atendimento: 'Excelente' | 'Bom' | 'Regular' | 'Ruim' | '';
    agilidade: 'Muito rápido' | 'Dentro do esperado' | 'Demorado' | '';
    burger: 'Perfeito 🔥' | 'Bom 👍' | 'Poderia melhorar 🤔' | '';
    sugestao: string;
    melhoriaBurger?: string;
    createdAt: any; // Pode ser um Timestamp do Firebase
    premioGanho?: string;
    uid: string;
}

// Interface para os dados de reivindicação de prêmio
export interface PrizeClaim {
    id: string;
    claimedAt: any; // Pode ser um Timestamp do Firebase
    uid: string;
    prize?: string;
}
