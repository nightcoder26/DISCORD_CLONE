const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");

const authController = {
  signup: async (req, res) => {
    try {
      const { username, displayName, email, password } = req.body;
      const id = Math.random().toString(36).substr(2, 9);

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        username,
        user_id: id,
        displayName,
        email,
        password: hashedPassword,
      });

      await user.save();

      res.status(201).json({ user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { something, password } = req.body;

      const user = await User.findOne({
        $or: [{ username: something }, { email: something }],
      });
      //are vai password ka kya hogya
      //hashing nice nice
      if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({ user });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = authController;
