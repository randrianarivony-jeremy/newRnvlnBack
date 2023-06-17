const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./config/.env" });
require("./config/db.js");
const app = express();
const connectDB = require("./config/db.js");

const userRoutes = require("./Routes/user.routes");
const authRoutes = require("./Routes/authentication.routes");
const bodyParser = require("body-parser");
const { checkUser, verifyJWT } = require("./config/auth.middleware");
const questionRoutes = require("./Routes/question.routes");
const publicationRoutes = require("./Routes/publication.routes");
const interviewRoutes = require("./Routes/interview.routes");
const messageRoutes = require("./Routes/message.routes");
const conversationRoutes = require("./Routes/conversation.routes");
const notifRoutes = require("./Routes/notification.routes");
const homefeedRoutes = require("./Routes/homefeeds.routes");

connectDB();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(helmet());

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// //jwt
app.get("/jwtid", checkUser, (req, res) => {
  res.status(200).send(res.locals.user);
});

// //routes
app.use("/api/auth", authRoutes);
app.use("/api/user", checkUser, userRoutes);
app.use("/api/question", checkUser, questionRoutes);
app.use("/api/publication", checkUser, publicationRoutes);
app.use("/api/interview", checkUser, interviewRoutes);
app.use("/api/message", checkUser, messageRoutes);
app.use("/api/conversation", checkUser, conversationRoutes);
app.use("/api/notification", checkUser, notifRoutes);
app.use("/api/feeds", verifyJWT, homefeedRoutes);
app.all("*", (req, res) => {
  res.status(404).json({ message: "404 Not Found" });
});

//server
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});