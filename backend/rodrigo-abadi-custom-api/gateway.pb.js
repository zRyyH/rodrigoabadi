// pb_hooks/gateway.pb.js

// Define a rota: POST /api/meu-endpoint
// O (c) é o contexto da requisição
routerAdd("POST", "/api/preprocess", (c) => {

    // 1. Pega o corpo da requisição (JSON) que o usuario enviou
    const requestInfo = $apis.requestInfo(c);

    // Se quiser pegar o ID do usuario logado para passar para sua API:
    const usuarioLogado = c.get("authRecord"); // Pega o registro do usuario

    // Prepara os dados para enviar para sua API interna
    let dadosParaEnviar = {};

    // Se o request tem JSON, copiamos. Se não, enviamos vazio.
    if (requestInfo.data) {
        dadosParaEnviar = requestInfo.data;
    }

    // Opcional: Injetar quem é o usuário na requisição para sua API
    dadosParaEnviar.user_id = usuarioLogado.id;
    dadosParaEnviar.user_email = usuarioLogado.email;

    try {
        // 2. O PocketBase chama sua API interna
        // ATENÇÃO: Use o NOME DO SERVIÇO do docker-compose, não localhost
        const response = $http.send({
            url: "http://backend_api:3000/rota/real",
            method: "POST",
            body: JSON.stringify(dadosParaEnviar),
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 10 // segundos
        });

        // 3. Devolve a resposta da sua API para o usuário final
        // response.json converte a resposta da sua API automaticamente
        return c.json(response.statusCode, response.json);

    } catch (err) {
        // Erro caso sua API esteja offline ou dê timeout
        return c.json(502, {
            message: "Erro ao comunicar com o serviço interno",
            error: err.toString()
        });
    }

}, $apis.requireRecordAuth()); // <--- ISSO BLOQUEIA USUÁRIOS NÃO LOGADOS