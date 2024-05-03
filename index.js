const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // Import cors
const multer = require("multer");
const chokidar = require("chokidar");

const app = express();
app.use(express.static("public")); // Mengatur folder 'public' agar dapat diakses secara publik
app.use(cors()); // Gunakan middleware cors

const upload = multer({ dest: "uploads/" });

app.get('/', function(req, res) {
  res.send('<h1>Hello World</h1>');
});

let nextId = 1;

// Endpoint untuk mengunggah foto
app.post("/photo", upload.single("photo"), (req, res, next) => {
  try {
    const file = req.file;
    const id = nextId++; // Menggunakan ID berikutnya dan meningkatkan nilai nextId untuk penggunaan berikutnya

    fs.renameSync(file.path, `uploads/${id}_${file.originalname}`);

    const uploadedFile = {
      id: id,
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      destination: file.destination,
      filename: `${id}_${file.originalname}`,
      path: file.path,
      size: file.size,
    };

    res.status(200).json(uploadedFile);
  } catch (err) {
    next(err);
  }
});

// Mengonfigurasi Express untuk melayani file statis dari direktori 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Endpoint untuk mengambil semua foto
app.get("/photos", (req, res, next) => {
  try {
    fs.readdir("uploads", (err, files) => {
      if (err) {
        return next(err);
      }

      files.sort((a, b) => {
        return (
          fs.statSync(`uploads/${b}`).mtime.getTime() -
          fs.statSync(`uploads/${a}`).mtime.getTime()
        );
      });

      const photoData = files.map((file) => {
        const stats = fs.statSync(`uploads/${file}`);
        return {
          id: file.split("_")[0],
          // Menggunakan URL lengkap dari server untuk mengakses gambar
          filename: `http://localhost:3000/uploads/${file}`,
          size: stats.size,
          lastModified: stats.mtime,
        };
      });

      res.json({ photos: photoData });
    });
  } catch (err) {
    next(err);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
