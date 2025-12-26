const connection = require("../backend");
const { uploadBufferToCloudinary } = require("./cloudinaryupload");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../emailService"); // Import email service
const nodemailer = require("nodemailer");
const saltRounds = 10; // Salt rounds for bcrypt

const JWT_SECRET = "USER AUTHENTICATION";
// Set up file storage for avatar images using multer
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const AWS = require("aws-sdk");
// Configure AWS
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION, // e.g. 'us-east-1'
// });

// // Create S3 instance
// const s3 = new AWS.S3();

// // Configure multer-S3
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.S3_BUCKET_NAME,
//     // acl: "public-read", // optional: allows public access to the uploaded image
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: function (req, file, cb) {
//       const ext = path.extname(file.originalname);
//       const filename = `${Date.now()}${ext}`;
//       cb(null, filename);
//     },
//   }),
// });

// Function to calculate referral commission

// Store file in memory (not disk)
const storage = multer.memoryStorage();

// Export the configured upload middleware
const upload = multer({ storage });
const returnCommissionMethod = (userCourseId, referrerCourseId, callback) => {
  const courseQuery = `
    SELECT course_id, course_price, commission FROM course WHERE course_id IN (?, ?)
  `;
  connection.query(
    courseQuery,
    [userCourseId, referrerCourseId],
    (err, results) => {
      if (err) {
        console.error("Error fetching course details:", err);
        return callback(err, null);
      }

      if (results.length < 1) {
        console.error("One or both courses not found.");
        return callback(new Error("One or both courses not found."), null);
      }

      // Initialize variables to store commissions
      let userCommission = null;
      let referrerCommission = null;

      // Calculate commissions directly
      results.forEach((course) => {
        const commission = course.commission;
        console.log(userCourseId, "-", referrerCourseId);

        if (course.course_id == userCourseId) {
          userCommission = commission;
          console.log(course.course_price);
          console.log(userCommission);
        } else if (course.course_id == referrerCourseId) {
          referrerCommission = commission;
          console.log(course.course_price);
          console.log(referrerCommission);
        }

        if (
          referrerCourseId == course.course_id &&
          course.course_id == userCourseId
        ) {
          userCommission = commission;
          referrerCommission = commission;
        }
      });

      if (userCommission === null || referrerCommission === null) {
        console.error("Error mapping course IDs to commissions.");
        return callback(
          new Error("Error mapping course IDs to commissions."),
          null
        );
      }

      console.log(userCommission, "-", referrerCommission);

      // Return the lower commission
      return callback(null, Math.min(userCommission, referrerCommission));
    }
  );
};

// Function to generate referral code
function generateReferralCode() {
  const prefix = "RDGW";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return prefix + randomPart;
}

// Function to ensure the generated referral code is unique
function getUniqueReferralCode(callback) {
  const newReferralCode = generateReferralCode();
  const checkQuery = `SELECT * FROM "user" WHERE "GeneratedReferralCode" = $1`;
  connection.query(checkQuery, [newReferralCode], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    if (result.rows.length > 0) {
      return getUniqueReferralCode(callback); // Generate a new one recursively
    } else {
      return callback(null, newReferralCode);
    }
  });
}

exports.createUser = (req, res, next) => {
  upload.single("avatar")(req, res, async (err) => {
    if (err) {
      return res.json({ message: "Error uploading avatar image", error: err });
    }

    const {
      name: Name, // Renamed to match instruction's variable
      course_id,
      email: Email, // Renamed to match instruction's variable
      phone: Phone, // Renamed to match instruction's variable
      gender,
      Address,
      Pincode,
      referrerId, // This is not used in the new logic, `refferCode` is used
      referralCode: refferCode, // Renamed to match instruction's variable
      password,
    } = req.body;
    const avatar = req.file ? req.file.location : null; // Original code used req.file.location, but multer.memoryStorage() doesn't have it. This needs to be adjusted if Cloudinary upload is intended here. Assuming it's handled later if `avatarUrl` is set.

    if (!Name || !course_id || !Email || !Phone || !Address || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      // 1. Validate if user already exists
      const checkUserQuery = "SELECT * FROM \"user\" WHERE Email = $1"; // Assuming table name is case-sensitive or properly quoted
      const userCheckResult = await new Promise((resolve, reject) => {
        connection.query(checkUserQuery, [Email], (err, res) => { // Use res to avoid conflict with outer res
          if (err) reject(err);
          else resolve(res);
        });
      });

      if (userCheckResult.rows.length > 0) { // Use result.rows
        return res.status(409).json({ message: "User already exists" });
      }

      // 2. Encrypt Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Generate Referral Code
      const generatedReferralCode = generateReferralCode(8); // Changed to 8 as per instruction

      // 4. Handle Referrer Logic
      let referrerUserId = null;
      if (refferCode) {
        try {
          const referrerQuery =
            "SELECT userid FROM \"user\" WHERE generatedreferralcode = $1";
          const referrerResult = await new Promise((resolve, reject) => {
            connection.query(referrerQuery, [refferCode], (err, res) => { // Use res to avoid conflict
              if (err) reject(err);
              else resolve(res);
            });
          });

          if (referrerResult.rows.length > 0) { // Use rows
            referrerUserId = referrerResult.rows[0].userid; // Use rows
          } else {
            return res.status(400).json({ message: "Invalid Referral Code" });
          }
        } catch (error) {
          console.error("Error validating referral code:", error);
          return res
            .status(500)
            .json({ message: "Error validating referral code" });
        }
      }

      // 5. Insert New User
      const insertUserQuery = `
        INSERT INTO "user" (Name, Email, Phone, Address, Pincode, password, courseid, generatedreferralcode, reffercode, referrerid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING userid
      `; // Added RETURNING UserId

      connection.query(
        insertUserQuery,
        [
          Name,
          Email,
          Phone,
          Address,
          Pincode,
          hashedPassword,
          course_id || null, // Ensure null if undefined
          generatedReferralCode,
          refferCode || null,
          referrerUserId, // Use referrerUserId
        ],
        async (err, result) => { // result
          if (err) {
            console.error("Error creating user:", err);
            return res.status(500).json({ message: "Database Error" });
          }

          const newUserId = result.rows[0].userid; // Use rows[0].userid from RETURNING

          // 6. Create Wallet for New User
          const createWalletQuery =
            "INSERT INTO wallet (user_id, balance, last_updated) VALUES ($1, 0.00, NOW())";
          connection.query(createWalletQuery, [newUserId], (err) => {
            if (err) console.error("Error creating wallet:", err);
          });

          const token = jwt.sign(
            { userId: newUserId, email: Email, name: Name, course_id, password },
            JWT_SECRET,
            { expiresIn: "5h" }
          );

          res.cookie("UserauthToken", token, {
            httpOnly: true,
            sameSite: "None", // Required for cross-origin cookies
            maxAge: 2 * 60 * 60 * 1000, // 2 hours
            secure: true, // Required for HTTPS
          });

          // ✅ Send email after successful signup
          const signupEmailContent = `
            <div style="max-width:600px;margin:20px auto;padding:20px;border-radius:10px;background:linear-gradient(135deg,#d4fc79,#96e6a1);font-family:sans-serif;color:#333;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
              <img src="https://res.cloudinary.com/djset9wsw/image/upload/v1748972406/RGFULL_dbbwmo.png" alt="ReadGro Logo" style="width:150px;margin-bottom:20px;">
              <h2 style="font-size:28px;">Welcome to Our Platform, ${Name}!</h2>
              <p style="font-size:18px;">You have successfully signed up.<br>Your account is now active.</p>
              <hr style="margin:20px 0;border:none;border-top:1px solid rgba(255,255,255,0.3);">
              <p style="font-size:16px;">Enjoy our services.<br>We’re excited to have you on board!</p>
              <p style="margin-top:30px;font-size:14px;color:#555;">— The ReadGro Team</p>
            </div>
          `;

          sendEmail(
            Email,
            "You are successfully signed up!",
            signupEmailContent
          );

          if (referrerUserId) { // Check if a referrer was found
            if (course_id) {
              const courseQuery = "SELECT commission FROM course WHERE course_id = $1";
              connection.query(courseQuery, [course_id], async (err, courseResult) => { // courseResult
                if (!err && courseResult.rows.length > 0) { // rows
                  const commission = courseResult.rows[0].commission || 0;

                  // Get Wallet of Referrer
                  const walletQuery = "SELECT wallet_id, balance FROM wallet WHERE user_id = $1";
                  connection.query(walletQuery, [referrerUserId], (err, walletResult) => {
                    if (!err && walletResult.rows.length > 0) {
                      const walletId = walletResult.rows[0].wallet_id;
                      const currentBalance = parseFloat(walletResult.rows[0].balance);
                      const newBalance = currentBalance + parseFloat(commission);

                      // Update Wallet Balance
                      const updateWalletQuery =
                        "UPDATE wallet SET balance = $1, last_updated = NOW() WHERE wallet_id = $2";
                      connection.query(updateWalletQuery, [newBalance, walletId], (err) => {
                        if (err) console.error("Error updating wallet:", err);
                      });

                      // Log Commission Transaction
                      const transactionQuery = `
                        INSERT INTO wallettransactions (wallet_id, amount, transaction_type, description, created_at, user_id, reffer_id)
                        VALUES ($1, $2, 'credit', $3, NOW(), $4, $5)
                      `;
                      connection.query(
                        transactionQuery,
                        [
                          walletId,
                          commission,
                          `Referral commission for user ${newUserId}`,
                          referrerUserId,
                          newUserId,
                        ],
                        (err) => {
                          if (err) console.error("Error logging transaction:", err);
                        }
                      );
                    }
                  });
                }
              });
            }
            res.status(201).json({
              message: "User and wallet created successfully with referral bonus",
              userId: newUserId,
              success: true,
            });
          } else {
            res.status(201).json({
              success: true,
              message: "User and wallet created successfully",
              userId: newUserId,
            });
          }
        }
      );
    } catch (hashError) {
      res.json({ message: "Error securing password", error: hashError });
    }
  });
};

exports.loginUser = (req, res) => {
  const { email: Email, password } = req.body; // Renamed to match instruction's variable

  if (!Email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Check user existence
  const sql = "SELECT userid, Name, Email, password, courseid, Avatar FROM \"user\" WHERE Email = $1";
  connection.query(sql, [Email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.rows.length === 0) return res.status(401).json({ error: "User not found" });

    const user = result.rows[0];

    // Password validation
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userid,
        email: user.email,
        name: user.name,
        course_id: user.courseid,
        password: password,
        avatar: user.avatar,
      },
      JWT_SECRET,
      {
        expiresIn: "5h",
      }
    );

    // Set token as an HTTP-only cookie
    // Set token as an HTTP-only cookie
    res.cookie("UserauthToken", token, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      secure: false, // Set to true in production
    });

    // Send response with user_id and user name
    res.status(200).json({
      success: true,
      message: "Login successful",
      user_id: user.userid,
      user_name: user.name,
    });
  });
};
exports.validatePassword = (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res
      .status(400)
      .json({ message: "User ID and password are required" });
  }

  const query = `SELECT password FROM "user" WHERE userid = $1`;

  connection.query(query, [user_id], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = results.rows[0].password;

    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Old Password incorrect" });
      }

      res.status(200).json({ success: true, message: "Password is valid" });
    } catch (error) {
      res.status(500).json({ message: "Error validating password", error });
    }
  });
};
exports.validateUserCookie = (req, res) => {
  let token = req.cookies.UserauthToken; // Check if token is in cookies
  if (!token) {
    // If no token in cookies, check the Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]; // Extract token after "Bearer "
    }
  }
  console.log("Received token:", token);

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    console.log(decoded);
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    // If token verification is successful
    console.log("Token verified successfully:", decoded);
    return res.status(200).json({
      message: "Token verified successfully",
      user: decoded, // { userId, email }
    });
  });
};

exports.logoutUser = (req, res) => {
  // Clear the UserauthToken cookie
  res.clearCookie("UserauthToken", {
    httpOnly: true,
    secure: true, // Secure in production
    sameSite: "None",
  });

  res.status(200).json({ message: "Logout successful" });
};

exports.getUserById = (req, res) => {
  const userId = req.params.user_id; // Assume user ID is provided as a URL parameter

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  // Query to get user by ID
  const query = "SELECT * FROM \"user\" WHERE \"userid\" = $1";

  connection.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching user details:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  });
};
exports.getUserByEmail = (req, res) => {
  const email = req.params.email; // Get email from URL parameter

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Query to get user by Email
  const query = "SELECT * FROM \"user\" WHERE Email = $1";

  connection.query(query, [email], (err, result) => {
    if (err) {
      console.error("Error fetching user details:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    res.status(200).json({
      userId: user.userid,
      name: user.Name,
      // packageId: user.PackageId, // Was mapped to courseid in previous discussions??
      // Let's check schema again. `courseid` in `user`. `user` schema has `courseid` (int). 
      // The user requested `packageId`. If they mean the assigned course/package, it is `courseid`.
      // wait, `user` table DDL: `courseid` INTEGER. 
      // User request asks for `packageId`. I should map `courseid` to `packageId` to satisfy their naming, 
      // or clarify. Given the rename in refactoring earlier, let's look at `user` table again. 
      // Actually earlier I saw `courseid INTEGER`.
      packageId: user.courseid, // Mapping courseid to packageId as per typical usage in this app
      email: user.Email,
      phone: user.Phone,
      avatar: user.Avatar,
      Address: user.Address,
      Pincode: user.Pincode,
      generatedReferralCode: user.GeneratedReferralCode,
      referrerId: user.ReferrerId,
      referralCode: user.refferCode, // "refferCode" in table
    });
  });
};
exports.getSponsorDetailsByReferralCode = (req, res) => {
  const referrCode = req.params.reffercode;

  if (!referrCode) {
    return res.status(400).json({ message: "Referral code is required" });
  }

  // Find the user who OWNS this referral code (the sponsor)
  const getSponsorQuery = `
    SELECT Name AS SponsorName, Email AS SponsorEmail, Phone AS SponsorPhone
    FROM "user"
    WHERE generatedreferralcode = $1
  `;

  connection.query(getSponsorQuery, [referrCode], (err, result) => {
    if (err) {
      console.error("Error fetching sponsor details:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    res.status(200).json(result.rows[0]);
  });
};

exports.getUsersList = (req, res) => {
  // Query to fetch the required user details along with the wallet amount
  const usersQuery = `
    SELECT 
      u.userid AS userId,
      u.Name AS Name,
      u."GeneratedReferralCode" AS GeneratedReferralCode,
      w.balance AS balance
    FROM "user" u
    LEFT JOIN wallet w ON u.userid = w.user_id
  `;

  connection.query(usersQuery, (err, results) => {
    if (err) {
      console.error("Error fetching users list:", err);
      return res
        .status(500)
        .json({ message: "Error fetching users list", error: err });
    }

    if (results.rows.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      message: "Users list retrieved successfully",
      users: results.rows.map((user) => ({
        userId: user.userId,
        userName: user.Name, // Changed from user.userName to user.Name
        generatedReferralCode: user.GeneratedReferralCode,
        walletAmount: user.balance || 0, // Default to 0 if no wallet record exists
      })),
    });
  });
};

exports.updateUser = (req, res, next) => {
  // Handle avatar upload
  upload.single("avatar")(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error uploading avatar image", error: err });
    }

    const userId = req.params.user_id; // Extract user ID from route params
    const {
      name,
      course_id,
      email,
      phone,
      gender,
      Address,
      Pincode,
      generatedReferralCode,
      referrerId,
      referralCode,
    } = req.body;

    let avatarUrl = null;

    if (req.file) { // Check req.file instead of `avatar` variable
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, "avatars"); // Use req.file.buffer for memory storage
        avatarUrl = result.secure_url;
      } catch (err) {
        return res.status(500).json({
          message: "Failed to upload avatar to Cloudinary",
          error: err,
        });
      }
    }

    // Loose validation - only userId is strictly required as we allow partial updates
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Prepare query and data for updating user details
    // using COALESCE to keep existing values if new values are not provided
    const updateUserQuery = `
      UPDATE "user"
      SET 
        Name = COALESCE($1, Name), 
        courseid = COALESCE($2, courseid), 
        Email = COALESCE($3, Email), 
        Phone = COALESCE($4, Phone), 
        Avatar = COALESCE($5, Avatar), 
        Address = COALESCE($6, Address), 
        Pincode = COALESCE($7, Pincode), 
        generatedreferralcode = COALESCE($8, generatedreferralcode), 
        referrerid = COALESCE($9, referrerid), 
        reffercode = COALESCE($10, reffercode)
      WHERE userid = $11
    `;

    // Map incoming lowercase fields (address, pincode) to what logic expects (Address, Pincode) if needed
    // The previous code destructured Address/Pincode, but client sends address/pincode (lowercase).
    // Let's assume req.body keys might be lowercase from frontend code shown: `address`, `pincode`.
    // But destructured vars were `Address`, `Pincode`.
    // So let's handle case insensitivity or mapping.
    const finalAddress = Address || req.body.address || null;
    const finalPincode = Pincode || req.body.pincode || null;

    const updateUserValues = [
      name || null,
      course_id || null,
      email || null,
      phone || null,
      avatarUrl || null,
      finalAddress,
      finalPincode,
      generatedReferralCode || null,
      referrerId || null,
      referralCode || null,
      userId,
    ];

    // Execute the update query
    connection.query(updateUserQuery, updateUserValues, (err, result) => {
      if (err) {
        console.error("Error updating user details:", err);
        return res
          .status(500)
          .json({ message: "Error updating user details", error: err });
      }

      if (result.rowCount === 0) { // Changed to rowCount for PostgreSQL
        return res.status(404).json({ message: "User not found" });
      }

      // Handle referral code logic if provided
      if (referralCode) {
        const referrerQuery = `
          SELECT userid, "CourseId" FROM "user" WHERE "GeneratedReferralCode" = $1
        `;

        connection.query(
          referrerQuery,
          [referralCode],
          (err, referrerResult) => {
            if (err) {
              console.error("Error finding referrer:", err);
              return res.status(500).json({
                message: "Error processing referral code",
                error: err,
              });
            }

            if (referrerResult.rows.length > 0) { // Changed to rows.length
              const referrerId = referrerResult.rows[0].userid; // Changed to rows[0]
              const referrerCourseId = referrerResult.rows[0].CourseId; // Changed to rows[0]
              console.log(
                "Referrer Found:",
                referrerId,
                "-",
                referrerCourseId
              );

              returnCommissionMethod(
                course_id, // Changed from package_id to course_id
                referrerCourseId,
                (err, referralCommission) => {
                  if (err) {
                    return res.status(500).json({
                      message: "Error calculating referral commission",
                      error: err,
                    });
                  }
                  console.log("Referral Commission:", referralCommission);

                  // Update referrer's wallet
                  const updateWalletQuery = `
                UPDATE wallet SET balance = balance + $1 WHERE user_id = $2
              `;
                  connection.query(
                    updateWalletQuery,
                    [referralCommission, referrerId],
                    (err) => {
                      if (err) {
                        console.error("Error updating referrer wallet:", err);
                        return res.status(500).json({
                          message: "Error updating referrer wallet",
                          error: err,
                        });
                      }

                      // Record wallet transaction
                      const transactionQuery = `
                  INSERT INTO wallettransactions (user_id, wallet_id, amount, transaction_type, description)
                  VALUES ($1, (SELECT wallet_id FROM wallet WHERE user_id = $2), $3, $4, $5)
                `;
                      const transactionValues = [
                        referrerId,
                        referrerId,
                        referralCommission,
                        "credit",
                        `Referral commission for user ${userId}`,
                      ];

                      connection.query(
                        transactionQuery,
                        transactionValues,
                        (err) => {
                          if (err) {
                            console.error(
                              "Error recording wallet transaction:",
                              err
                            );
                            return res.status(500).json({
                              message: "Error recording wallet transaction",
                              error: err,
                            });
                          }

                          return res.status(200).json({
                            message:
                              "User details updated successfully with referral bonus applied",
                          });
                        }
                      );
                    }
                  );
                }
              );
            } else {
              return res.status(200).json({
                message:
                  "User details updated successfully (no referrer found)",
              });
            }
          }
        );
      } else {
        res.status(200).json({ message: "User details updated successfully" });
      }
    });
  });
};
exports.validateReferralCode = async (req, res) => {
  const { referralCode } = req.body;

  try {
    const query = `SELECT "GeneratedReferralCode" FROM "user" WHERE "GeneratedReferralCode" = $1`;
    connection.query(query, [referralCode], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ valid: false, message: "Server error" });
      }

      if (results.rows.length > 0) { // Changed to rows.length
        return res.json({ valid: true });
      } else {
        return res.json({ valid: false, message: "Invalid referral code" });
      }
    });
  } catch (error) {
    console.error("Error validating referral code:", error);
    res.status(500).json({ valid: false, message: "Internal server error" });
  }
};

exports.validateUser = async (req, res) => {
  const { email, phone } = req.body;

  try {
    const query = `SELECT Email, Phone FROM "user" WHERE Email = $1 OR Phone = $2`;
    connection.query(query, [email, phone], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ verified: false, message: "Server error" });
      }

      if (results.rows.length > 0) { // Changed to rows.length
        let message = "";
        const existingUser = results.rows[0]; // Changed to rows[0]

        if (existingUser.Email === email && existingUser.Phone === phone) {
          message = "Email and phone number already registered.";
        } else if (existingUser.Email === email) {
          message = "Email already registered.";
        } else if (existingUser.Phone === phone) {
          message = "Phone number already registered.";
        }

        return res.json({ verified: false, message });
      }

      return res.json({ verified: true });
    });
  } catch (error) {
    console.error("Error validating user:", error);
    res.status(500).json({ verified: false, message: "Internal server error" });
  }
};
exports.upgradeUserCourse = (req, res) => {
  const { userId: UserId, course_id: newcourseid } = req.body; // Renamed to match instruction's variables

  if (!UserId || !newcourseid) {
    return res
      .status(400)
      .json({ message: "User ID and new course ID are required" });
  }

  // 2. Fetch User Details to get existing courses in the package
  const userQuery = "SELECT \"CourseId\" FROM \"user\" WHERE \"userid\" = $1";
  connection.query(userQuery, [UserId], (err, userResult) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldCourseId = userResult.rows[0].CourseId;
    if (oldCourseId === newcourseid) {
      return res.status(400).json({ message: "User already has this course/package" });
    }

    // 3. Update User's Package/Course
    const updateQuery = "UPDATE \"user\" SET \"CourseId\" = $1 WHERE \"userid\" = $2";
    connection.query(updateQuery, [newcourseid, UserId], (err, updateResult) => {
      if (err) {
        console.error("Error updating user course:", err);
        return res.status(500).json({ message: "Failed to upgrade course" });
      }

      // 4. Fetch Referrer ID
      const referrerQuery = "SELECT \"ReferrerId\" FROM \"user\" WHERE \"userid\" = $1";
      connection.query(referrerQuery, [UserId], (err, referrerResult) => {
        if (err || referrerResult.rows.length === 0) {
          console.error("Referrer not found or error:", err);
          return res.status(200).json({ message: "Course upgraded, no referrer found" });
        }

        const referrerId = referrerResult.rows[0].ReferrerId;
        if (!referrerId) {
          return res.status(200).json({ message: "Course upgraded, no referrer to commission" });
        }

        // 5. Calculate Upgrade Commission (Old Package Price - New Package Price) -> Logic seems to imply just commission of new course? 
        // Logic in original code:
        //  conn.query("SELECT * FROM course WHERE course_id = ?", [newcourseid], ...) -> commission
        //  conn.query("SELECT * FROM course WHERE course_id = ?", [oldCourseId], ...) -> old commission?
        //  diff = newCommission - oldCommission?
        // Let's replicate original logic structure but fixed.

        const courseQuery = "SELECT commission FROM course WHERE course_id = $1";
        connection.query(courseQuery, [newcourseid], (err, newCourseRes) => {
          if (err || newCourseRes.rows.length === 0) return res.status(500).json({ message: "New course not found" });
          const newCommission = newCourseRes.rows[0].commission;

          connection.query(courseQuery, [oldCourseId], (err, oldCourseRes) => {
            const oldCommission = (oldCourseRes.rows.length > 0) ? oldCourseRes.rows[0].commission : 0;
            const commissionDiff = newCommission - oldCommission;

            if (commissionDiff <= 0) {
              return res.status(200).json({ message: "Course upgraded, no commission needed" });
            }

            // 6. Update Referrer Wallet
            const walletQuery = "SELECT wallet_id, balance FROM wallet WHERE user_id = $1";
            connection.query(walletQuery, [referrerId], (err, walletRes) => {
              if (err || walletRes.rows.length === 0) return; // Silent fail on wallet update if no wallet

              const walletId = walletRes.rows[0].wallet_id;
              const newBalance = parseFloat(walletRes.rows[0].balance) + parseFloat(commissionDiff);

              const updateWallet = "UPDATE wallet SET balance = $1, last_updated = NOW() WHERE wallet_id = $2";
              connection.query(updateWallet, [newBalance, walletId], (err) => { });

              // 7. Log Transaction
              const transQuery = "INSERT INTO wallettransactions (wallet_id, amount, transaction_type, description, created_at, user_id, reffer_id) VALUES ($1, $2, 'credit', $3, NOW(), $4, $5)";
              connection.query(transQuery, [walletId, commissionDiff, "Upgrade Commission", referrerId, UserId], (err) => { });
            });
            res.status(200).json({ message: "Course upgraded and commission distributed" });
          });
        });
      });
    });
  });
};

exports.updatePassword = async (req, res) => {
  const { user_id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "New password is required" });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in the database
    // Only update password, no OTP check here?
    const updateQuery = "UPDATE \"user\" SET password = $1 WHERE \"userid\" = $2";

    connection.query(updateQuery, [hashedPassword, user_id], (err, result) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ message: "Database Error" });
      }

      if (result.rowCount === 0) { // Changed to rowCount for PostgreSQL
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "Password updated successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "Error securing password", error });
  }
};

// const Use = process.env.ADMIN_EMAIL;

// 📌 Nodemailer Setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // or 587
  secure: true, // true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail ID
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Bypass certificate validation (NOT recommended for production)
  },
});

console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
// 📌 Simulated Database for OTPs
const otpStore = {};

// 📌 Step 1: Send OTP to Admin's Email
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  otpStore[email] = otp;

  console.log("OTP sent:", otp);
  console.log("Email:", email);

  try {
    await transporter.sendMail({
      from: `User Otp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Login Into READGRO",
      html: `<p>Your OTP for processing credentials: <strong>${otp}</strong></p>`,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "OTP email failed", error });
  }
};


exports.VerifyOtp = (req, res) => {
  const { email, otp } = req.body;

  // Check if OTP exists for the provided email
  if (!otpStore[email]) {
    return res
      .status(400)
      .json({ success: false, message: "OTP not found. Request a new OTP." });
  }

  // Verify OTP
  if (otp !== otpStore[email]) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  // Remove OTP after successful verification
  delete otpStore[email];

  // Fetch user details from the database
  const userQuery = `SELECT userid, Name, Email, "CourseId" FROM "user" WHERE Email = $1`;

  connection.query(userQuery, [email], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Database error", error: err });
    }

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userid,
        email: user.Email,
        name: user.Name,
        course_id: user.CourseId,
      },
      JWT_SECRET,
      { expiresIn: "5h" }
    );

    // Set token as an HTTP-only cookie
    // Set token as an HTTP-only cookie
    res.cookie("UserauthToken", token, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      secure: false, // Set to true in production
    });

    // Send response with user_id, name, and token
    res.status(200).json({
      success: true,
      message: "OTP verified successfully. User authenticated.",
      token,
      user_id: user.userid,
      user_name: user.Name,
    });
  });
};

exports.sendContactDetails = async (req, res) => {
  try {
    const { name, email, serviceType, phone, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Name, email, and message are required." });
    }

    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Service Type:</strong> ${serviceType || "N/A"}</p>
      <p><strong>Phone:</strong> ${phone || "N/A"}</p>
      <p><strong>Message:</strong> ${message}</p>
    `;

    await sendEmail(
      "readgroofficial@gmail.com",
      "New Contact Form Submission",
      emailContent
    );

    res.status(200).json({ message: "Contact details sent successfully." });
  } catch (error) {
    console.error("Error sending contact details:", error);
    res.status(500).json({ error: "Failed to send contact details." });
  }
};
