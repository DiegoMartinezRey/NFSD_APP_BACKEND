const User = require("../models/User");
const Profile = require("../models/Profile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const user = await User.find();
      return res.json(user);
    } catch (error) {
      res.status(500).send("Not find any user");
    }
  },

  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findOne({ _id: userId });
      return res.json(user);
    } catch (error) {
      res.status(404).send("User not find");
    }
  },

  getUserByEmail: async (req, res) => {
    try {
      const userEmail = req.params.email;
      const user = await User.findOne({ email: userEmail }).populate(
        "_id",
        "name"
      );
      return res.json(user);
    } catch (error) {
      res.status(404).send("User not find");
    }
  },

  addUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ msg: "Invalid email or password" });
      }
      const encryptedPassword = await bcrypt.hash(password, saltRounds);
      const user = await User.create({
        email: email,
        password: encryptedPassword,
      });
      return res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).send("Failed to create user");
    }
  },
  deleteUser: async (req, res) => {
    console.log("user: ", req.params.id);
    try {
      const user = await User.findOneAndDelete(req.params.id);
      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(404).send("User cannot be deleted");
    }
  },

  updateUser: async (req, res) => {
    console.log("pasa por aca: ", req.body, "Id: ", req.params.id);
    try {
      const user = await User.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        req.body
      );
      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(404).send("User cannot be update");
    }
  },

  checkUser: async (req, res) => {
    const { email, password } = req.body;

    const [userFound] = await User.find({ email: email });

    if (!userFound) return res.status(401).json({ msg: "User not found" });

    if (await bcrypt.compare(password, userFound.password)) {
      const token = jwt.sign({ email: userFound.email }, process.env.SECRET, {
        expiresIn: 86400, // un dia
      });
      //Busca el profile para el user
      const profile = await Profile.findOne({ user: userFound._id });

      return res.status(200).json({
        msg: "Userlogged",
        token,
        userId: userFound._id,
        profileId: profile?._id,
        role: userFound.role,
      });
    }
    return res.status(404).json({ msg: "Password does not match" });
  },

  verifyToken: (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) res.status(400).json({ msg: "Missing token!!!!" });
    try {
      jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
          return res.status(401).send("token is invalid");
        }
        req.user = decoded;
        return next();
      });
    } catch (error) {
      return res.status(404).json({ msg: "Token not valid or expired" });
    }
  },

  checkEmailDuplicate: async (req, res) => {
    try {
      const { email } = req.query;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(200).json({ isDuplicate: true });
      }

      return res.status(200).json({ isDuplicate: false });
    } catch (error) {
      console.error("Error checking email duplicate:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = userController;
