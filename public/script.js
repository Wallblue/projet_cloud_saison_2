document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('theme', document.getElementById('theme').value);
  formData.append('image', document.getElementById('image').files[0]);

  const response = await fetch('/upload', { method: 'POST', body: formData });
  if (!response.ok) {
    alert('Erreur lors de l\'upload');
    return;
  }

  const { id } = await response.json();

  // Attendre que Lambda ait validé le fichier (max 10 secondes)
  let validated = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    const check = await fetch(`/images/${id}`);
    const img = await check.json();
    if (img.validated !== null) {
      validated = img.validated;
      break;
    }
  }

  if (validated === true) {
    alert('Image uploadée et validée avec succès !');
    document.getElementById('uploadForm').reset();
    loadImages();
  } else if (validated === false) {
    alert('Fichier rejeté : ce format n\'est pas accepté. Seuls .jpg, .jpeg, .png, .gif et .webp sont autorisés.');
    document.getElementById('uploadForm').reset();
  } else {
    alert('Upload réussi mais la validation n\'a pas répondu à temps.');
    document.getElementById('uploadForm').reset();
    loadImages();
  }
});

async function loadImages() {
  const response = await fetch('/images');
  const images = await response.json();

  // Grouper par thème
  const grouped = {};
  images.forEach(img => {
    if (!grouped[img.theme]) grouped[img.theme] = [];
    grouped[img.theme].push(img);
  });

  const container = document.getElementById('images');
  container.innerHTML = Object.keys(grouped).map(theme => `
    <div class="theme-group">
      <button class="theme-toggle" data-theme="${theme}">
        <span class="arrow">▼</span>
        <h2>${theme}</h2>
      </button>
      <div class="images-row" id="row-${theme}">
        ${grouped[theme].map(img => `
          <div>
            <h3>${img.title}</h3>
            <img src="${img.filename}" alt="${img.title}">
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Ajouter les événements au boutons
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const theme = btn.dataset.theme;
      const row = document.getElementById(`row-${theme}`);
      const arrow = btn.querySelector('.arrow');
      
      row.classList.toggle('hidden');
      arrow.classList.toggle('rotated');
    });
  });
}

loadImages();