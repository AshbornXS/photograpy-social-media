document.addEventListener('DOMContentLoaded', () => {
  const bell = document.getElementById('notification-bell');
  const menu = document.getElementById('notification-menu');
  const closeBtn = menu.querySelector('.close-menu-btn');
  const notificationList = document.getElementById('notification-list');
  const userId = document.body.dataset.userId;

  if (!userId) {
    console.error('ID do usuário não encontrado. O usuário está logado?');
    return;
  }


  bell.addEventListener('click', async () => {
    menu.style.display = 'block';


    try {
      const response = await fetch(`/posts/notifications/${userId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar notificações');
      }

      const notifications = await response.json();
      notificationList.innerHTML = '';

      if (notifications.length > 0) {
        notifications.forEach(notification => {
          const li = document.createElement('li');
          li.className = notification.lida ? 'lida' : 'nao-lida';
          li.innerHTML = `
            <p><strong>${notification.tipo}:</strong> ${notification.mensagem}</p>
            <p><small>${new Date(notification.data_notificacao).toLocaleString('pt-BR')}</small></p>
            <button class="mark-as-read-btn" data-id="${notification.id}">Marcar como lida</button>
          `;
          notificationList.appendChild(li);
        });


        document.querySelectorAll('.mark-as-read-btn').forEach(button => {
          button.addEventListener('click', async (event) => {
            const notificationId = event.target.dataset.id;

            try {
              const response = await fetch(`/posts/notifications/${notificationId}/read`, { method: 'POST' });
              if (response.ok) {

                event.target.parentElement.remove();
              } else {
                console.error('Erro ao marcar notificação como lida:', await response.text());
              }
            } catch (error) {
              console.error('Erro ao marcar notificação como lida:', error);
            }
          });
        });
      } else {
        notificationList.innerHTML = '<p>Você não tem notificações.</p>';
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      notificationList.innerHTML = '<p>Erro ao carregar notificações.</p>';
    }
  });


  closeBtn.addEventListener('click', () => {
    menu.style.display = 'none';
  });
});
