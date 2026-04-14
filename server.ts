import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import pool from './database';

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

app.post('/upload', upload.single('image'), async (req, res) => {
  const { title, theme } = req.body;
  const filename = req.file?.filename;
  if (!filename) return res.status(400).send('Aucune image uploadée');

  try {
    const result = await pool.query('INSERT INTO images (title, theme, filename) VALUES ($1, $2, $3) RETURNING id', [title, theme, filename]);
    res.send({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).send('Erreur base de données');
  }
});

app.get('/images', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM images');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Erreur base de données');
  }
});

app.listen(port, () => {
  console.log(`Serveur sur http://localhost:${port}`);
});