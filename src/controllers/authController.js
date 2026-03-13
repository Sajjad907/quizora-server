const User = require("../models/User");
const { signAccessToken, signRefreshToken } = require("../utils/token");
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  secure: true, // Always true for cross-site cookies
  sameSite: "None", // Required for cross-site cookie sharing (admin -> server)
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: "fail", message: "User already exists" });
    }

    // 2. Create new user
    const newUser = await User.create({
      email,
      password,
    });

    // 3. Generate tokens
    const accessToken = signAccessToken(newUser._id);
    const refreshToken = signRefreshToken(newUser._id);

    // 4. Save refresh token
    newUser.refreshToken = refreshToken;
    await newUser.save({ validateBeforeSave: false });

    // 5. Set cookies
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      status: "success",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ status: "fail", message: "Please provide email and password" });
    }

    // 2. Find user and include password (since it's hidden by default)
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ status: "fail", message: "Incorrect email or password" });
    }

    // 3. Generate tokens
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // 4. Save refresh token to DB (optional but good for tracking/revocation)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 5. Set cookies
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 6. Send response
    res.status(200).json({
      status: "success",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.shopifyLogin = async (req, res) => {
  try {
    const { shop } = req.body;

    if (!shop) {
      return res.status(400).json({ status: "fail", message: "Shop domain is required" });
    }

    // Find user associated with this shop
    let user = await User.findOne({ shopifyShop: shop });

    if (!user) {
      // In a real production app, we might create the user here if they came from a verified Shopify request
      return res.status(401).json({ status: "fail", message: "No account found for this store" });
    }

    // Generate tokens
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.syncUser = async (req, res) => {
  try {
    const { shop, plan, status, updatedAt } = req.body;

    if (!shop) {
      return res.status(400).json({ status: "fail", message: "Shop domain is required" });
    }

    // Upsert user based on shopifyShop
    let user = await User.findOne({ shopifyShop: shop });

    if (!user) {
      // Create new merchant user
      user = await User.create({
        email: `${shop.split('.')[0]}@quizora.merchant`,
        password: Math.random().toString(36).slice(-12) + "!", // Secure placeholder
        shopifyShop: shop,
        role: "admin",
        plan: plan || "Free",
        subscriptionStatus: status || "ACTIVE",
        planUpdatedAt: updatedAt ? new Date(Number(updatedAt)) : new Date()
      });
    } else {
      // Update existing
      user.plan = plan || user.plan;
      user.subscriptionStatus = status || user.subscriptionStatus;
      user.planUpdatedAt = updatedAt ? new Date(Number(updatedAt)) : user.planUpdatedAt;
      await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({ status: "success", userId: user._id });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Clear refreshToken from user in DB
      await User.findOneAndUpdate({ refreshToken }, { $unset: { refreshToken: 1 } });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ status: "success", message: "Logged out" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ status: "fail", message: "No refresh token provided" });
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user still exists and has this refresh token
    const user = await User.findOne({ _id: decoded.id, refreshToken });

    if (!user) {
      return res.status(401).json({ status: "fail", message: "Invalid refresh token" });
    }

    // Sign new access token
    const newAccessToken = signAccessToken(user._id);

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ status: "success", message: "Token refreshed" });
  } catch (err) {
    res.status(401).json({ status: "fail", message: "Invalid refresh token" });
  }
};

exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            status: "success",
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ status: "fail", message: "User not found" });

        res.status(200).json({
            status: "success",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                employeeEmails: user.employeeEmails || [],
            }
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { employeeEmails } = req.body;

        // Validate: must be an array of strings
        if (!Array.isArray(employeeEmails)) {
            return res.status(400).json({ status: "fail", message: "employeeEmails must be an array" });
        }

        // Basic email validation & sanitize
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validEmails = employeeEmails
            .map(e => e.trim().toLowerCase())
            .filter(e => emailRegex.test(e));

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { employeeEmails: validEmails },
            { new: true, runValidators: false }
        );

        res.status(200).json({
            status: "success",
            message: "Profile updated successfully",
            employeeEmails: user.employeeEmails,
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

exports.checkStatus = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(200).json({ status: "success", authenticated: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(200).json({ status: "success", authenticated: false });
        }

        res.status(200).json({
            status: "success",
            authenticated: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        // Even on token verification failure, we return 200 but authenticated: false
        res.status(200).json({ status: "success", authenticated: false });
    }
};
