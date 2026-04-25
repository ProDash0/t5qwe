require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

const ENKI_API_URL = 'https://api.enki-bank.com/v1';
const ENKI_PUBLIC_KEY = process.env.ENKI_PUBLIC_KEY || 'PUBLIC_KEY';
const ENKI_SECRET_KEY = process.env.ENKI_SECRET_KEY || 'SECRET_KEY';

const authHeader = 'Basic ' + Buffer.from(`${ENKI_PUBLIC_KEY}:${ENKI_SECRET_KEY}`).toString('base64');

app.post('/api/create-transaction', async (req, res) => {
    try {
        const { amount, customer, items, postback_url } = req.body;

        const payload = {
            amount,
            payment_method: 'PIX',
            customer,
            items,
            postback_url
        };

        const response = await fetch(`${ENKI_API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Enki API Error:', data);
            return res.status(response.status).json({ error: data.message || 'Error creating transaction' });
        }

        res.json(data);
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/consultar-cpf/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;
        const token = process.env.CPF_API_TOKEN || 'zqniPtC6uIfw6V0lF4mfDOP9NHPAJD97';
        const apiUrl = process.env.CPF_API_URL || `https://zerolimis-1.onrender.com/api/consultar?type=cpf&value=${cpf}&token=${token}`;
        const finalUrl = apiUrl.includes('${cpf}') ? apiUrl : apiUrl;

        console.log(`[CPF] Consultando: ${finalUrl}`);

        const response = await fetch(finalUrl.replace('${cpf}', cpf));

        console.log(`[CPF] Status da API: ${response.status}`);

        if (response.status === 401) {
            console.error('[CPF] Token inválido ou expirado (401)');
            return res.status(401).json({ error: 'Token da API inválido ou expirado. Atualize o CPF_API_TOKEN no .env' });
        }

        const text = await response.text();
        console.log(`[CPF] Resposta bruta: ${text.substring(0, 300)}`);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('[CPF] Resposta não é JSON válido:', text.substring(0, 200));
            return res.status(502).json({ error: 'API retornou resposta inválida' });
        }

        res.json(data);
    } catch (error) {
        console.error('[CPF] Erro na consulta:', error.message);
        res.status(500).json({ error: 'Erro ao consultar CPF: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
