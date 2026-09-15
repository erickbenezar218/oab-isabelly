import LegalLayout from '../components/LegalLayout'

export default function Privacidade() {
  return (
    <LegalLayout title="Política de Privacidade (LGPD)">
      <p className="text-xs text-purple-400/60">Última atualização: 15 de setembro de 2026</p>

      <section>
        <h2>1. Controlador dos dados</h2>
        <p>
          <strong>R E BENEZAR DE SOUZA LTDA</strong> — CNPJ <strong>37.409.487/0001-70</strong>, operadora da plataforma{' '}
          <strong>SimulaOrdem</strong>.
        </p>
        <p>
          Encarregado/DPO: <a href="mailto:privacidade@simulaordem.com.br">privacidade@simulaordem.com.br</a>
        </p>
      </section>

      <section>
        <h2>2. Dados que coletamos</h2>
        <ul>
          <li>
            <strong>Cadastro:</strong> nome, e-mail, senha (armazenada com hash criptográfico);
          </li>
          <li>
            <strong>Login Google (opcional):</strong> identificador Google, e-mail e nome;
          </li>
          <li>
            <strong>Uso do app:</strong> respostas, simulados, flashcards, estatísticas, cards salvos;
          </li>
          <li>
            <strong>Pagamento:</strong> dados processados pelo Asaas (não armazenamos número completo de cartão);
          </li>
          <li>
            <strong>Técnicos:</strong> IP, navegador, logs de acesso para segurança.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Finalidades</h2>
        <ul>
          <li>Prestar o serviço de simulados e estudos;</li>
          <li>Autenticar e manter sua conta;</li>
          <li>Processar pagamentos e planos;</li>
          <li>Enviar e-mails transacionais (boas-vindas, confirmação, recuperação de senha);</li>
          <li>Melhorar a plataforma e cumprir obrigações legais.</li>
        </ul>
      </section>

      <section>
        <h2>4. Base legal (LGPD)</h2>
        <ul>
          <li>Execução de contrato (Art. 7º, V) — prestação do serviço;</li>
          <li>Consentimento (Art. 7º, I) — login Google e marketing, quando houver;</li>
          <li>Legítimo interesse (Art. 7º, IX) — segurança e melhoria do produto;</li>
          <li>Obrigação legal (Art. 7º, II) — fiscal e consumerista.</li>
        </ul>
      </section>

      <section>
        <h2>5. Compartilhamento</h2>
        <p>Podemos compartilhar dados com:</p>
        <ul>
          <li>
            <strong>Asaas</strong> — processamento de pagamentos;
          </li>
          <li>
            <strong>Provedores de e-mail</strong> (ex.: Zoho, Resend) — comunicações;
          </li>
          <li>
            <strong>Hospedagem</strong> (servidor/Coolify) — infraestrutura;
          </li>
          <li>Autoridades, quando exigido por lei.</li>
        </ul>
        <p>Não vendemos seus dados pessoais.</p>
      </section>

      <section>
        <h2>6. Retenção</h2>
        <p>
          Mantemos os dados enquanto a conta estiver ativa ou conforme necessário para obrigações legais. Após exclusão da
          conta, dados são eliminados ou anonimizados em até 90 dias, salvo retenção legal.
        </p>
      </section>

      <section>
        <h2>7. Seus direitos</h2>
        <p>Você pode, a qualquer momento:</p>
        <ul>
          <li>Confirmar existência de tratamento e acessar seus dados;</li>
          <li>Corrigir dados incompletos ou desatualizados;</li>
          <li>Solicitar anonimização, bloqueio ou eliminação;</li>
          <li>Revogar consentimento;</li>
          <li>Solicitar portabilidade.</li>
        </ul>
        <p>
          Envie pedidos para <a href="mailto:privacidade@simulaordem.com.br">privacidade@simulaordem.com.br</a>. Resposta em
          até 15 dias.
        </p>
      </section>

      <section>
        <h2>8. Segurança</h2>
        <p>
          Adotamos medidas técnicas como HTTPS, senhas com hash, tokens de sessão e backups. Nenhum sistema é 100% seguro;
          notifique-nos sobre incidentes.
        </p>
      </section>

      <section>
        <h2>9. Cookies e armazenamento local</h2>
        <p>
          Usamos token de autenticação no navegador (localStorage) para manter sua sessão. Cookies analíticos, se utilizados
          no futuro, serão informados nesta política.
        </p>
      </section>

      <section>
        <h2>10. Menores</h2>
        <p>O serviço destina-se a maiores de 18 anos ou emancipados. Não coletamos intencionalmente dados de menores.</p>
      </section>

      <section>
        <h2>11. Alterações</h2>
        <p>Esta política pode ser atualizada. A versão vigente estará sempre nesta página com a data de revisão.</p>
      </section>
    </LegalLayout>
  )
}
