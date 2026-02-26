const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const multer = require('multer');

const app = express();

// Mock data array to store items
const MockData = [];

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

// Configure multer for file uploads to the public/uploads directory
const upload = multer({
  dest: path.join(__dirname, 'public/uploads')
});

app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.get('/report', (req, res) => {
  res.render('report', { pageTitle: 'Report Item' });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { pageTitle: 'Dashboard' });
});

app.get('/items/:id', (req, res) => {
  res.render('detail', {
    pageTitle: 'Item Detail',
    itemId: req.params.id,
  });
});

// POST /report route
app.post('/report', upload.single('itemImage'), (req, res) => {
  const { itemName, description, locationLost, date, contactEmail } = req.body;
  const itemImage = req.file;

  // Validate all fields are present
  if (!itemName || !description || !locationLost || !date || !contactEmail || !itemImage) {
    return res.status(400).send('All fields are required.');
  }

  // Create a new lost item object
  const newItem = {
    id: Date.now(),
    name: itemName,
    description,
    location: locationLost,
    date,
    contact: contactEmail,
    imagePath: `/uploads/${itemImage.filename}`, // Public path for the uploaded image
    status: 'Lost'
  };

  // Save the new item to MockData
  MockData.push(newItem);

  res.redirect('/dashboard');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
