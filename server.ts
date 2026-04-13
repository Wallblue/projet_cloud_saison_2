import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import db from './database';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  const { title, theme } = req.body;
  const filename = req.file?.filename;
  if (!filename) return res.status(400).send('Aucune image uploadée');

  db.run('INSERT INTO images (title, theme, filename) VALUES (?, ?, ?)', [title, theme, filename], function(err) {
    if (err) return res.status(500).send('Erreur base de données');
    res.send({ id: this.lastID });
  });
});

app.get('/images', (req, res) => {
  db.all('SELECT * FROM images', [], (err, rows) => {
    if (err) return res.status(500).send('Erreur base de données');
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Serveur sur http://localhost:${port}`);
});