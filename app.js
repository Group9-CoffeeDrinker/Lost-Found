const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const fs = require('fs');
const multiparty = require('multiparty');

const app = express();

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.disable('x-powered-by'); //hiding the information of the api respond header 

const MockData = [
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

app.post('/report', (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing report form:', err);
      return res.status(400).send('Error parsing the form. Please try again.');
    }

    const getField = (name) => (fields[name] && fields[name][0]) || '';

    const name = getField('name');
    const description = getField('description');
    const location = getField('location');
    const date = getField('date');
    const contact = getField('contact');
    const status = getField('status') || 'Lost';

    let imagePath = '';
    const uploadedFile = files.image ? files.image : null;

    if (uploadedFile && uploadedFile.length > 0) {
      const file = uploadedFile[0];
      const originalFileName = file.originalFilename;
      const tempFilePath = file.path;

      const allowedExtensions = ['.jpg', '.jpeg', '.png'];
      const fileExtension = path.extname(originalFileName).toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        console.warn(`Invalid file type: ${fileExtension}`);
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        return res
          .status(400)
          .send(`Invalid file type. Only ${allowedExtensions.join(', ')} are allowed.`);
      }

      const timestamp = Date.now();
      const safeName = originalFileName.replace(/\s+/g, '_');
      const fileName = `${timestamp}_${safeName}`;
      const finalFilePath = path.join(uploadDir, fileName);

      try {
        fs.copyFileSync(tempFilePath, finalFilePath);
        fs.unlinkSync(tempFilePath);
        imagePath = `/uploads/${fileName}`;
      } catch (fsError) {
        console.error('File system error while saving upload:', fsError);
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        return res.status(500).send('Error saving the uploaded file.');
      }
    }

    const item = {
      id: String(Date.now()),
      name,
      description,
      location,
      date,
      contact,
      imagePath,
      status,
    };

    MockData.push(item);
    res.redirect('/dashboard');
  });
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
