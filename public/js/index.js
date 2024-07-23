document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita o envio padrão do formulário
            
            const formData = new FormData(form);
            const data = {
                usuario: formData.get('usuario'),
                senha: formData.get('senha')
            };

            fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => response.json())
              .then(result => {
                  if (result.success) {
                      localStorage.setItem('usuarioNome', result.nomeUsuario); // Armazena o nome no localStorage
                      window.location.href = result.redirect; // Redireciona em caso de sucesso
                  } else {
                      alert(result.message); // Exibe a mensagem de erro em um alerta
                  }
              }).catch(error => {
                  console.error('Erro ao tentar fazer login:', error);
                  alert('Erro interno do servidor.');
              });
        });
    }
});
