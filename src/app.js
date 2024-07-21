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
            req.session.usuario = usuario;
            res.json({ success: true, redirect: '/home' });
        } else {
            res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }
    });
});

app.get("/home", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        res.redirect('/'); // Redireciona para a página de login
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
