const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course");
const { uploadImage, resizeImage } = require("../middlewares/multerConfig");

router.get("/count/course", courseController.countCourse);
router.get("/", courseController.getCourses);
router.get("/:id", courseController.getCourse);
router.post(
  "/",
  uploadImage.single("imagePathFile"),
  resizeImage,
  courseController.createCourse
);
router.patch(
  "/:id",
  uploadImage.single("imagePathFile"),
  resizeImage,
  courseController.updateCourse
);
router.delete("/:id", courseController.deleteCourse);

// courseItem
router.get("/item/:id", courseController.getCourseItems);
router.post("/item", courseController.createCourseItem);
router.post("/item/delete", courseController.deleteCourseItem);
router.get("/item/byCourseId/:id", courseController.getCourseItemsByCourseId);

// courseLog
router.get("/log/dropdown", courseController.getCourseDropdown);
router.get("/log/report", courseController.getCourseLogsReport);
router.get("/log/certification", courseController.getCourseLogsCertification);
router.get("/log", courseController.getCourseLogs);
router.get("/log/byCourseId/:id", courseController.getCourseLogsByCourseId);
router.get("/log/byStatus/:id", courseController.getCourseLogsByStatus);
router.post("/log", courseController.createCourseLog);
router.patch(
  "/log/byCourseId/:courseId/byUserId/:userId",
  courseController.updateCourseLogByUserId
);
router.patch("/log/:id", courseController.updateCourseLog);
router.post("/log/checkContentComplete", courseController.checkContentComplete);

// contentView
router.put("/view/increase/:id", courseController.increaseViewCount);

module.exports = router;
