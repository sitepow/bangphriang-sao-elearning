const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const imageStorage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedFileTypes.test(file.mimetype);
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(
    new Error(
      "Error: File upload only supports the following filetypes - " +
        allowedFileTypes
    )
  );
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 50 },
});

const resizeImageHandler =
  (dir, filenameGenerator) => async (req, res, next) => {
    if (!req.file) return next();

    ensureDirectoryExists(dir);
    const filename = filenameGenerator(req.file);

    try {
      await sharp(req.file.buffer)
        .resize(800)
        .toFormat("png")
        .toFile(path.join(dir, filename));

      req.file.path = filename;
      next();
    } catch (error) {
      next(error);
    }
  };

const generateUniqueFilename = (file) => {
  return Date.now() + path.extname(file.originalname);
};

const resizeLogo = resizeImageHandler("uploads/logo", () => "logo.png");
const resizeBanner = resizeImageHandler("uploads/logo", () => "banner.png");
const resizeMedia = resizeImageHandler("uploads/media", generateUniqueFilename);
const resizeImage = resizeImageHandler(
  "uploads/images",
  generateUniqueFilename
);

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/videos";
    ensureDirectoryExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file));
  },
});

const videoFileFilter = (req, file, cb) => {
  const allowedFileTypes = /mp4|mkv|avi|mov/;
  const mimetype = allowedFileTypes.test(file.mimetype);
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(
    new Error(
      "Error: File upload only supports the following filetypes - " +
        allowedFileTypes
    )
  );
};

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 1024 * 1024 * 50000 },
});

module.exports = {
  uploadImage,
  ensureDirectoryExists,
  resizeImage,
  uploadVideo,
  resizeBanner,
  resizeMedia,
  resizeLogo,
};
