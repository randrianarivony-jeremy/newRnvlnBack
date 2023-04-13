const UserModel = require("../Models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Creer un token valable pour 3jrs
const maxAge = 3 * 24 * 60 * 60 * 1000; //3jrs en millisecondes
const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

module.exports.signUp = async (req, res) => {
  const { name,email, password, job,address, picture } = req.body;
  try {
    const user = await UserModel.create({
      name,
      email,
      password,job,address,
      picture,
    });
    const token = createToken(user._id);
    // On le send password, on le met dans les cookies avec nom: jwt et comme value token
    res.cookie("jwt", token, { httpOnly: true, maxAge });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email }); //crypter na aloha ny password et comparer apres
  if (user) {
    const auth = await bcrypt.compare(password, user.password); //comparrer le name avec le base bcrypt
    if (auth) {
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge });
      res.status(200).json(user);
    } else {
      res.status(400).send("Mot de passe incorrect");
      // throw Error("incorrect password");
    }
  } else {
    console.log('email err');
    res.status(400).send("Email ou numero inconnu");
    // throw Error("incorrect email");
  }
};

module.exports.signInWithFacebook = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge });
    res.json(user);
  } catch (err) {
    const errors = signInErrors(err);
    res.status(200).json({ errors });
  }
};

module.exports.logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  // res.redirect("/"); //redirect
  res.status(200).send("cookie removed");
};
