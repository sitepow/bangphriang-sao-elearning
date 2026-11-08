const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category");

// mainCategory
router.get("/main", categoryController.getMaincategories);
router.get("/main/noPagi", categoryController.getMaincategoriesNoPagi);
router.get("/main/:id", categoryController.getMaincategory);
router.post("/main", categoryController.createMaincategory);
router.patch("/main/:id", categoryController.updateMaincategory);
router.delete("/main/:id", categoryController.deleteMaincategory);

// subCategory
router.get("/sub", categoryController.getSubcategories);
router.get("/sub/main/:id", categoryController.getSubcategoryByMaincategoryId);
router.get("/sub/:id", categoryController.getSubcategory);
router.post("/sub", categoryController.createSubcategory);
router.patch("/sub/:id", categoryController.updateSubcategory);
router.delete("/sub/:id", categoryController.deleteSubcategory);

module.exports = router;
