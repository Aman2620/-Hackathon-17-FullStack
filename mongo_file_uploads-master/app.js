const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

//generate the crypto file name
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Mongo URI
const mongoURI = 'mongodb+srv://Rajan:Rajan@cluster0.vpllnar.mongodb.net/uploadDB';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init grid file system 
let gfs;




conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  // uploads is the collection name 
  gfs.collection('uploads');
});

// Create storage engine 
// extencser name is givent crypt 

const storage = new GridFsStorage({
  
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // genertate the name with 16 character 
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// route GET /
// desc Loads form 
// load the data form the cod
app.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files any type of file 
    if (!files || files.length === 0) {
      res.render('index', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('index', { files: files });
    }
  });
});

// @route POST /upload
// @desc  Uploads file to DB
// single is used to upload one file at one time 

app.post('/upload', upload.single('file'), (req, res) => {
  // below code is return th file data to server 

  // res.json({ file: req.file });
  // after upload go to the home page 

  res.redirect('/');
  
});

// @route GET /files
//   Display all files in JSON
app.get('/files', (req, res) => {
    // find  the files 
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      // no files 
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.json(files);
  });
});

// @route GET /files/:filename
// @desc  Display single file object
app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});

// @route GET /image/:filename
// @desc Display Image
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image exite or not 
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// @route DELETE /files/:id
// @desc  Delete file
app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/');
  });
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
