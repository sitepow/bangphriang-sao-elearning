const express = require("express");
const router = express.Router();
const contentController = require("../controllers/content");
const { uploadVideo } = require("../middlewares/multerConfig");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;

    if (file.fieldname === "imagePathFile") {
      uploadPath = "uploads/images/";
    } else if (file.fieldname === "videoPathFile") {
      uploadPath = "uploads/videos/";
    } else {
      uploadPath = "uploads/";
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
const cpUpload = upload.fields([
  { name: "imagePathFile", maxCount: 1 },
  { name: "videoPathFile", maxCount: 1 },
]);

router.get("/", contentController.getContents);
router.get("/dropdown", contentController.getContentsDropdown);
router.get("/:id", contentController.getContent);
router.get("/main/:id", contentController.getContentsByMaincategory);
router.get("/relatedContent/:id", contentController.getRelatedContent);
router.get("/sub/:id", contentController.getContentsBySubcategory);
router.get("/all/getAll", contentController.getContentsAll);
router.post("/", cpUpload, contentController.createContent);
router.patch("/:id", cpUpload, contentController.updateContent);
router.delete("/:id", contentController.deleteContent);

// contentLog
router.get("/log/:id", contentController.getContentLogs);
router.get("/log/user/:id", contentController.getContentLogsByStatus);
router.get("/log/byContentId/:id", contentController.getContentLogsByContentId);
router.get("/log/byCourseId/:id", contentController.getContentLogsByCourseId);
router.post("/log", contentController.createContentLog);
router.post(
  "/log/autoSubscribe",
  contentController.createContentLogAutoSubscribe
);
router.patch("/log/:id", contentController.updateContentLog);
router.get(
  "/log/byUserId/:userId/byContentId/:contentId/byCourseId/:courseId/byCourseLogId/:courseLogId",
  contentController.getContentsByUserIdAndContentId
);

// contentVideo
router.get("/video", contentController.getContentVideos);
router.get("/video/order/:id", contentController.getOrderContentVideo);
router.get("/video/:id", contentController.getContentVideo);
router.post(
  "/video",
  uploadVideo.single("videoPathFile"),
  contentController.createContentVideo
);
router.patch("/video/order/:id", contentController.updateOrderContentVideo);
router.delete("/video/order/:id", contentController.deleteContentVideo);

// contentView
router.put("/view/increase/:id", contentController.increaseViewCount);

module.exports = router;
