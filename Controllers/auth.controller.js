const UserModel = require("../Models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports.signUp = async (req, res) => {
  const { email, job, address, picture } = req.body;
  const PascalCaseName = () => {
    return req.body.name.replace(
      /\w\S*/g,
      (m) => m.charAt(0).toUpperCase() + m.substr(1).toLowerCase()
    );
  };
  let { password } = req.body;
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  const user = await UserModel.create({
    name: PascalCaseName(),
    email,
    password,
    job,
    address,
    picture,
  });
  const accessToken = jwt.sign(
    {
      UserInfo: {
        name: user.name,
        id: user._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );
  res.cookie("plusvaloo_jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 2628288 * 1000, //cookie expiry: set to match rT
  });

  // Send accessToken containing email and name
  res.json({ accessToken });
};

// @desc Login
// @route POST /auth
// @access Public
module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let foundUser = await UserModel.findOne({ email }).exec();

  if (!foundUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(406).json({ message: "Wrong password" });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        name: foundUser.name,
        id: foundUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: foundUser._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );

  // Create secure cookie with refresh token
  res.cookie("plusvaloo_jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 2628288 * 1000, //cookie expiry: set to match rT
  });

  // Send accessToken containing email and name
  res.json({ accessToken });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
module.exports.refreshToken = (req, res) => {
  if (!req.cookies?.plusvaloo_jwt)
    return res.status(403).json({ message: "Unauthorized ! No refresh token" });

  const refreshToken = req.cookies.plusvaloo_jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Forbidden ! Incorrect token" });

      const foundUser = await UserModel.findById(decoded.id).exec();

      if (!foundUser) return res.status(400).json({ message: "Unkwnown user" });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            name: foundUser.name,
            id: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    }
  );
};

module.exports.logout = (req, res) => {
  // res.cookie("plusvaloo_jwt", "", { maxAge: 1 });
  // res.status(200).json({ message: "Cookie removed" });
  const cookies = req.cookies;
  if (!cookies?.plusvaloo_jwt) return res.sendStatus(204); //No content
  res.clearCookie("plusvaloo_jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.json({ message: "Cookie cleared" });
};