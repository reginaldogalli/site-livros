document.addEventListener('DOMContentLoaded', () => {
    const sairButton = document.getElementById('sair');
    const nomeUsuario = document.getElementById('nomeUsuario');

    // Recupera o nome do usuário do localStorage e exibe na página
    const usuarioNome = localStorage.getItem('usuarioNome');
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioNome) {
        nomeUsuario.innerHTML = `${usuarioNome}`;
    }

    fetch('/api/ranking')
                .then(response => response.json())
                .then(data => {
                    const tableBody = document.querySelector('#ranking-table tbody');
                    tableBody.innerHTML = '';
                    data.forEach((usuario, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${usuario.nome}</td>
                            <td>${usuario.total_pontos}</td>
                        `;
                        tableBody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('Houve um problema com a requisição:', error);
                });

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