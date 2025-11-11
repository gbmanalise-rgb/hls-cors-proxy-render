const express = require('express');
const fetch = require('node-fetch'); // Certifique-se de que é a versão 2.6.1 se for usar Node 12 ou 14
const app = express();
// O Render fornece a porta via variável de ambiente
const PORT = process.env.PORT || 3000;

// O endpoint do nosso proxy: /proxy?url=
app.get('/proxy', async (req, res) => {
    // 1. Obter o URL de destino
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('Parâmetro "url" é obrigatório.');
    }

    // 2. Adicionar o cabeçalho CORS para o navegador antes de tudo
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Expose-Headers', '*');

    try {
        // 3. Fazer a requisição para a URL do Stream
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                // *** PONTO CRÍTICO: Sobrescrever o User-Agent do servidor ***
                // Faz o proxy parecer um navegador Chrome para o servidor de vídeo
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                // Não inclua o Referer, deixando-o nulo para simular um acesso mais direto/VLC
            }
        });

        // 4. Repassar o Status Code e o Conteúdo do stream
        res.status(response.status);
        response.body.pipe(res);

    } catch (error) {
        console.error('Erro ao buscar a URL de destino:', error);
        // Se falhar (ex: DNS, Timeout), informa erro 500
        res.status(500).send('Erro interno do servidor proxy.');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy rodando na porta ${PORT}`);
});
