const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadReceiptBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'expense-tracker/receipts', resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

function deleteReceipt(publicId) {
  if (!publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId).catch(() => {});
}

module.exports = { uploadReceiptBuffer, deleteReceipt };
