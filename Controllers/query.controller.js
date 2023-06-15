const UserModel = require("../Models/user.model");

const router = require("express").Router();

//U S E R
router.get("/", (req, res) => {
  UserModel.find(
    { name: { $regex: req.query.user, $options: "i" } },
    "name picture job"
  )
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(500).send("Error while querying user :" + err));
});

// A R T I C L E
router.get("/", (req, res) => {
  UserModel.find(
    { name: { $regex: req.query.user, $options: "i" } },
    "name picture job"
  )
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(500).send("Error while querying user :" + err));
});

//I N T E R V I E W S
router.get("/", (req, res) => {
  UserModel.find(
    { name: { $regex: req.query.user, $options: "i" } },
    "name picture job"
  )
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(500).send("Error while querying user :" + err));
});

// Q U E S T I O N S 
router.get("/", (req, res) => {
  UserModel.find(
    { name: { $regex: req.query.user, $options: "i" } },
    "name picture job"
  )
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(500).send("Error while querying user :" + err));
});

module.exports = router;
