const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();

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
