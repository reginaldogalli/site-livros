function logout() {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            window.location.href = '/'; // Redireciona para a página de login
        }
    }).catch(error => {
        console.error('Erro ao tentar sair:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const sairButton = document.getElementById('sair');
    if (sairButton) {
        sairButton.addEventListener('click', logout);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');

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
                  window.location.href = result.redirect; // Redireciona em caso de sucesso
              } else {
                  alert(result.message); // Exibe a mensagem de erro em um alerta
              }
          }).catch(error => {
              console.error('Erro ao tentar fazer login:', error);
              alert('Erro interno do servidor.');
          });
    });
});