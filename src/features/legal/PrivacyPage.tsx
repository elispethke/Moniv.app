import { LegalPage } from './LegalPage'

const sections = [
  {
    title: '1. Quem somos',
    content: (
      <>
        <p>
          O <strong className="text-foreground">Moniv</strong> é uma aplicação de gestão financeira
          pessoal desenvolvida e operada pela equipa Moniv. O nosso objetivo é ajudar os
          utilizadores a controlar receitas, despesas, metas e orçamentos de forma simples e segura.
        </p>
        <p>
          Para questões relacionadas com privacidade, pode contactar-nos através do email:{' '}
          <a
            href="mailto:privacy@moniv.app"
            className="text-primary hover:underline"
          >
            privacy@moniv.app
          </a>
        </p>
      </>
    ),
  },
  {
    title: '2. Dados que recolhemos',
    content: (
      <>
        <p>Recolhemos apenas os dados necessários para o funcionamento da aplicação:</p>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>
            <strong className="text-foreground">Dados de conta:</strong> endereço de email e
            password (cifrada com bcrypt — nunca armazenamos passwords em texto simples).
          </li>
          <li>
            <strong className="text-foreground">Dados financeiros:</strong> transações, categorias,
            orçamentos, metas e carteiras que o utilizador introduz manualmente.
          </li>
          <li>
            <strong className="text-foreground">Dados de utilização:</strong> informação técnica
            como tipo de dispositivo, idioma e fuso horário, usada exclusivamente para melhorar a
            experiência.
          </li>
          <li>
            <strong className="text-foreground">Dados de pagamento:</strong> processados pelo
            Stripe. O Moniv nunca armazena números de cartão ou dados bancários completos.
          </li>
        </ul>
        <p>Não recolhemos dados de localização GPS, contactos, câmara ou microfone.</p>
      </>
    ),
  },
  {
    title: '3. Como usamos os seus dados',
    content: (
      <>
        <p>Os dados recolhidos são utilizados exclusivamente para:</p>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>Prestar o serviço de gestão financeira pessoal.</li>
          <li>Processar pagamentos e gerir subscrições Pro.</li>
          <li>Enviar notificações de conta (confirmação de email, redefinição de password).</li>
          <li>Resolver problemas técnicos e melhorar a aplicação.</li>
          <li>Cumprir obrigações legais aplicáveis.</li>
        </ul>
        <p>
          <strong className="text-foreground">Não vendemos, alugamos nem partilhamos</strong> os
          seus dados pessoais com terceiros para fins comerciais.
        </p>
      </>
    ),
  },
  {
    title: '4. Base legal para o tratamento (RGPD)',
    content: (
      <>
        <p>
          Para utilizadores na União Europeia e Espaço Económico Europeu, o tratamento dos seus
          dados baseia-se em:
        </p>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>
            <strong className="text-foreground">Execução do contrato</strong> — necessário para
            prestar o serviço contratado.
          </li>
          <li>
            <strong className="text-foreground">Interesses legítimos</strong> — segurança, prevenção
            de fraude e melhoria do serviço.
          </li>
          <li>
            <strong className="text-foreground">Obrigação legal</strong> — cumprimento de
            requisitos legais e regulatórios.
          </li>
          <li>
            <strong className="text-foreground">Consentimento</strong> — para comunicações de
            marketing (caso aplicável).
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Partilha com terceiros',
    content: (
      <>
        <p>Partilhamos dados apenas com os seguintes prestadores de serviços essenciais:</p>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>
            <strong className="text-foreground">Supabase (EUA / UE)</strong> — base de dados e
            autenticação. Dados cifrados em trânsito (TLS) e em repouso.
          </li>
          <li>
            <strong className="text-foreground">Stripe (EUA)</strong> — processamento de pagamentos.
            Certificação PCI DSS Level 1.
          </li>
        </ul>
        <p>
          Todos os subprocessadores estão contratualmente obrigados a proteger os seus dados e a
          utilizá-los apenas para os fins contratados.
        </p>
      </>
    ),
  },
  {
    title: '6. Retenção de dados',
    content: (
      <p>
        Os seus dados são mantidos enquanto a conta estiver activa. Ao eliminar a conta, todos os
        dados pessoais são permanentemente removidos dos nossos sistemas no prazo de{' '}
        <strong className="text-foreground">30 dias</strong>, exceto onde a lei exija retenção por
        período mais longo (ex.: registos financeiros para fins fiscais, máximo 7 anos em Portugal).
      </p>
    ),
  },
  {
    title: '7. Os seus direitos',
    content: (
      <>
        <p>Ao abrigo do RGPD e legislação aplicável, tem direito a:</p>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>
            <strong className="text-foreground">Acesso</strong> — obter uma cópia dos seus dados.
          </li>
          <li>
            <strong className="text-foreground">Rectificação</strong> — corrigir dados incorrectos.
          </li>
          <li>
            <strong className="text-foreground">Apagamento</strong> — solicitar a eliminação da
            conta e dados ("direito ao esquecimento").
          </li>
          <li>
            <strong className="text-foreground">Portabilidade</strong> — exportar os seus dados em
            formato estruturado (PDF, CSV).
          </li>
          <li>
            <strong className="text-foreground">Oposição</strong> — opor-se ao tratamento para
            determinadas finalidades.
          </li>
          <li>
            <strong className="text-foreground">Limitação</strong> — solicitar a limitação do
            tratamento em determinadas circunstâncias.
          </li>
        </ul>
        <p>
          Para exercer qualquer um destes direitos, contacte{' '}
          <a href="mailto:privacy@moniv.app" className="text-primary hover:underline">
            privacy@moniv.app
          </a>
          . Responderemos no prazo de <strong className="text-foreground">30 dias</strong>.
        </p>
      </>
    ),
  },
  {
    title: '8. Segurança',
    content: (
      <>
        <p>Implementamos medidas técnicas e organizacionais robustas para proteger os seus dados:</p>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>Comunicações cifradas com TLS 1.3.</li>
          <li>Dados em repouso cifrados (AES-256).</li>
          <li>Passwords com hash bcrypt — nunca armazenadas em texto simples.</li>
          <li>Autenticação de dois factores disponível.</li>
          <li>Auditoria de acessos e monitorização de segurança.</li>
          <li>Políticas de controlo de acesso mínimo.</li>
        </ul>
      </>
    ),
  },
  {
    title: '9. Cookies e armazenamento local',
    content: (
      <>
        <p>O Moniv utiliza armazenamento local (<em>localStorage</em>) para:</p>
        <ul className="ml-4 space-y-1.5 list-disc">
          <li>Manter a sessão de utilizador activa.</li>
          <li>Guardar preferências (idioma, moeda, tema).</li>
        </ul>
        <p>
          Não utilizamos cookies de rastreamento de terceiros nem publicidade comportamental.
        </p>
      </>
    ),
  },
  {
    title: '10. Transferências internacionais',
    content: (
      <p>
        Alguns dos nossos subprocessadores (Supabase, Stripe) processam dados nos EUA. Estas
        transferências são realizadas ao abrigo de mecanismos legais adequados, incluindo Cláusulas
        Contratuais Padrão (SCCs) aprovadas pela Comissão Europeia.
      </p>
    ),
  },
  {
    title: '11. Alterações a esta política',
    content: (
      <p>
        Podemos actualizar esta política periodicamente. Quando o fizermos, actualizaremos a data
        "última actualização" no topo desta página e, se as alterações forem significativas,
        notificaremos os utilizadores por email. O uso continuado da aplicação após a notificação
        constitui aceitação da nova política.
      </p>
    ),
  },
  {
    title: '12. Contacto e reclamações',
    content: (
      <>
        <p>
          Para questões de privacidade:{' '}
          <a href="mailto:privacy@moniv.app" className="text-primary hover:underline">
            privacy@moniv.app
          </a>
        </p>
        <p>
          Se não ficar satisfeito com a nossa resposta, tem o direito de apresentar reclamação à
          autoridade de supervisão competente (em Portugal:{' '}
          <strong className="text-foreground">CNPD — Comissão Nacional de Proteção de Dados</strong>
          , em{' '}
          <a
            href="https://www.cnpd.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            www.cnpd.pt
          </a>
          ).
        </p>
      </>
    ),
  },
]

export function PrivacyPage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      subtitle="Como recolhemos, usamos e protegemos os seus dados pessoais."
      lastUpdated="11 de Abril de 2026"
      sections={sections}
    />
  )
}
