const express = require('express');
const fetch = require('node-fetch'); 
const app = express();
// O Render fornece a porta via variável de ambiente
const PORT = process.env.PORT || 3000;

// Endpoint do proxy: /proxy?url=
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('Parâmetro "url" é obrigatório.');
    }

    // 1. Configurar cabeçalhos CORS ANTES de enviar a resposta
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Expose-Headers', '*');

    try {
        // 2. Fazer a requisição para a URL do Stream com os cabeçalhos de segurança
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                // *** USER-AGENT CORRIGIDO (MOBILE/WEBVIEW) ***
                // Imita um dispositivo que o servidor de vídeo espera
                'User-Agent': 'Mozilla/5.0 (Linux; Android 13; 2312DRA50G Build/TKQ1.221114.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0.7390.122 Mobile Safari/537.36',
                
                // *** REFERER QUE DESBLOQUEIA O CONTEÚDO ***
                'Referer': 'https://superembeds.com/', 
            }
        });

        // Garantir que recebemos uma resposta válida antes de continuar
        if (!response.ok) {
            console.error(`Erro na resposta do servidor de mídia: ${response.status} ${response.statusText}`);
            return res.status(response.status).send(`Erro ao buscar o recurso: ${response.statusText}`);
        }
        
        // 3. CORREÇÃO DE PARSING: Ler o corpo da resposta como texto integral.
        // Isso resolve o erro de MANIFEST_PARSING_ERROR ao garantir a integridade do manifesto HLS.
        const manifestText = await response.text(); 
        
        // 4. Repassar o status original e o conteúdo integral para o navegador
        res.status(response.status);
        res.send(manifestText); 

    } catch (error) {
        console.error('Erro de rede ou busca:', error);
        res.status(500).send('Erro interno no proxy Render.');
    }
});

// Inicia o servidor na porta fornecida pelo Render
app.listen(PORT, () => {
    console.log(`Proxy rodando na porta ${PORT}`);
});
