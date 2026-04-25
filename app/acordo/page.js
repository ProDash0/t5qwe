'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Acordo() {
  const [originalVal, setOriginalVal] = useState(5234.9);
  const [discountedVal, setDiscountedVal] = useState(557.77);
  const [timer, setTimer] = useState('09:57');
  const router = useRouter();

  useEffect(() => {
    const orig = parseFloat(localStorage.getItem('debt_original') || 5234.9);
    const disc = parseFloat(localStorage.getItem('debt_discounted') || 557.77);
    setOriginalVal(orig);
    setDiscountedVal(disc);

    let minutes = 9;
    let seconds = 57;
    const interval = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
          return;
        }
        minutes--;
        seconds = 59;
      } else {
        seconds--;
      }
      setTimer(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const savingsVal = originalVal - discountedVal;

  return (
    <div className="bg-light min-h-screen">
      <header className="main-header">
        <div className="container">
          <div className="header-flex">
            <div className="logo">
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M623.83 240.949h-118.542c-35.291 0-63.817-27.989-63.817-62.456v-116.072c0-34.467 28.526-62.421 63.817-62.421h118.542c35.183 0 63.745 27.953 63.745 62.421v116.072c0 34.467-28.562 62.456-63.745 62.456zM317.203 501.083h-133.324c-39.621 0-71.762-31.354-71.762-70.223v-130.568c0-38.798 32.141-70.295 71.762-70.295h133.324c39.621 0 71.762 31.497 71.762 70.295v130.568c0 38.87-32.141 70.223-71.762 70.223zM304.497 772.061h-81.462c-0.129 0.001-0.28 0.002-0.432 0.002-23.815 0-43.151-19.174-43.413-42.928v-79.697c0-23.801 19.685-43.022 43.845-43.022h81.462c24.195 0 43.881 19.22 43.881 43.022v79.672c0 23.766-19.685 42.95-43.881 42.95zM523.148 1023.999h-96.28c-28.633 0-51.826-22.62-51.826-50.717v-94.275c0-28.061 23.193-50.753 51.826-50.753h96.28c28.633 0 51.826 22.692 51.826 50.753v94.275c0 28.096-23.193 50.717-51.826 50.717zM876.018 288.408h-66.716c-0.096 0.001-0.21 0.001-0.324 0.001-19.479 0-35.297-15.669-35.538-35.090v-65.271c0.201-19.455 16.020-35.15 35.503-35.15 0.126 0 0.253 0.001 0.379 0.002h66.697c0.107-0.001 0.234-0.002 0.36-0.002 19.484 0 35.302 15.694 35.503 35.131v65.267c0 19.328-16.035 35.112-35.863 35.112zM653.287 554.305c-23.551-12.634-47.71-24.231-71.082-37.080-10.034-5.403-18.671-11.758-26.304-19.143l0.032 0.030c-17.967-17.86-15.033-44.060 5.941-55.62 6.196-3.272 13.419-5.585 21.066-6.52l0.302-0.030c21.761-2.863 41.626 2.792 60.667 13.386 9.485 5.333 20.258 9.27 30.96 11.489 11.167 2.291 21.010-2.756 27.918-11.883 3.262-4.013 5.237-9.185 5.237-14.82 0-4.958-1.53-9.559-4.143-13.357l0.051 0.079c-4.719-7.554-10.529-13.935-17.296-19.131l-0.17-0.125c-26.557-19.542-57.195-27.703-90.088-28.633-24.088 0.394-47.066 5.261-68.362 16.858-45.813 25.018-63.709 73.48-44.024 120.725 9.628 22.978 27.202 39.335 48.82 51.218 19.077 10.487 38.941 19.578 58.484 29.242 16.357 8.125 32.284 16.894 45.098 30.065 15.856 16.214 19.184 34.718 8.769 49.929-7.838 11.382-19.685 16.285-33 18.433-26.235 4.152-50.108-2.362-72.442-15.82-7.731-4.653-15.641-9.521-24.052-12.634-24.195-8.948-46.637 8.375-42.091 32.069 2.076 10.559 8.876 18.361 16.929 25.162 41.948 35.505 118.113 44.382 168.543 19.685 54.224-26.557 73.122-83.359 45.205-136.223-11.31-21.511-29.85-35.935-50.967-47.352zM771.006 750.515c-0.032 0.001-0.070 0.001-0.108 0.001-2.216 0-4.020-1.767-4.079-3.968v-41.882h-9.556c0 0 0 0-0.001 0-2.234 0-4.044-1.811-4.044-4.044 0-0.026 0-0.050 0.001-0.075v0.003c0-2.362 1.718-4.116 4.044-4.116h27.667c2.291 0 4.044 1.79 4.044 4.116 0 2.291-1.79 4.080-4.044 4.080h-9.7v41.876c0 2.291-1.79 4.009-4.223 4.009zM820.47 750.586c-2.255 0-3.579-1.646-4.116-3.221l-11.919-34.217v33.394c0 2.291-1.79 3.973-4.152 3.973-0.032 0.001-0.072 0.001-0.11 0.001-2.224 0-4.036-1.763-4.114-3.967v-44.209c0.135-3.401 2.888-6.116 6.293-6.192h0.007c2.684 0 5.19 1.897 6.085 4.546l12.062 34.611 11.954-34.611c0.87-2.617 3.269-4.482 6.113-4.546h0.008c3.411 0.076 6.164 2.791 6.299 6.18v44.215c0 2.291-1.79 3.973-4.223 3.973-0.021 0-0.047 0.001-0.073 0.001-2.216 0-4.019-1.766-4.079-3.968v-33.328c5.243-18.401 1.231-7.060-2.735 4.304l-9.077 29.877c-0.966 2.076-2.398 3.221-4.188 3.221z"/>
              </svg>
            </div>
            <div className="header-tagline">Acordo Oficial</div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="timer-box text-center mb-6">
          Atenção: Esta oferta expira em <span id="timer">{timer}</span>. Aproveite o desconto agora!
        </div>

        <section className="acordo-detalhes">
          <h2 className="mb-4 text-danger font-bold text-xl flex items-center gap-2">
            Ação de Recuperação de Crédito Centralizada
          </h2>
          <div className="debt-list">
            <div className="debt-item">
              <div className="debt-info">
                <h4 className="text-danger font-bold">Protocolo de Conciliação Extrajudicial</h4>
                <p>Registro Geral: #SER-2024-JUD-9921</p>
                <p>Status: <span className="text-danger font-bold">AGUARDANDO PENHORA</span></p>
                <p className="small text-muted">Esta oferta cancela o processo de negativação em andamento.</p>
              </div>
              <div className="debt-value text-right">
                <p className="original-price">{originalVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <p className="discounted-price">{discountedVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
            </div>
          </div>

          <div className="summary-card mt-8">
            <span className="total-savings mb-4">Você está economizando {savingsVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            <p className="mb-2">Valor total do acordo:</p>
            <h2 className="text-4xl font-bold mb-4">{discountedVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
            <p className="mb-6">em 1x no PIX ou Cartão, 100% seguro!</p>
            <button onClick={() => router.push('/checkout')} className="btn-primary w-full py-4 text-lg">
              QUERO LIMPAR MEU NOME AGORA
            </button>
            <p className="mt-4 opacity-80 small text-center">Oferta exclusiva e por tempo limitado. Aproveite a chance de recomeçar!</p>
          </div>
        </section>
      </main>
    </div>
  );
}
