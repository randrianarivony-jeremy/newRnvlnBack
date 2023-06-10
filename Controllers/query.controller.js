const UserModel = require("../Models/user.model");

const router = require("express").Router();

router.get("/", (req, res) => {
  UserModel.find(
    { name: { $regex: req.query.user, $options: "i" } },
    "name picture job"
  )
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(500).send("Error while querying user :" + err));
});

module.exports = router;
