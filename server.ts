import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import pool from './database';

dotenv.config();

const app = express();
const port = 3000;

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('image'), async (req, res) => {
  const { title, theme } = req.body;
  if (!req.file) return res.status(400).send('Aucune image uploadée');

  const key = `${Date.now()}-${req.file.originalname}`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const result = await pool.query(
      'INSERT INTO images (title, theme, filename) VALUES ($1, $2, $3) RETURNING id',
      [title, theme, s3Url]
    );
    res.send({ id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur upload S3 ou base de données');
  }
});

app.get('/images/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM images WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('Image non trouvée');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Erreur base de données');
  }
});

app.get('/images', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM images WHERE validated = true');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Erreur base de données');
  }
});

app.listen(port, () => {
  console.log(`Serveur sur http://localhost:${port}`);
});