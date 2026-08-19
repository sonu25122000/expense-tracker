const multer = require('multer');

function fileFilter(req, file, cb) {
  if (/^image\/(jpeg|png|jpg|webp|heic|heif)$/i.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for receipts'));
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
