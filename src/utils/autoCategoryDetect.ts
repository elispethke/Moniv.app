/**
 * Auto-detects a transaction category from the description text.
 * Rules are intentionally broad (Portuguese + English + common brand names).
 * Returns null when no confident match is found.
 */
import type { TransactionCategory, TransactionType } from '@/types/transaction'

// Each rule: array of lowercase keywords/fragments that map to a category
const EXPENSE_RULES: Array<{ category: TransactionCategory; keywords: string[] }> = [
  {
    category: 'food',
    keywords: [
      // Fast food chains
      'mcdonald', 'mc donald', 'burger king', 'kfc', 'subway', 'nando',
      // Delivery
      'uber eats', 'ubereats', 'glovo', 'ifood', 'takeaway', 'deliveroo',
      // Supermarkets
      'lidl', 'aldi', 'continente', 'pingo doce', 'jumbo', 'mercadona',
      'intermarché', 'intermache', 'minipreço', 'minipreco',
      // Restaurants / cafés
      'restaurante', 'restaurant', 'café', 'cafe', 'padaria', 'bakery',
      'pastelaria', 'sushi', 'pizza', 'hamburguer', 'burger', 'taco',
      // Meals
      'almoço', 'almoco', 'jantar', 'pequeno-almoço', 'refeição', 'refeicao',
      // Generic food
      'supermercado', 'mercearia', 'frutas', 'verduras', 'leite', 'pão',
      'comida', 'snack', 'bar ',
    ],
  },
  {
    category: 'transport',
    keywords: [
      // Rideshare / taxi
      'uber', 'bolt', 'taxi', 'táxi', 'cabify',
      // Public transport
      'metro', 'autocarro', 'comboio', 'cp ', 'carris', 'stcp', 'rede expressos',
      'transportes', 'bilhete', 'passe ', 'via verde', 'viaverde',
      // Fuel
      'gasolina', 'diesel', 'combustível', 'combustivel', 'bp ', 'galp', 'repsol',
      'shell', 'cepsa', 'posto de gasolina',
      // Parking / tolls
      'parking', 'parque ', 'portagem', 'estacionamento',
      // Airlines / travel
      'ryanair', 'tap ', 'easyjet', 'wizz', 'vueling', 'flixbus', 'comboios',
      'avião', 'aviao', 'voo ',
      // Car / bike
      'seguro auto', 'inspecção', 'inspecao', 'revisão', 'revisao',
    ],
  },
  {
    category: 'housing',
    keywords: [
      'renda ', 'aluguel', 'aluguer', 'arrendamento', 'condomínio', 'condominio',
      'hipoteca', 'prestação casa', 'prestacao casa',
      // Utilities
      'eletricidade', 'electricidade', 'edp ', 'endesa', 'iberdrola',
      'água ', 'agua ', 'saneamento',
      'gás ', 'gas ', 'naturgy', 'galp gas',
      'internet ', 'fibra ', 'meo ', 'nos ', 'vodafone', 'nowo', 'digi',
    ],
  },
  {
    category: 'health',
    keywords: [
      'farmácia', 'farmacia', 'pharmacy', 'medicamento', 'medicina',
      'médico', 'medico', 'consulta', 'dentista', 'dentist', 'ortodontia',
      'hospital', 'clínica', 'clinica', 'urgência', 'urgencia',
      'ginásio', 'ginasio', 'gym', 'fitness', 'personal trainer',
      'vitamina', 'suplemento', 'seguro saúde', 'seguro saude', 'multicare',
      'dr.', 'dra.', 'enfermagem',
    ],
  },
  {
    category: 'education',
    keywords: [
      'escola', 'colégio', 'colegio', 'universidade', 'faculdade',
      'propinas', 'mensalidade escola',
      'livro ', 'livros ', 'manual ', 'manuais ',
      'curso ', 'formação ', 'formacao ', 'workshop ',
      'udemy', 'coursera', 'linkedin learning', 'skillshare', 'domestika',
      'explicações', 'explicacoes', 'aulas ',
    ],
  },
  {
    category: 'entertainment',
    keywords: [
      // Streaming
      'netflix', 'spotify', 'hbo', 'disney', 'disney+', 'prime video', 'amazon prime',
      'apple tv', 'youtube premium', 'deezer', 'tidal', 'twitch',
      // Gaming
      'steam', 'playstation', 'xbox', 'nintendo', 'epic games', 'ea games',
      'psn', 'ps store', 'game pass',
      // Cinema / events
      'cinema', 'movie', 'bilhete', 'concerto', 'espetáculo', 'espetaculo',
      'teatro ', 'museu ', 'parque diversões',
      // Books / hobbies
      'kindle', 'audible', 'fnac livros',
    ],
  },
  {
    category: 'shopping',
    keywords: [
      // Clothing
      'zara', 'h&m', 'hm ', 'pull and bear', 'bershka', 'stradivarius',
      'primark', 'mango ', 'levis', 'nike', 'adidas', 'puma', 'new balance',
      'roupa', 'calçado', 'calcado', 'sapatos', 'vestuário', 'vestuario',
      // Electronics / general
      'fnac', 'worten', 'media markt', 'apple store', 'samsung',
      'amazon', 'aliexpress', 'shein', 'temu ', 'ebay',
      // Home
      'ikea', 'leroy merlin', 'leroymerlin', 'aki ', 'bricomarché',
    ],
  },
  {
    category: 'utilities',
    keywords: [
      'fatura ', 'factura ', 'invoice ',
      'seguro ', 'insurance ',
      'telemóvel', 'telemovel', 'telefone', 'operadora',
      'subscrição', 'subscricao', 'subscription',
      'imposto', 'irs ', 'iva ', 'taxa ', 'selo ',
      'banco ', 'comissão bancária', 'comissao bancaria',
      'anuidade cartão', 'anuidade cartao',
    ],
  },
]

const INCOME_RULES: Array<{ category: TransactionCategory; keywords: string[] }> = [
  {
    category: 'salary',
    keywords: [
      'salário', 'salario', 'ordenado', 'vencimento', 'remuneração', 'remuneracao',
      'pagamento empresa', 'transferência empresa', 'transferencia empresa',
      'wages', 'salary', 'payroll',
    ],
  },
  {
    category: 'freelance',
    keywords: [
      'freelance', 'projeto ', 'projecto ', 'consultoria', 'consulting',
      'serviço prestado', 'servico prestado', 'honorários', 'honorarios',
      'invoice ', 'fatura serviço', 'recibo verde',
    ],
  },
  {
    category: 'investment',
    keywords: [
      'dividendo', 'dividend', 'juros', 'interest', 'rendimento',
      'bolsa', 'acções', 'acoes', 'etf ', 'fundo ', 'crypto', 'bitcoin',
      'ethereum', 'trading', 'mais-valias', 'mais valias', 'capital gain',
    ],
  },
]

function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
}

export function detectCategory(
  description: string,
  type: TransactionType,
): TransactionCategory | null {
  if (!description.trim()) return null

  const normalised = ' ' + normalise(description) + ' '
  const rules = type === 'expense' ? EXPENSE_RULES : INCOME_RULES

  for (const rule of rules) {
    for (const kw of rule.keywords) {
      const normKw = normalise(kw)
      if (normalised.includes(normKw)) {
        return rule.category
      }
    }
  }

  return null
}
