document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('theme', document.getElementById('theme').value);
  formData.append('image', document.getElementById('image').files[0]);

  const response = await fetch('/upload', { method: 'POST', body: formData });
  if (response.ok) {
    alert('Image uploadée !');
    loadImages();
  } else {
    alert('Erreur lors de l\'upload');
  }
});

async function loadImages() {
  const response = await fetch('/images');
  const images = await response.json();
  const container = document.getElementById('images');
  container.innerHTML = images.map(img => `
    <div>
      <h3>${img.title} (${img.theme})</h3>
      <img src="/uploads/${img.filename}" alt="${img.title}" width="200">
    </div>
  `).join('');
}

loadImages();