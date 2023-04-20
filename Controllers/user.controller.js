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
  UserModel.findById(req.params.id)
    .select(
      "picture name philosophy followings followers subscriptions subscribers address project job"
    )
    .then(
      (doc) => res.status(200).send(doc),
      (err) => {
        console.log(err);
        res.status(500).send("user not found:" + req.params.id);
      }
    );
};

// R E L A T I O N
module.exports.follow = async (req, res) => {
  if (req.body.follow) {
    //follow
    await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: { followings: req.body.id_user },
      },
      { new: true }
    ).then(
      async () => {
        await UserModel.findByIdAndUpdate(
          req.body.id_user,
          {
            $push: { followers: req.params.id },
          },
          { new: true }
        ).then(
          () => res.status(200).send("follow success"),
          (err) => {
            console.log("push followers failed");
            res.status(500).send("push followers failed: " + err);
          }
        );
      },
      (err) => {
        console.log("set following failed");
        res.status(500).send("push followings failed: " + err);
      }
    );
  } else {
    //unfollow
    await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { followings: req.body.id_user },
      }
    ).then(
      async () => {
        await UserModel.findByIdAndUpdate(
          req.body.id_user,
          {
            $pull: { followers: req.params.id },
          }
        ).then(
          () => res.status(200).send("unfollow success"),
          (err) => {
            console.log("pull followers failed");
            res.status(500).send("pull followers failed: " + err);
          }
        );
      },
      (err) => {
        console.log("pull following failed");
        res.status(500).send("pull followings failed: " + err);
      }
    );
  }
};

// U P D A T E
module.exports.updateUser = (req, res) => {
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

// U P D A T E
module.exports.changeProfilePicture = async (req, res) => {
  try {
    const updatedRes = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        picture: req.body.picture,
      },
      { new: true }
    ).select("picture");
    res.status(200).json(updatedRes);
  } catch (error) {
    console.log("Update error : " + error);
  }
};

module.exports.changeAddress = async (req, res) => {
  try {
    const updatedRes = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        address: req.body.address,
      },
      { new: true }
    ).select("address");
    res.status(200).json(updatedRes);
  } catch (error) {
    console.log("Update error : " + error);
  }
};

module.exports.changeJob = async (req, res) => {
  try {
    const updatedRes = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        job: req.body.job,
      },
      { new: true }
    ).select("job");
    res.status(200).json(updatedRes);
  } catch (error) {
    console.log("Update error : " + error);
  }
};

module.exports.changeProject = async (req, res) => {
  try {
    const updatedRes = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        project: req.body.project,
      },
      { new: true }
    ).select("project");
    res.status(200).json(updatedRes);
  } catch (error) {
    console.log("Update error : " + error);
  }
};

module.exports.changePhilosophy = async (req, res) => {
  try {
    const updatedRes = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        philosophy: req.body.philosophy,
      },
      { new: true }
    ).select("philosophy");
    res.status(200).json(updatedRes);
  } catch (error) {
    console.log("Update error : " + error);
  }
};
