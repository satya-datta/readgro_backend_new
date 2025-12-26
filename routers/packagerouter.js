// routes/packageRouter.js
const express = require("express");
const connection = require("../backend");
// const multer = require("multer");
require("dotenv").config();
const packageController = require("../controller/packagecontroller");
const validatePackage = require("../middlewares/validatePackage");
// const upload = require("../middlewares/upload"); // Multer upload instance
const Packagerouter = express.Router();
// const AWS = require("aws-sdk");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// Route to create package
Packagerouter.post(
  "/create-package",
  upload.single("packageImage"),
  validatePackage,
  packageController.createPackage
);
Packagerouter.get("/getallpackages", packageController.getAllPackages);

// Route for mapping courses to a package
Packagerouter.post("/course-mapping", packageController.mapCoursesToPackage);
Packagerouter.post(
  "/create-package_withcourses",
  upload.single("packageImage"),
  packageController.createPackageWithCourses
);

// Route to get packages with courses
// Define the route for fetching packages with courses
Packagerouter.get(
  "/getuserpackage/:userId",
  packageController.getPackageByUserId
);
Packagerouter.get(
  "/packages-with-courses",
  packageController.getPackagesWithCourses
);
Packagerouter.get(
  "/getcoursemappings/:package_id",
  packageController.getCourseMapping
);
Packagerouter.get(
  "/getpackage/:package_id",
  packageController.getPackageDetailsById
);
Packagerouter.get(
  "/getpackagebyname/:package_name",
  packageController.getPackageDetailsByName
);
// Route to fetch a single package by ID
// Packagerouter.get(
//   "/edit_package/:package_id",
//   packageController.getPackageById
// );
Packagerouter.post("/getcoursedetails", packageController.getCoursesByCourseIds);

// Route to update a package by ID
//Packagerouter.put("/edit_package/:package_id", packageController.updatePackageById);
// Update package with image
Packagerouter.put(
  "/edit_package/:package_id",
  upload.single("packageImage"),
  validatePackage,
  packageController.updatePackageById
);

// Route to delete a package and its related courses
Packagerouter.delete(
  "/delete-package/:package_id",
  packageController.deletePackageAndCourses
);

// // Route to update a package by ID (PUT method)
// Packagerouter.put("/edit_package/:package_id", upload.single('image'), packageController.updatePackageById);

// Route to delete selected courses from a package
Packagerouter.delete(
  "/remove_courses/:package_id",
  packageController.deleteCoursesFromPackage
);

// Route for adding courses to a package

Packagerouter.post("/add_courses", packageController.addCoursesToPackage);

// Route to get all available courses
Packagerouter.get("/courses", packageController.getAllCourses);

module.exports = Packagerouter;
