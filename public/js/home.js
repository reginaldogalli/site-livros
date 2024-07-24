document.addEventListener('DOMContentLoaded', () => {
    const sairButton = document.getElementById('sair');
    const nomeUsuario = document.getElementById('nomeUsuario');
    const livrosLista = document.getElementById('livros-lista');

    // Recupera o nome do usuário do localStorage e exibe na página
    const usuarioNome = localStorage.getItem('usuarioNome');
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioNome) {
        nomeUsuario.innerHTML = `${usuarioNome}`;
    }

    function carregarLivros() {
        // Fazer requisição para obter os livros
        fetch('/api/livros')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(livros => {
                // Fazer requisição para obter as leituras do usuário
                return fetch('/api/leituras/id')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(leituras => {
                        // Limpa a lista atual
                        livrosLista.innerHTML = '';
    
                        // Cria um conjunto de ids de livros lidos
                        const livrosLidosIds = new Set(leituras.map(leitura => leitura.livro_id));
    
                        // Itera sobre a lista de livros e marca o checkbox se o livro foi lido
                        livros.forEach(livro => {
                            const livroItem = document.createElement('details');
                            livroItem.innerHTML = `
                                <summary>${livro.titulo}<img src="../img/${livro.id}.png" class="img-exercicios" alt="capa"></summary>
                                <p class="livro-item">Autor: ${livro.autor}</p><br>
                                <p class="pag">Páginas: ${livro.paginas}</p><br>
                                <p class="estilo">Estilo: ${livro.estilo}</p><br>
                                <p class="desc">Descrição: ${livro.descricao}</p><br>
                                <div class=div-slide>
                                    <label class="switch">
                                        <input type="checkbox" data-livro-id="${livro.id}" ${livrosLidosIds.has(livro.id) ? 'checked' : ''}>
                                        <span class="slider round"></span>
                                    </label>
                                    <span class="labelTroca"> Marcar livro lido</span>
                                </div>
                            `;
                            livrosLista.appendChild(livroItem);
    
                            // Adicionar event listener para o checkbox
                            const checkbox = livroItem.querySelector('input[type="checkbox"]');
                            checkbox.addEventListener('change', (event) => {
                                const livroId = event.target.getAttribute('data-livro-id');
                                const isChecked = event.target.checked;
                                console.log(`Checkbox para livro ${livroId} alterado. Estado: ${isChecked}`);
                                
                                if (isChecked) {
                                    // Fazer requisição POST para adicionar leitura
                                    fetch('/api/leituras/id', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ livro_id: livroId })
                                    })
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error('Network response was not ok');
                                        }
                                        return response.json();
                                    })
                                    .then(data => {
                                        console.log('Leitura adicionada:', data);
                                    })
                                    .catch(error => {
                                        console.error('Houve um problema com a requisição:', error);
                                    });
                                } else {
                                    // Fazer requisição DELETE para remover leitura
                                    fetch(`/api/leituras/${livroId}`, {
                                        method: 'DELETE'
                                    })
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error('Network response was not ok');
                                        }
                                        return response.json();
                                    })
                                    .then(data => {
                                        console.log('Leitura removida:', data);
                                    })
                                    .catch(error => {
                                        console.error('Houve um problema com a requisição:', error);
                                    });
                                }
                            });
                        });
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
