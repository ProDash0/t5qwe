'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Comprovante() {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toLocaleString());
  }, []);

  return (
    <div className="bg-light min-h-screen">
      <main className="container py-12">
        <div className="card success-card max-w-xl mx-auto p-10 text-center">
          <div className="success-icon mx-auto mb-8">✓</div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--secondary-color)' }}>Pagamento Confirmado!</h1>
          <p className="mb-8">Parabéns! Seu pagamento foi processado com sucesso. Suas dívidas foram quitadas e seu nome será limpo em até 5 dias úteis.</p>
          
          <div className="bg-gray-50 p-6 rounded-xl text-left mb-8 border">
            <p className="small text-muted mb-1">Comprovante gerado em:</p>
            <p className="font-bold mb-4">{date}</p>
            <p className="small text-muted mb-1">Código da Transação:</p>
            <p className="font-bold">#SR-9921-X882</p>
          </div>

          <Link href="/" className="btn-primary block py-4 no-underline">
            VOLTAR PARA A HOME
          </Link>
          <p className="mt-6 small text-muted">Um comprovante detalhado foi enviado para o seu e-mail cadastrado.</p>
        </div>
      </main>
    </div>
  );
}
