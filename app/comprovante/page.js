'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Comprovante() {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toLocaleString('pt-BR'));
  }, []);

  return (
    <div className="bg-light min-h-screen">
      <main className="container py-12">
        <div className="card success-card max-w-xl mx-auto p-10 text-center shadow-2xl">
          <div className="success-icon mx-auto mb-8 animate-bounce">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--secondary-color)' }}>Pagamento Confirmado!</h1>
          <p className="mb-8 text-muted">Parabéns! Sua solicitação de regularização foi processada com sucesso. O seu nome será limpo nos sistemas do SPC/Serasa em até 5 dias úteis.</p>
          
          <div className="bg-gray-50 p-6 rounded-xl text-left mb-8 border border-dashed">
            <div className="mb-4 pb-4 border-b border-gray-100">
              <p className="small text-muted mb-1">Data do Pagamento:</p>
              <p className="font-bold">{date}</p>
            </div>
            <div className="mb-4 pb-4 border-b border-gray-100">
              <p className="small text-muted mb-1">Protocolo:</p>
              <p className="font-bold">#SR-{Math.floor(Math.random() * 9000 + 1000)}-{Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>
            <div>
              <p className="small text-muted mb-1">Status:</p>
              <p className="font-bold text-success" style={{color: '#25d366'}}>CONCLUÍDO</p>
            </div>
          </div>

          <Link href="/" className="btn-primary block py-4 no-underline shadow-lg">
            VOLTAR PARA A PÁGINA INICIAL
          </Link>
          
          <div className="mt-8 pt-6 border-t flex flex-col gap-2 opacity-60 small">
            <p>Um comprovante detalhado foi enviado para o seu e-mail.</p>
            <p>Dúvidas? Entre em contato com o suporte oficial.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
