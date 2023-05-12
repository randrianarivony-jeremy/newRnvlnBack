const jwt = require("jsonwebtoken");
const UserModel = require("../Models/user.model");

module.exports.checkUser = async(req, res, next) => {
  const token = req.cookies.jwt;
  try {
    if (token) {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
      let user = await UserModel.findById(decodedToken.id).select("-password");
      res.locals.user = user;
      next();
    } else {
      throw "Token cookie missing";
    }
  } catch (error) {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(401).send(error);
    console.log(error);
  }
};
