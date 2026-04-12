import React from "react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 font-syne">Política de Privacidade</h1>
      <div className="prose prose-slate lg:prose-xl">
        <p className="mb-4 text-slate-600">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">1. Informações que Coletamos</h2>
          <p className="text-slate-600 leading-relaxed">
            Coletamos informações necessárias para fornecer nossos serviços de automação de RH, incluindo nome, 
            e-mail e dados relacionados aos processos que você escolhe automatizar.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">2. Como Usamos seus Dados</h2>
          <p className="text-slate-600 leading-relaxed">
            Seus dados são usados exclusivamente para a prestação dos serviços contratados, melhoria da inteligência 
            dos nossos agentes e comunicação sobre atualizações da plataforma.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">3. Segurança dos Dados</h2>
          <p className="text-slate-600 leading-relaxed">
            Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não 
            autorizado, perda ou alteração.
          </p>
        </section>
      </div>
    </div>
  );
}
