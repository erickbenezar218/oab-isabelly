import LegalLayout from '../components/LegalLayout'

export default function Termos() {
  return (
    <LegalLayout title="Termos de Uso">
      <p className="text-xs text-muted-light">Última atualização: 15 de setembro de 2026</p>

      <section>
        <h2>1. Quem somos</h2>
        <p>
          O <strong>SimulaOrdem</strong> é operado por <strong>R E BENEZAR DE SOUZA LTDA</strong>, CNPJ{' '}
          <strong>37.409.487/0001-70</strong>, plataforma digital de simulados e estudos para o Exame da OAB (1ª e 2ª fase).
        </p>
        <p>
          Contato: <a href="mailto:suporte@simulaordem.com.br">suporte@simulaordem.com.br</a>
        </p>
      </section>

      <section>
        <h2>2. Aceitação</h2>
        <p>
          Ao criar conta ou usar o SimulaOrdem, você declara ter lido e aceitado estes Termos. Se não concordar, não utilize
          a plataforma.
        </p>
      </section>

      <section>
        <h2>3. Serviço</h2>
        <p>O SimulaOrdem oferece, conforme o plano contratado:</p>
        <ul>
          <li>Simulados no formato da prova objetiva (80 questões, cronômetro);</li>
          <li>Flashcards e active recall;</li>
          <li>Treino de peças processuais da 2ª fase (identificação da peça pelo caso);</li>
          <li>Cronograma de meta diária e estatísticas de desempenho (planos pagos);</li>
          <li>Tutor IA para revisão de erros (plano Pro);</li>
          <li>Armazenamento do progresso na nuvem vinculado à sua conta.</li>
        </ul>
        <p>
          O SimulaOrdem é ferramenta de estudo complementar. Não garantimos aprovação no Exame da OAB. Resultados dependem
          do esforço e preparo de cada usuário.
        </p>
      </section>

      <section>
        <h2>4. Planos e pagamento</h2>
        <ul>
          <li>
            <strong>Grátis:</strong> flashcards ilimitados e 1 (um) simulado por mês civil, com histórico limitado ao último
            simulado.
          </li>
          <li>
            <strong>Pro:</strong> R$ 24,90/mês — simulados ilimitados, histórico completo e revisão de erros.
          </li>
          <li>
            <strong>Reta Final:</strong> R$ 59,90 por 3 meses — mesmos benefícios do Pro no período contratado.
          </li>
        </ul>
        <p>
          Pagamentos processados pelo <strong>Asaas</strong> (cartão, PIX ou boleto). A cobrança aparecerá em nome do
          processador ou da razão social configurada. Assinaturas renovam automaticamente até cancelamento.
        </p>
      </section>

      <section>
        <h2>5. Conta do usuário</h2>
        <p>
          Você é responsável pela confidencialidade da senha e por todas as atividades na sua conta. Informe-nos
          imediatamente em caso de uso não autorizado.
        </p>
      </section>

      <section>
        <h2>6. Uso permitido</h2>
        <p>É proibido:</p>
        <ul>
          <li>Copiar, redistribuir ou revender o banco de questões ou conteúdo da plataforma;</li>
          <li>Usar bots, scrapers ou automação não autorizada;</li>
          <li>Compartilhar uma conta paga com terceiros;</li>
          <li>Tentar acessar áreas ou dados de outros usuários.</li>
        </ul>
      </section>

      <section>
        <h2>7. Propriedade intelectual</h2>
        <p>
          A marca SimulaOrdem, interface, código e organização do conteúdo são de propriedade da operadora. Questões de
          exames anteriores podem estar sujeitas a direitos de terceiros; o uso é exclusivamente para estudo pessoal na
          plataforma.
        </p>
      </section>

      <section>
        <h2>8. Cancelamento e reembolso</h2>
        <p>
          Você pode cancelar a assinatura a qualquer momento; o acesso Pro permanece até o fim do período pago. Reembolsos
          seguem o Código de Defesa do Consumidor e política informada no momento da compra (7 dias para contratos
          celebrados online, quando aplicável).
        </p>
      </section>

      <section>
        <h2>9. Limitação de responsabilidade</h2>
        <p>
          O serviço é fornecido &quot;como está&quot;. Não nos responsabilizamos por indisponibilidade temporária, falhas de
          internet ou decisões tomadas com base exclusivamente nos simulados. Nossa responsabilidade limita-se ao valor pago
          nos últimos 12 meses, quando aplicável.
        </p>
      </section>

      <section>
        <h2>10. Alterações</h2>
        <p>
          Podemos atualizar estes Termos. Mudanças relevantes serão comunicadas por e-mail ou aviso no app. O uso continuado
          após a vigência implica aceitação.
        </p>
      </section>

      <section>
        <h2>11. Foro</h2>
        <p>
          Fica eleito o foro da comarca do domicílio do consumidor, conforme legislação brasileira, para dirimir controvérsias.
        </p>
      </section>
    </LegalLayout>
  )
}
