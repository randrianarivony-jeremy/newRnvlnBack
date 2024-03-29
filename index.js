const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require('path')
const cookieParser = require("cookie-parser");

require("dotenv").config({ path: "./config/.env" });
require("./config/db.js");

const errorHandler = require("./middleware/errorHandler");
const connectDB = require("./config/db.js");

const { verifyJWT, checkUser } = require("./middleware/auth.middleware");
const userRoutes = require("./Routes/user.routes");
const subscriptionRoutes = require("./Routes/subscription.routes");
const authRoutes = require("./Routes/authentication.routes");
const questionRoutes = require("./Routes/question.routes");
const publicationRoutes = require("./Routes/publication.routes");
const interviewRoutes = require("./Routes/interview.routes");
const messageRoutes = require("./Routes/message.routes");
const conversationRoutes = require("./Routes/conversation.routes");
const notifRoutes = require("./Routes/notification.routes");
const homefeedRoutes = require("./Routes/homefeeds.routes");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../ui/build")));

connectDB();

app.use(cookieParser());
app.use(helmet());

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["POST", "GET", "PATCH", "DELETE", "PUT"],
};
app.use(cors(corsOptions));

// //jwt
app.get("/api/check_user", checkUser);

// //routes
app.use("/api/auth", authRoutes);
app.use("/api/user", verifyJWT, userRoutes);
app.use("/api/subscri", verifyJWT, subscriptionRoutes);
app.use("/api/question", verifyJWT, questionRoutes);
app.use("/api/publication", verifyJWT, publicationRoutes);
app.use("/api/interview", verifyJWT, interviewRoutes);
app.use("/api/message", verifyJWT, messageRoutes);
app.use("/api/conversation", verifyJWT, conversationRoutes);
app.use("/api/notification", verifyJWT, notifRoutes);
app.use("/api/feeds", verifyJWT, homefeedRoutes);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../ui/build/index.html"));
});

app.use(errorHandler);

//server
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});