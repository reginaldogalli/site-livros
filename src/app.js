const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3001;  // Porta configurada para 3001

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração da sessão
app.use(session({
    secret: 'seu-segredo-aqui',  // Troque por um segredo seguro e complexo
    resave: false,
    saveUninitialized: true,  // Força a criação de uma sessão para novos usuários
    cookie: { 
        secure: false,  // Defina como true se estiver usando HTTPS
        maxAge: 1000 * 60 * 30  // Tempo de expiração do cookie: 30 minutos
    }
}));

app.use(express.static(path.join(__dirname, '..', 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'esse_eu_ja_li'
});

// Conexão com o banco de dados
db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL.');
});

// Middleware para verificar se o usuário está autenticado
function isAuthenticated(req, res, next) {
    if (req.session && req.session.usuario) {
        return next(); // Usuário autenticado
    } else {
        res.redirect('/'); // Usuário não autenticado
    }
}

app.post("/", (req, res) => {
    const { usuario, senha } = req.body;
    console.log(`Recebido POST com usuario: ${usuario} e senha: ${senha}`);
    
    const query = "SELECT * FROM usuarios WHERE nome = ? AND senha = ?";
    db.query(query, [usuario, senha], (error, results) => {
        if (error) {
            console.error('Erro na consulta ao banco de dados:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
        
        console.log('Resultados da consulta:', results);
        
        if (results.length > 0) {
            const nomeUsuario = results[0].nome;
            const idUsuario = results[0].id;

            req.session.usuario = usuario;
            res.json({
                success: true,
                nomeUsuario: nomeUsuario,
                idUsuario: idUsuario,
                redirect: '/home'
            });
        } else {
            res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }
    });
});

app.get("/home", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
});

app.get("/ranking", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'ranking.html'));
});

app.get("/perfil", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'perfil.html'));
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao destruir sessão:', err);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
        res.redirect('/'); // Redireciona para a página de login
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

app.get('/api/livros', isAuthenticated, (req, res) => {
    const query = 'SELECT * FROM livros'; // Ajuste a consulta conforme sua tabela
    db.query(query, (error, results) => {
        if (error) {
            console.error('Erro na consulta ao banco de dados:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
        res.json(results); // Retorna os resultados da consulta como JSON
    });
});

app.get('/api/leituras/id', isAuthenticated, (req, res) => {
    const usuarioNome = req.session.usuario;
    if (!usuarioNome) {
        console.log('Usuário não autenticado');
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const queryUsuario = 'SELECT id FROM usuarios WHERE nome = ?';
    
    db.query(queryUsuario, [usuarioNome], (error, results) => {
        if (error) {
            console.error('Erro na consulta ao banco de dados (usuário):', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }

        if (results.length === 0) {
            console.log('Usuário não encontrado.');
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const usuarioId = results[0].id;
        console.log(`ID do usuário: ${usuarioId}`);

        const queryLeituras = 'SELECT * FROM leituras WHERE usuario_id = ?';
        
        db.query(queryLeituras, [usuarioId], (error, results) => {
            if (error) {
                console.error('Erro na consulta ao banco de dados (leituras):', error);
                return res.status(500).json({ message: 'Erro interno do servidor.' });
            }

            console.log('Resultados da consulta:', results);
            res.json(results);
        });
    });
});

app.post('/api/leituras/id', isAuthenticated, (req, res) => {
    const { livro_id } = req.body;

    if (!livro_id) {
        return res.status(400).json({ message: 'ID do livro é necessário.' });
    }

    const usuarioNome = req.session.usuario;

    if (!usuarioNome) {
        console.log('Usuário não autenticado');
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const queryUsuario = 'SELECT id FROM usuarios WHERE nome = ?';
    db.query(queryUsuario, [usuarioNome], (error, results) => {
        if (error) {
            console.error('Erro na consulta ao banco de dados (usuário):', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }

        if (results.length === 0) {
            console.log('Usuário não encontrado.');
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const usuarioId = results[0].id;
        console.log(`ID do usuário: ${usuarioId}`);

        const query = 'INSERT INTO leituras (usuario_id, livro_id) VALUES (?, ?)';
        db.query(query, [usuarioId, livro_id], (error, results) => {
            if (error) {
                console.error('Erro ao inserir leitura:', error);
                return res.status(500).json({ message: 'Erro interno do servidor.' });
            }
            res.status(201).json({ message: 'Leitura adicionada com sucesso.' });
        });
    });
});

app.delete('/api/leituras/:livro_id', isAuthenticated, (req, res) => {
    const { livro_id } = req.params;
    if (!livro_id) {
        return res.status(400).json({ message: 'ID do livro é necessário.' });
    }

    const usuarioNome = req.session.usuario;
    if (!usuarioNome) {
        console.log('Usuário não autenticado');
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const queryUsuario = 'SELECT id FROM usuarios WHERE nome = ?';
    
    db.query(queryUsuario, [usuarioNome], (error, results) => {
        if (error) {
            console.error('Erro na consulta ao banco de dados (usuário):', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }

        if (results.length === 0) {
            console.log('Usuário não encontrado.');
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const usuarioId = results[0].id;
        console.log(`ID do usuário: ${usuarioId}`);

        const query = 'DELETE FROM leituras WHERE usuario_id = ? AND livro_id = ?';
        db.query(query, [usuarioId, livro_id], (error, results) => {
            if (error) {
                console.error('Erro ao deletar leitura:', error);
                return res.status(500).json({ message: 'Erro interno do servidor.' });
            }
            res.status(200).json({ message: 'Leitura removida com sucesso.' });
        });
    });
});

app.get('/api/ranking', (req, res) => {
    const query = `
        SELECT u.id, u.nome, 
               COUNT(l.livro_id) AS livros_lidos, 
               SUM(FLOOR(livro.paginas / 100)) AS pontos_adicionais,
               COUNT(l.livro_id) + SUM(FLOOR(livro.paginas / 100)) AS total_pontos
        FROM usuarios u
        LEFT JOIN leituras l ON u.id = l.usuario_id
        LEFT JOIN livros livro ON l.livro_id = livro.id
        GROUP BY u.id, u.nome
        ORDER BY total_pontos DESC
        LIMIT 10
    `;
    
    db.query(query, (error, results) => {
        if (error) {
            console.error('Erro na consulta ao banco de dados:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
        res.json(results);
    });
});

app.get('/api/pontos', isAuthenticated, (req, res) => {
    const usuarioNome = req.session.usuario;
    if (!usuarioNome) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    // Recuperar o ID do usuário
    const queryUsuario = 'SELECT id FROM usuarios WHERE nome = ?';
    
    db.query(queryUsuario, [usuarioNome], (error, results) => {
        if (error) {
            console.error('Erro na consulta ao banco de dados (usuário):', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const usuarioId = results[0].id;

        // Calcular a pontuação total
        const queryPontos = `
            SELECT 
                COUNT(DISTINCT l.livro_id) AS livros_lidos,
                SUM(FLOOR(livro.paginas / 100)) AS pontos_adicionais
            FROM leituras l
            JOIN livros livro ON l.livro_id = livro.id
            WHERE l.usuario_id = ?
        `;

        db.query(queryPontos, [usuarioId], (error, results) => {
            if (error) {
                console.error('Erro na consulta ao banco de dados (pontuação):', error);
                return res.status(500).json({ message: 'Erro interno do servidor.' });
            }

            const { livros_lidos, pontos_adicionais } = results[0];

            // Converter valores para número e somar
            const totalLivrosLidos = parseInt(livros_lidos, 10) || 0;
            const totalPontosAdicionais = parseInt(pontos_adicionais, 10) || 0;
            const totalPontos = totalLivrosLidos + totalPontosAdicionais;
            
            res.json({ total_pontos: totalPontos });
        });
    });
});


app.get('/api/trofes', isAuthenticated, (req, res) => {
    const usuarioNome = req.session.usuario;
    if (!usuarioNome) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    // Recuperar o ID do usuário
    const queryUsuario = 'SELECT id FROM usuarios WHERE nome = ?';
    
    db.query(queryUsuario, [usuarioNome], (error, results) => {
        if (error) {
            console.error('Erro na consulta ao banco de dados (usuário):', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const usuarioId = results[0].id;

        // Consultar os estilos e contar livros lidos
        const queryTrofeus = `
            SELECT 
                livro.estilo,
                COUNT(l.livro_id) AS quantidade
            FROM leituras l
            JOIN livros livro ON l.livro_id = livro.id
            WHERE l.usuario_id = ?
            GROUP BY livro.estilo
            HAVING COUNT(l.livro_id) >= 5
        `;

        db.query(queryTrofeus, [usuarioId], (error, results) => {
            if (error) {
                console.error('Erro na consulta ao banco de dados (troféus):', error);
                return res.status(500).json({ message: 'Erro interno do servidor.' });
            }

            // Adicionar troféus ao usuário (se necessário)
            // Exemplo: Enviar os dados dos troféus encontrados
            const trofeus = results.map(row => `Leitor de ${row.estilo}`);
            
            res.json({ trofeus });
        });
    });
});
