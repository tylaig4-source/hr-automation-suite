import React from "react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 font-syne">Termos de Uso</h1>
      <div className="prose prose-slate lg:prose-xl">
        <p className="mb-4 text-slate-600">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">1. Aceitação dos Termos</h2>
          <p className="text-slate-600 leading-relaxed">
            Ao acessar e usar o HR Automation Suite, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
            Se você não concordar com qualquer parte destes termos, você não deve usar nossos serviços.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">2. Uso do Serviço</h2>
          <p className="text-slate-600 leading-relaxed">
            Nossa plataforma utiliza inteligência artificial para automatizar processos de RH. Você é responsável por manter a 
            confidencialidade de sua conta e senha e por todas as atividades que ocorrem sob sua conta.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">3. Limitação de Responsabilidade</h2>
          <p className="text-slate-600 leading-relaxed">
            O HR Automation Suite não será responsável por quaisquer danos diretos, indiretos, incidentais ou consequentes 
            resultantes do uso ou da incapacidade de usar o serviço.
          </p>
        </section>
      </div>
    </div>
  );
}
