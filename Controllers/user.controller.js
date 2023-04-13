const UserModel = require("../Models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcrypt");

// R E A D  A L L
module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};

// R E A D  O N E
module.exports.userInfo = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("Id unknown :" + req.params.id);

  UserModel.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Id unknown: " + err);
  }).select("picture name philosophy sex status birth tag");
};

// U P D A T E
module.exports.updateUser = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("Id unknown :" + req.params.id);

  const updatedRecord = {
    name: req.body.name,
    password: req.body.password,
  };

  UserModel.findByIdAndUpdate(
    req.params.id,
    { $set: updatedRecord },
    { new: true },
    (err, docs) => {
      if (!err) res.send(docs);
      else console.log("Update error : " + err);
    }
  );
};

//U P D A T E  P A S S W O R D
module.exports.updatePassword = async (req, res) => {
  const user = await UserModel.findOne({ _id: req.params.id }); //crypter na aloha ny password et comparer apres
  if (user) {
    const auth = await bcrypt.compare(req.body.password, user.password); //comparrer le name avec le base bcrypt
    // console.log('user trouvé',user);
    if (auth) {
      // return user;
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(req.body.newPassword, salt);
      UserModel.findByIdAndUpdate(
        req.params.id,
        { $set: { password: newPassword } },
        { new: true },
        (err, docs) => {
          if (!err) res.send(docs);
          else console.log("Update error : " + err);
        }
      );
      // console.log('auth trouvé',auth);
    }
    // else console.log('auth non ttrouvé')
    else {
      res.send({ error: "Incorrect password" });
      // throw Error("incorrect password");
    }
  } else throw Error("Unknown user");
  // else console.log('user non trouvé')
};

// D E L E T E
module.exports.deleteUser = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  UserModel.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Delete error : " + err);
  });
};

module.exports.uploadEdp = async (req, res) => {
  try {
    const updatedRes = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
          picture: req.body.picture,
      },
      { new: true }
    );
    // const updatedRes = await UserModel.findById(req.params.id)
    // console.log({updatedRes})
    res.status(200).json(updatedRes);
  } catch (error) {
    console.log("Update error : " + error);
  }
};

module.exports.uploadPhilosophy = async (req, res) => {
  UserModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        philosophy: req.body.philosophy,
      },
    },
    { new: true },
    (err, docs) => {
      if (!err) res.send(docs);
      else console.log("Update error : " + err);
    }
  );
};

module.exports.uploadTag = async (req, res) => {
  UserModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        tag: req.body.tag,
      },
    },
    { new: true },
    (err, docs) => {
      if (!err) res.send(docs);
      else console.log("Update error : " + err);
    }
  );
};
