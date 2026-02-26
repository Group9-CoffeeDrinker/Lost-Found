const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
    cb(null, `${Date.now()}-${Buffer.from(file.originalname, 'latin1').toString('utf8').replace(/\s+/g, '-')}${ext}`);
  },
});
const upload = multer({ storage });
app.disable('x-powered-by'); //hiding the information of the api respond header 

const MockData = [
  {
    id: 'unique_string', // Use Date.now() or a UUID
    name: 'Blue Wallet',
    description: 'Leather wallet with student ID',
    location: 'Library Hall B',
    date: '2023-10-25',
    contact: 'student@univ.edu',
    imagePath: '/uploads/filename.jpg',
    status: 'Lost', // Default: Lost. Others: Found, Closed.
  },
  {
    id: 'unique_string_2', // Use Date.now() or a UUID
    name: 'Black Umbrella',
    description: 'Foldable umbrella left in cafeteria',
    location: 'Cafeteria',
    date: '2023-10-26',
    contact: 'owner@univ.edu',
    imagePath: '/uploads/umbrella.jpg',
    status: 'Found', // Default: Lost. Others: Found, Closed.
  },
];

// Handlebars configuration with helpers defined inline
app.engine('.hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: [path.join(__dirname, 'views/partials')],
  helpers: {
    // Content that can be rendered in specific areas of the layout
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.get('/report', (req, res) => {
  res.render('report', { pageTitle: 'Report Item' });
});

app.post('/report', upload.single('image'), (req, res) => {
  const { name, description, location, date, contact, status } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
  const item = {
    id: String(Date.now()),
    name: name || '',
    description: description || '',
    location: location || '',
    date: date || '',
    contact: contact || '',
    imagePath: imagePath,
    status: status || 'Lost',
  };
  MockData.push(item);
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    pageTitle: 'Dashboard',
    items: MockData,
  });
});

app.get('/items/:id', (req, res) => {
  res.render('detail', {
    pageTitle: 'Item Detail',
    itemId: req.params.id,
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
