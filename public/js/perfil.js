document.addEventListener('DOMContentLoaded', () => {
    const sairButton = document.getElementById('sair');
    const nomeUsuario = document.getElementById('nomeUsuario');
    const pontosElement = document.getElementById('totalPontos');
    const trofeusElement = document.getElementById('trofeus');

    // Recupera o nome do usuário do localStorage e exibe na página
    const usuarioNome = localStorage.getItem('usuarioNome');
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioNome) {
        nomeUsuario.innerHTML = `${usuarioNome}`;
    }

    function carregarInformacoesUsuario() {
        // Fazer requisição para obter os pontos do usuário
        fetch('/api/pontos')
            .then(response => response.json())
            .then(data => {
                if (data.total_pontos !== undefined) {
                    pontosElement.textContent = `Total de Pontos: ${data.total_pontos}`;
                }
            })
            .catch(error => {
                console.error('Houve um problema com a requisição de pontos:', error);
            });

        // Fazer requisição para obter os troféus do usuário
        fetch('/api/trofes')
            .then(response => response.json())
            .then(data => {
                if (data.trofeus && data.trofeus.length > 0) {
                    trofeusElement.innerHTML = '<br>Troféus:' + data.trofeus.map(trofeu => `<br><li>${trofeu} &#127942;</li>`).join('');
                } else {
                    trofeusElement.innerHTML = 'Nenhum troféu conquistado ainda.';
                }
            })
            .catch(error => {
                console.error('Houve um problema com a requisição de troféus:', error);
            });
    }
    
    // Carregar as informações do usuário quando a página for carregada
    carregarInformacoesUsuario();

    if (sairButton) {
        sairButton.addEventListener('click', () => {
            fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    localStorage.removeItem('usuarioNome'); // Remove o nome do usuário do localStorage
                    window.location.href = '/'; // Redireciona para a página de login
                }
            }).catch(error => {
                console.error('Erro ao tentar sair:', error);
            });
        });
    }
});