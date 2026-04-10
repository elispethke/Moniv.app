import { LegalPage } from './LegalPage'

const sections = [
  {
    title: '1. Aceitação dos Termos',
    content: (
      <p>
        Ao criar uma conta ou usar o <strong className="text-foreground">Moniv</strong>, concorda
        com estes Termos de Uso. Se não concordar, não utilize a aplicação. Estes termos constituem
        um acordo vinculativo entre o utilizador e a equipa Moniv.
      </p>
    ),
  },
  {
    title: '2. Descrição do Serviço',
    content: (
      <>
        <p>
          O Moniv é uma aplicação de gestão financeira pessoal que permite registar transações,
          definir orçamentos, acompanhar metas e obter insights sobre os seus hábitos financeiros.
        </p>
        <p>O serviço está disponível em dois planos:</p>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>
            <strong className="text-foreground">Plano Gratuito</strong> — funcionalidades base sem
            limite de tempo.
          </li>
          <li>
            <strong className="text-foreground">Plano Pro</strong> — funcionalidades avançadas
            mediante subscrição mensal ou anual.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '3. Conta de Utilizador',
    content: (
      <>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>
            Deve ter pelo menos <strong className="text-foreground">16 anos</strong> para criar uma
            conta.
          </li>
          <li>
            É responsável por manter a confidencialidade das suas credenciais de acesso.
          </li>
          <li>
            Deve notificar-nos imediatamente em caso de acesso não autorizado à sua conta através de{' '}
            <a href="mailto:support@moniv.app" className="text-primary hover:underline">
              support@moniv.app
            </a>
            .
          </li>
          <li>
            Pode ter apenas uma conta gratuita por email. Contas múltiplas criadas para contornar
            limitações do plano gratuito podem ser suspensas.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '4. Plano Pro — Subscrição e Pagamentos',
    content: (
      <>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>
            O Plano Pro é cobrado mensalmente (€6/mês) ou anualmente (€55/ano) através do{' '}
            <strong className="text-foreground">Stripe</strong>.
          </li>
          <li>
            A subscrição renova-se automaticamente no final de cada período, salvo cancelamento
            prévio.
          </li>
          <li>
            Pode cancelar a qualquer momento nas definições da conta. O acesso Pro mantém-se até ao
            fim do período pago.
          </li>
          <li>
            Não são emitidos reembolsos por períodos parcialmente utilizados, salvo exigência legal
            aplicável.
          </li>
          <li>
            Em caso de falha de pagamento, o acesso Pro é suspenso e a conta passa para o plano
            gratuito automaticamente.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Uso Aceitável',
    content: (
      <>
        <p>Compromete-se a não usar o Moniv para:</p>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>Actividades ilegais, fraudulentas ou de lavagem de dinheiro.</li>
          <li>
            Tentar aceder a contas de outros utilizadores ou comprometer a segurança da plataforma.
          </li>
          <li>
            Carregar conteúdo malicioso (vírus, malware) ou realizar ataques de engenharia social.
          </li>
          <li>Utilizar a aplicação de forma que prejudique outros utilizadores ou a infraestrutura.</li>
          <li>
            Fazer engenharia reversa, descompilar ou tentar extrair o código-fonte da aplicação.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '6. Propriedade Intelectual',
    content: (
      <>
        <p>
          Todo o conteúdo, marca, design, código e funcionalidades do Moniv são propriedade
          exclusiva da equipa Moniv e estão protegidos por leis de propriedade intelectual.
        </p>
        <p>
          Os <strong className="text-foreground">seus dados financeiros</strong> (transações,
          orçamentos, metas) são sua propriedade. Concede-nos apenas uma licença limitada para
          processar esses dados com o único objetivo de prestar o serviço.
        </p>
      </>
    ),
  },
  {
    title: '7. Disponibilidade do Serviço',
    content: (
      <>
        <p>
          Esforçamo-nos para manter o Moniv disponível 24/7, mas não garantimos disponibilidade
          ininterrupta. O serviço pode ser temporariamente interrompido por:
        </p>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>Manutenção programada (notificada com antecedência sempre que possível).</li>
          <li>Falhas técnicas ou de infraestrutura de terceiros.</li>
          <li>Eventos de força maior.</li>
        </ul>
      </>
    ),
  },
  {
    title: '8. Limitação de Responsabilidade',
    content: (
      <>
        <p>
          O Moniv é uma ferramenta de organização financeira pessoal e{' '}
          <strong className="text-foreground">não presta aconselhamento financeiro, fiscal ou
          de investimento</strong>. As informações apresentadas baseiam-se nos dados introduzidos
          pelo utilizador.
        </p>
        <p>
          Na máxima extensão permitida por lei, a nossa responsabilidade total por quaisquer danos
          não excede o valor pago pelo utilizador nos 12 meses anteriores ao evento que deu origem
          à reclamação.
        </p>
        <p>
          Não somos responsáveis por decisões financeiras tomadas com base em dados da aplicação,
          erros de introdução de dados pelo utilizador, ou perdas resultantes de acesso não
          autorizado à conta.
        </p>
      </>
    ),
  },
  {
    title: '9. Eliminação de Conta',
    content: (
      <p>
        Pode eliminar a sua conta a qualquer momento nas definições. Após eliminação, todos os
        dados serão permanentemente apagados no prazo de 30 dias, conforme descrito na nossa{' '}
        <a href="/privacy" className="text-primary hover:underline">
          Política de Privacidade
        </a>
        .
      </p>
    ),
  },
  {
    title: '10. Suspensão e Encerramento',
    content: (
      <p>
        Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos,
        realizem actividades fraudulentas ou prejudiquem outros utilizadores. Em casos graves,
        podemos agir sem aviso prévio. Em casos menores, tentaremos notificar e dar oportunidade
        de correcção.
      </p>
    ),
  },
  {
    title: '11. Alterações aos Termos',
    content: (
      <p>
        Podemos actualizar estes termos periodicamente. Notificaremos os utilizadores por email
        sobre alterações significativas com pelo menos{' '}
        <strong className="text-foreground">14 dias de antecedência</strong>. O uso continuado
        após a data de entrada em vigor constitui aceitação dos novos termos.
      </p>
    ),
  },
  {
    title: '12. Lei Aplicável e Foro',
    content: (
      <p>
        Estes termos são regidos pela lei portuguesa. Qualquer litígio será submetido à jurisdição
        exclusiva dos tribunais competentes em Portugal, sem prejuízo dos direitos do consumidor
        previstos na legislação da UE.
      </p>
    ),
  },
  {
    title: '13. Contacto',
    content: (
      <>
        <p>
          Para questões sobre estes termos, contacte-nos em:{' '}
          <a href="mailto:support@moniv.app" className="text-primary hover:underline">
            support@moniv.app
          </a>
        </p>
        <p>
          Também pode visitar a nossa{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Política de Privacidade
          </a>{' '}
          para informações sobre o tratamento dos seus dados pessoais.
        </p>
      </>
    ),
  },
]

export function TermsPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      subtitle="As regras e condições para usar o Moniv."
      lastUpdated="11 de Abril de 2026"
      sections={sections}
    />
  )
}
