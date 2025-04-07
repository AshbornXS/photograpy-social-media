
document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.album-carrossel').forEach(carrossel => {
    const slides = carrossel.querySelectorAll('.carrossel-slide');
    const prevBtn = carrossel.querySelector('.prev-btn');
    const nextBtn = carrossel.querySelector('.next-btn');
    let currentIndex = 0;


    const updateCarrossel = () => {
      slides.forEach((slide, index) => {
        slide.style.display = index === currentIndex ? 'block' : 'none';
      });
    };


    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarrossel();
      });

      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarrossel();
      });
    }


    updateCarrossel();
  });
});


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.like-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();

      const form = button.closest('form');
      const likesCountElement = form.nextElementSibling;
      const action = form.action;

      try {

        const response = await fetch(action, { method: 'POST' });
        const data = await response.json();

        if (data.success) {

          likesCountElement.textContent = `${data.likes} curtidas`;


          if (data.isLiked) {
            button.textContent = '❤️';
            form.action = `/posts/unlike/${form.dataset.postId}`;
          } else {
            button.textContent = '🤍';
            form.action = `/posts/like/${form.dataset.postId}`;
          }
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Erro ao atualizar curtidas:', error);
      }
    });
  });
});


document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.follow-form').forEach(form => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const action = form.action;

      try {

        const response = await fetch(action, { method: 'POST' });

        if (response.ok) {

          window.location.reload();
        } else {
          console.error('Erro ao seguir/desseguir usuário:', await response.text());
        }
      } catch (error) {
        console.error('Erro ao seguir/desseguir usuário:', error);
      }
    });
  });
});

function enableEditComment(commentId) {

  const commentText = document.getElementById(`comment-text-${commentId}`);
  commentText.style.display = 'none';


  const editForm = document.getElementById(`edit-comment-form-${commentId}`);
  editForm.style.display = 'block';
}

function cancelEditComment(commentId) {

  const commentText = document.getElementById(`comment-text-${commentId}`);
  commentText.style.display = 'inline';


  const editForm = document.getElementById(`edit-comment-form-${commentId}`);
  editForm.style.display = 'none';
}
