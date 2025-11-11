const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
// O Render usa a variável de ambiente PORT, mas 3000 é o padrão para testes locais
const PORT = process.env.PORT || 3000;

// Configura o CORS: Permite que qualquer origem (incluindo o Codepen) acesse este proxy.
app.use(cors({
    origin: '*', // Permite todas as origens
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rota de saúde (Health Check)
app.get('/', (req, res) => {
    res.send('Proxy CORS está online! Use a rota /proxy?url=SUA_URL');
});

// Rota principal do proxy
app.get('/proxy', async (req, res) => {
    // A URL que o cliente quer acessar deve vir no parâmetro 'url'
    const targetUrl = req.query.url;

    if (!targetUrl) {
        // Retorna erro se a URL não for fornecida
        return res.status(400).send('Erro: O parâmetro "url" é obrigatório. Exemplo: /proxy?url=SUA_URL_AQUI');
    }

    try {
        console.log(`Buscando recurso: ${targetUrl}`);
        
        // 1. Faz a requisição para a URL de destino
        const response = await fetch(targetUrl);
        
        if (!response.ok) {
            // Lida com erros como 404, 500, etc., do servidor de destino
            throw new Error(`Falha ao buscar o recurso: Status ${response.status}`);
        }

        // 2. Copia cabeçalhos importantes (como Content-Type) do recurso original
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
            res.set('Content-Type', contentType);
        }

        // 3. Adiciona cabeçalho de cache (Opcional, mas recomendado para vídeos)
        // Isso ajuda o navegador a armazenar o vídeo em cache.
        res.set('Cache-Control', 'public, max-age=3600'); 
        
        // 4. Retorna o corpo da resposta do recurso original diretamente para o cliente
        response.body.pipe(res);

    } catch (error) {
        console.error('Erro no proxy:', error.message);
        res.status(500).send('Erro interno ao processar o recurso: ' + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Proxy rodando na porta ${PORT}`);
});
