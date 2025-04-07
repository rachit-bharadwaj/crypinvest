import express from "express";
import {
  getUserDetails,
  getUserDetailsByWallet,
  createUserFromAdmin,
  uploadOrEditDocuments,
  verifyDocument,
  editProfile,
  getAllUsers,
  fetchNFTs,
} from "../controllers/user";

const router = express.Router();

// fetch all users
router.get("/", getAllUsers);

router.get("/nfts/:walletAddress", fetchNFTs);

// Route to fetch user details by user ID
router.get("/:id", getUserDetails);

// Route to fetch user details by wallet address
router.get("/wallet/:walletAddress", getUserDetailsByWallet);

// Route to create a new user from the admin panel
router.post("/admin/create", createUserFromAdmin);

// Route to upload or edit documents from the user dashboard
router.post("/:id/documents", uploadOrEditDocuments);

// Route to verify documents from the admin panel
router.patch("/:id/documents/verify", verifyDocument);

// Route to edit user profile
router.patch("/:id", editProfile);

export default router;
