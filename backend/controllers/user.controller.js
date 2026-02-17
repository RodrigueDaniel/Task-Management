import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

if(!process.env.JWT_SECRET){
  throw new Error("JWT_SECRET is not defined");
}

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be 6+ chars" });
    }

    const existing = await prisma.user.findUnique({
        where: { email }
    })

    if(existing) {
        return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
        select: { id: true, name: true, email: true },
    })

    res.status(201).json({
        message: "User registered successfully",
        user: { id: user.id, email: user.email}
    })
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if(!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if(!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    )

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES}
    )

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 60 * 1000,
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      message: "Login successful",
    })
  } catch (error) {
    next(error);
  }
}

export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if(!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    )

    const tokenIndb = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })

    if(!tokenIndb) {
      return res.status(401).json({ message: "Invalid refresh token"});
    }

    const newAccessToken = jwt.sign(
      { sub: decoded.sub },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    )

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 60 * 1000,
    })

    res.json({ message: "Access token refreshed" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" })
  }
}

export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if(refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({ message: "Logged out successfully" });
}