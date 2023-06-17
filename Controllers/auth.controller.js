const UserModel = require("../Models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Creer un token valable pour 3jrs
const maxAge = 3 * 24 * 60 * 60 * 1000; //3jrs en millisecondes
const createToken = (id,email,name) => {
  return jwt.sign({ id,email,name }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

module.exports.signUp = async (req, res) => {
  const { email, job, address, picture } = req.body;
  const PascalCaseName = () =>{
    return req.body.name.replace(/\w\S*/g,m=>m.charAt(0).toUpperCase()+m.substr(1).toLowerCase());
  }
  let { password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const user = await UserModel.create({
      name:PascalCaseName(),
      email,
      password,
      job,
      address,
      picture,
    });
    const token = createToken(user._id,user.email,user.name);
    // On le send password, on le met dans les cookies avec nom: jwt et comme value token
    res.cookie("jwt", token, { httpOnly: true, maxAge,secure:true,sameSite:'none' });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

// module.exports.signIn = async (req, res) => {
//   const { email, password } = req.body;
//   const user = await UserModel.findOne({ email }); //crypter na aloha ny password et comparer apres
//   if (user) {
//     const auth = await bcrypt.compare(password, user.password); //comparrer le name avec le base bcrypt
//     if (auth) {
//       const token = createToken(user._id,user.email,user.name);
//       res.cookie("jwt", token, { httpOnly: true, maxAge, secure: true,sameSite:'none' });
//       const result = await UserModel.findOne({ email }).select("-password");
//       res.status(200).json(result);
//     } else {
//       res.status(400).send("Mot de passe incorrect");
//       console.log("Mot de passe incorrect");
//     }
//   } else {
//     console.log("email err");
//     res.status(400).send("Email ou numero inconnu");
//     // throw Error("incorrect email");
//   }
// };

// @desc Login
// @route POST /auth
// @access Public
module.exports.signIn =async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
  }

  const foundUser = await UserModel.findOne({ email }).exec()

  if (!foundUser) {
      return res.status(401).json({ message: 'Unauthorized' })
  }

  const match = await bcrypt.compare(password, foundUser.password)

  if (!match) return res.status(401).json({ message: 'Unauthorized' })

  const accessToken = jwt.sign(
      {
          "UserInfo": {
              "email": foundUser.email,
              "id": foundUser._id
          }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '10s' }
  )

  const refreshToken = jwt.sign(
      { "id": foundUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '20s' }
  )

  // Create secure cookie with refresh token 
  res.cookie('jwt', refreshToken, {
      httpOnly: true, //accessible only by web server 
      secure: true, //https
      sameSite: 'None', //cross-site cookie 
      maxAge: 20 * 1000 //cookie expiry: set to match rT
  })

  // Send accessToken containing email and name 
  res.json({ accessToken })
}

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
module.exports.refreshToken = (req, res) => {
  if (!req.cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

  const refreshToken = req.cookies.jwt

  jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
          if (err) return res.status(403).json({ message: 'Incorrect token' })

          const foundUser = await UserModel.findById(decoded.id).exec()

          if (!foundUser) return res.status(401).json({ message: 'Unkwnown user' })

          const accessToken = jwt.sign(
              {
                  "UserInfo": {
                      "email": foundUser.email,
                      "id": foundUser._id
                  }
              },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: '10s' }
          )

          res.json({ accessToken })
      }
  )
}

module.exports.logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  // res.redirect("/"); //redirect
  res.status(200).send("cookie removed");
};
