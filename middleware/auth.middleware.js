const jwt = require("jsonwebtoken");
const conversationModel = require("../Models/conversation.model");
const notificationModel = require("../Models/notification.model");
const UserModel = require("../Models/user.model");

module.exports.checkUser = async (req, res, next) => {
  const token = req.cookies.plusvaloo_jwt;
  if (token) {
    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decodedToken) => {
        if (err) return res.status(403).json({ message: err.message });

        Promise.all([
          //current user
          UserModel.findById(decodedToken.id).select(
            "name job friends subscriptions subscribers picture friendInvitation friendRequest"
          ),
          //check new messages
          conversationModel.find({ members: { $in: [decodedToken.id] } }),
          notificationModel.find({ to: decodedToken.id }),
        ]).then(([user, conversations, notifications]) => {
          let newMainMessage = 0;
          let newSecondMessage = 0;
          let newNotification = 0;

          //new messages count
          conversations.map((conv) => {
            if (conv.category === "main") {
              conv.newMessage = conv.newMessage.map((elt) => {
                if (String(elt.user) == String(decodedToken.id))
                  newMainMessage += elt.new;
              });
            } else {
              conv.newMessage = conv.newMessage.map((elt) => {
                if (String(elt.user) == String(decodedToken.id))
                  newSecondMessage += elt.new;
              });
            }
          });

          //new notifications count
          notifications.map((notif) => {
            if (notif.seen === false) newNotification += 1;
          });
          res
            .status(200)
            .json({ user, newMainMessage, newSecondMessage, newNotification });
        });
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