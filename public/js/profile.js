document.addEventListener('DOMContentLoaded', () => {
  const openPostMenuBtn = document.getElementById('open-post-menu-btn');
  const openEditProfileMenuBtn = document.getElementById('open-edit-profile-menu-btn');
  const openAlbumMenuBtn = document.getElementById('open-album-menu-btn');
  const closeMenuBtns = document.querySelectorAll('.close-menu-btn');
  const postMenu = document.getElementById('post-menu');
  const editProfileMenu = document.getElementById('edit-profile-menu');
  const albumMenu = document.getElementById('album-menu');
  const imageInput = document.getElementById('image');
  const previewImage = document.getElementById('preview-image');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const hashtagsInput = document.getElementById('hashtags');
  const locationInput = document.getElementById('localizacao');
  const getLocationBtn = document.getElementById('get-location-btn');
  const postThumbnails = document.querySelectorAll('.post-thumbnail');
  const editPostMenu = document.getElementById('edit-post-menu');
  const editPostForm = document.getElementById('edit-post-form');
  const editPostId = document.getElementById('edit-post-id');
  const editImageInput = document.getElementById('edit-image');
  const editPreviewImage = document.getElementById('edit-preview-image');
  const editLegenda = document.getElementById('edit-legenda');
  const editLocalizacao = document.getElementById('edit-localizacao');
  const editHashtagsInput = document.getElementById('edit-hashtags');
  const albumThumbnails = document.querySelectorAll('.album-thumbnail');
  const editAlbumMenu = document.getElementById('edit-album-menu');


  if (openPostMenuBtn) {
    openPostMenuBtn.addEventListener('click', () => {
      postMenu.style.display = 'flex';
    });
  }

  if (openEditProfileMenuBtn) {
    openEditProfileMenuBtn.addEventListener('click', () => {
      editProfileMenu.style.display = 'flex';
    });
  }

  if (openAlbumMenuBtn) {
    openAlbumMenuBtn.addEventListener('click', () => {
      albumMenu.style.display = 'flex';
    });
  }


  closeMenuBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      postMenu.style.display = 'none';
      editProfileMenu.style.display = 'none';
      editPostMenu.style.display = 'none';
      albumMenu.style.display = 'none';
      editAlbumMenu.style.display = 'none';
    });
  });


  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      postMenu.style.display = 'none';
      editProfileMenu.style.display = 'none';
      editPostMenu.style.display = 'none';
      albumMenu.style.display = 'none';
      editAlbumMenu.style.display = 'none';
    }
  });


  if (imageInput) {
    imageInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.src = e.target.result;
          previewImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        previewImage.style.display = 'none';
      }
    });
  }


  tagButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tag = button.dataset.tag;
      button.classList.toggle('selected');


      const currentTags = hashtagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (button.classList.contains('selected')) {
        if (!currentTags.includes(tag)) {
          currentTags.push(tag);
        }
      } else {
        const index = currentTags.indexOf(tag);
        if (index > -1) {
          currentTags.splice(index, 1);
        }
      }
      console.log(currentTags);
      hashtagsInput.value = currentTags.join(', ');
    });
  });


  tagButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tag = button.dataset.tag;
      const currentTags = hashtagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);


      if (!currentTags.includes(tag)) {
        currentTags.push(tag);
        hashtagsInput.value = currentTags.join(', ');
      }
    });
  });


  if (getLocationBtn) {
    getLocationBtn.addEventListener('click', async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();

              if (data.address) {
                const cidade = data.address.city || data.address.town || data.address.village || 'Cidade desconhecida';
                const estado = data.address.state || 'Estado desconhecido';
                locationInput.value = `${ cidade }, ${ estado }`;
              } else {
                alert('Não foi possível obter a localização.');
              }
            } catch (error) {
              console.error('Erro ao buscar localização:', error);
              alert('Erro ao buscar localização. Tente novamente.');
            }
          },
          (error) => {
            console.error('Erro ao obter localização:', error);
            alert('Erro ao obter localização: ' + error.message);
          }
        );
      } else {
        alert('Geolocalização não é suportada pelo seu navegador.');
      }
    });
  }


  postThumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', async () => {
      const postId = thumbnail.dataset.postId;

      try {

        const response = await fetch(`/ posts / ${ postId }`);
        if (!response.ok) {
          throw new Error('Erro ao buscar dados da postagem.');
        }
        const post = await response.json();


        editPostId.value = post.id;
        editLegenda.value = post.legenda;
        editLocalizacao.value = post.localizacao || '';
        editHashtagsInput.value = post.hashtags ? post.hashtags.split(',').join(', ') : '';
        if (post.arquivo_foto) {
          editPreviewImage.src = post.arquivo_foto;
          editPreviewImage.style.display = 'block';
        } else {
          editPreviewImage.style.display = 'none';
        }


        editPostForm.action = `/ posts / edit / ${ post.id }`;


        const deletePostForm = document.getElementById('delete-post-form');
        deletePostForm.action = `/ posts / delete/${post.id}`;


              editPostMenu.style.display = 'flex';
            } catch (error) {
              console.error('Erro ao carregar os dados da postagem:', error);
              alert('Erro ao carregar os dados da postagem. Tente novamente.');
            }
          });
      });


    albumThumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', async () => {
        const albumId = thumbnail.dataset.albumId;

        try {

          const response = await fetch(`/posts/albums/${albumId}`);
          if (!response.ok) {
            throw new Error('Erro ao buscar dados do álbum.');
          }
          const album = await response.json();


          document.getElementById('edit-album-id').value = album.id;
          document.getElementById('edit-album-nome').value = album.nome;
          document.getElementById('edit-album-descricao').value = album.descricao || '';


          const albumImagesContainer = document.getElementById('album-images-container');
          albumImagesContainer.innerHTML = '';
          album.fotos.split(',').forEach((foto, index) => {
            const imageWrapper = document.createElement('div');
            imageWrapper.classList.add('album-image-wrapper');
            imageWrapper.innerHTML = `
            <img src="${foto}" alt="Imagem do Álbum" class="album-imagem">
            <button type="button" class="remove-image-btn" data-image-index="${index}">Remover</button>
          `;
            albumImagesContainer.appendChild(imageWrapper);
          });


          document.querySelectorAll('.remove-image-btn').forEach(button => {
            button.addEventListener('click', (event) => {
              const imageIndex = event.target.dataset.imageIndex;
              album.fotos = album.fotos.split(',').filter((_, i) => i != imageIndex).join(',');
              event.target.parentElement.remove();
            });
          });


          document.getElementById('edit-album-form').action = `/posts/albums/edit/${album.id}`;
          document.getElementById('delete-album-form').action = `/posts/albums/delete/${album.id}`;


          editAlbumMenu.style.display = 'flex';
        } catch (error) {
          console.error('Erro ao carregar os dados do álbum:', error);
          alert('Erro ao carregar os dados do álbum. Tente novamente.');
        }
      });
    });


    if (editImageInput) {
      editImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            editPreviewImage.src = e.target.result;
            editPreviewImage.style.display = 'block';
          };
          reader.readAsDataURL(file);
        } else {
          editPreviewImage.style.display = 'none';
        }
      });
    }


    const imagesInput = document.getElementById('images');
    const previewImagesContainer = document.getElementById('preview-images-container');

    if (imagesInput) {
      imagesInput.addEventListener('change', (event) => {
        const files = event.target.files;
        previewImagesContainer.innerHTML = '';

        Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('album-imagem');
            previewImagesContainer.appendChild(img);
          };
          reader.readAsDataURL(file);
        });
      });
    }


    const addImagesInput = document.getElementById('add-images');
    const editPreviewImagesContainer = document.getElementById('edit-preview-images-container');

    if (addImagesInput) {
      addImagesInput.addEventListener('change', (event) => {
        const files = event.target.files;
        editPreviewImagesContainer.innerHTML = '';

        Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('album-imagem');
            editPreviewImagesContainer.appendChild(img);
          };
          reader.readAsDataURL(file);
        });
      });
    }
  });

function showLoadingSpinner() {
  document.getElementById('loading-spinner').style.display = 'block';
}
