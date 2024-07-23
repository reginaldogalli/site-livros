document.addEventListener('DOMContentLoaded', () => {
    const sairButton = document.getElementById('sair');
    const nomeUsuario = document.getElementById('nomeUsuario');
    const livrosLista = document.getElementById('livros-lista');

    // Recupera o nome do usuário do localStorage e exibe na página
    const usuarioNome = localStorage.getItem('usuarioNome');
    if (usuarioNome) {
        nomeUsuario.innerHTML = `${usuarioNome}!`;
    }

    // Função para carregar a lista de livros
    function carregarLivros() {
        fetch('/api/livros')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Limpa a lista atual
                livrosLista.innerHTML = '';
                data.forEach(livro => {
                    const livroItem = document.createElement('details');
                    livroItem.innerHTML = `
                        <summary>${livro.titulo}<img src="../img/${livro.id}.png" class="img-exercicios" alt="capa"></summary>
                        <p class="livro-item">Autor: ${livro.autor}</p><br>
                        <p class="pag">Páginas: ${livro.paginas}</p><br>
                        <p class="estilo">Estilo: ${livro.estilo}</p><br>
                        <p class="desc">Descrição: ${livro.descricao}</p><br>
                        <div class=div-slide>
                            <label class="switch">
                                <input type="checkbox" ${livro.lido ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                            <span class="labelTroca"> Marcar livro lido</span>
                        </div>
                    `;
                    livrosLista.appendChild(livroItem);
                });
            })
            .catch(error => {
                console.error('Houve um problema com a requisição:', error);
            });
    }

    // Carrega os livros quando a página é carregada
    carregarLivros();

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
