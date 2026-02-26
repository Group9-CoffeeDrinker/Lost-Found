const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();

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
  res.render('dashboard', { pageTitle: 'Dashboard' });
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
