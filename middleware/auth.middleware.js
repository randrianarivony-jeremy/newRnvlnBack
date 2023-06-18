const jwt = require("jsonwebtoken");
const UserModel = require("../Models/user.model");

module.exports.checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decodedToken) => {
        if (err) return res.status(401).send({ message: err.message });
        let user = await UserModel.findById(decodedToken.id).select(
          "-password"
        );
        res.status(200).json(user);
      }
    );
  } else {
    res.status(204).send(undefined);
  }
};

module.exports.verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Credential missing" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Incorrect cookie" });
    req.id = decoded.UserInfo.id;
    req.name = decoded.UserInfo.name;
    next();
  });
};