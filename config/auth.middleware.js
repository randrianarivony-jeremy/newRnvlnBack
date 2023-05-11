const jwt = require("jsonwebtoken");
const UserModel = require("../Models/user.model");

module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  try {
    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
        if (err) {
          res.locals.user = null;
          console.log('error');
          res.cookie("jwt", "", { maxAge: 1 });
          next();
        } else {
          let user = await UserModel.findById(decodedToken.id).select("-password");
          res.locals.user = user;
          next();
        }
      });
    } else {
      res.locals.user = null;
      // throw 'Token cookie missing';
      next();
    }
  } catch (error) {
    res.status(300).send(error);
  }
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err);
        res.json('token incorrect');
        console.log('token incorrect');
        res.locals.user=null
        next();
      } else {
        res.locals.id=decodedToken.id;
        console.log(res.locals.id);
        next();
      }
    });
  } else {
    console.log('No token');
    res.locals.user=null;
    next();
  }
};