require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const ADMIN_CODE = process.env.ADMIN_CODE || 'gereja2026';
const DB_PATH = path.join(__dirname, 'data', 'warta.json');

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DATABASE (file JSON, tanpa dependensi native) ================= */
function defaultData() {
  return {
    nextId: 6,
    ibadah: [
      { id: 1, tipe: 'offline', nama: 'Ibadah I', tanggal: '2026-07-26', jamMulai: '06:30', jamSelesai: '08:00', tempat: 'Gedung Gereja Utama', link: '' },
      { id: 2, tipe: 'offline', nama: 'Ibadah II', tanggal: '2026-07-26', jamMulai: '09:00', jamSelesai: '10:30', tempat: 'Gedung Gereja Utama', link: '' },
      { id: 3, tipe: 'offline', nama: 'Ibadah III (Remaja)', tanggal: '2026-07-26', jamMulai: '17:00', jamSelesai: '18:30', tempat: 'Gedung Gereja Utama', link: '' },
      { id: 4, tipe: 'online', nama: 'Ibadah Utama', tanggal: '2026-07-26', jamMulai: '09:00', jamSelesai: '', tempat: 'YouTube Live', link: '' },
      { id: 5, tipe: 'online', nama: 'Ibadah Interaktif (Zoom)', tanggal: '2026-07-26', jamMulai: '09:00', jamSelesai: '', tempat: 'Zoom — ID 812 3456 7890', link: '' }
    ],
    settings: { heroDate: 'Minggu, 26 Juli 2026' }
  };
}

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = defaultData();
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    console.error('Gagal membaca database, memakai data awal:', e.message);
    return defaultData();
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

let db = loadDB();

/* ================= HELPERS ================= */
function requireAdmin(req, res, next) {
  const code = req.header('x-admin-code');
  if (code !== ADMIN_CODE) {
    return res.status(401).json({ error: 'Kode admin tidak valid.' });
  }
  next();
}

function sortIbadah(list) {
  return list.slice().sort((a, b) => (a.tanggal + a.jamMulai).localeCompare(b.tanggal + b.jamMulai));
}

/* ================= API: LOGIN ================= */
app.post('/api/login', (req, res) => {
  const { code } = req.body || {};
  if (code === ADMIN_CODE) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'Kode admin salah.' });
});

/* ================= API: IBADAH (CRUD) ================= */
app.get('/api/ibadah', (req, res) => {
  res.json(sortIbadah(db.ibadah));
});

app.post('/api/ibadah', requireAdmin, (req, res) => {
  const { tipe, nama, tanggal, jamMulai, jamSelesai, tempat, link } = req.body || {};
  if (!tipe || !nama || !tanggal || !jamMulai) {
    return res.status(400).json({ error: 'Tipe, nama, tanggal, dan jam mulai wajib diisi.' });
  }
  const now = new Date().toISOString();
  const row = {
    id: db.nextId++,
    tipe, nama, tanggal, jamMulai,
    jamSelesai: jamSelesai || '',
    tempat: tempat || '',
    link: link || '',
    createdAt: now,
    updatedAt: now
  };
  db.ibadah.push(row);
  saveDB(db);
  res.status(201).json(row);
});

app.put('/api/ibadah/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.ibadah.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Jadwal tidak ditemukan.' });

  const { tipe, nama, tanggal, jamMulai, jamSelesai, tempat, link } = req.body || {};
  if (!tipe || !nama || !tanggal || !jamMulai) {
    return res.status(400).json({ error: 'Tipe, nama, tanggal, dan jam mulai wajib diisi.' });
  }
  db.ibadah[idx] = {
    ...db.ibadah[idx],
    tipe, nama, tanggal, jamMulai,
    jamSelesai: jamSelesai || '',
    tempat: tempat || '',
    link: link || '',
    updatedAt: new Date().toISOString()
  };
  saveDB(db);
  res.json(db.ibadah[idx]);
});

app.delete('/api/ibadah/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.ibadah.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Jadwal tidak ditemukan.' });
  db.ibadah.splice(idx, 1);
  saveDB(db);
  res.json({ ok: true });
});

/* ================= API: SETTINGS (heroDate, dsb) ================= */
app.get('/api/settings', (req, res) => {
  res.json(db.settings);
});

app.put('/api/settings', requireAdmin, (req, res) => {
  db.settings = { ...db.settings, ...(req.body || {}) };
  saveDB(db);
  res.json(db.settings);
});

/* ================= STATIC FRONTEND ================= */
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LP Churh backend berjalan di http://localhost:${PORT}`);
  console.log(`Database: ${DB_PATH}`);
});
