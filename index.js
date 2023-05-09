const express = require("express");
const app = express();
require("dotenv").config({path:'./config/.env'});
require("./config/db.js");
const connectDB = require("./config/db.js");
const cors = require("cors");
const userRoutes = require("./Routes/user.routes");
const bodyParser = require("body-parser");
const { checkUser, requireAuth } = require("./config/auth.middleware");
const cookieParser = require("cookie-parser");
const questionRoutes = require("./Routes/question.routes");
const interviewRoutes = require("./Routes/interview.routes");
const publicationRoutes = require("./Routes/publication.routes");
const contentFeedRoutes = require("./Routes/contentFeed.routes");
const messageRoutes = require("./Routes/message.routes");
const conversationRoutes = require("./Routes/conversation.routes");
const notifRoutes = require("./routes/notification.routes");
// const chatRoutes = require("./routes/conversations");
// const feedRoutes = require("./routes/feed.routes");
// const suggestion = require ('./routes/suggestions');

connectDB();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ['sessionId','Content-type'],
  exposedHeaders: ['sessionId'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false
}
app.use(cors(corsOptions));

// //jwt
app.get("*", checkUser);
app.get("/jwtid", requireAuth, (req, res) => {
  res.status(200).send(res.locals.user);
});

// //routes
app.use("/api/user", userRoutes);
app.use('/api/question',questionRoutes);
app.use('/api/interview',interviewRoutes);
app.use('/api/publication',publicationRoutes);
app.use('/api/feeds',contentFeedRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/notification", notifRoutes);
// app.use("/api/chat", chatRoutes);
// app.use('/api/input',suggestion);
// app.use('/api/feed',feedRoutes);


//server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});