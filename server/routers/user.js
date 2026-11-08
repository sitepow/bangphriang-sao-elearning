const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const {
  uploadImage,
  resizeImage,
  resizeMedia,
  resizeLogo,
  resizeBanner,
} = require("../middlewares/multerConfig");

router.get("/", userController.getUsers);
router.get("/:id", userController.getUser);
router.post(
  "/",
  uploadImage.single("imagePathFile"),
  resizeImage,
  userController.createUser
);
router.get("/getContentSummary/:userId", userController.getContentSummary);
router.patch(
  "/:id",
  uploadImage.single("imagePathFile"),
  resizeImage,
  userController.updateUser
);
router.delete("/:id", userController.deleteUser);

// dashboard
router.get("/sum/dashboard", userController.getDashboard);
router.get("/sum/score/:id", userController.getScore);

// image
router.get("/upload/image", userController.getImages);
router.post(
  "/upload/image",
  uploadImage.single("imageMediaPathFile"),
  resizeMedia,
  userController.uploadImage
);
router.post(
  "/upload/logo",
  uploadImage.single("imagePathFile"),
  resizeLogo,
  userController.uploadImage
);
router.post(
  "/upload/banner",
  uploadImage.single("imagePathFile"),
  resizeBanner,
  userController.uploadImage
);
router.delete("/upload/image/:filename", userController.deleteImage);

//checkout
router.post("/checkout/course", userController.checkoutCourse);

module.exports = router;
