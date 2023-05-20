const express = require("express");
const app = express();
require("dotenv").config({path:'./config/.env'});
require("./config/db.js");
const connectDB = require("./config/db.js");
const cors = require("cors");
const userRoutes = require("./Routes/user.routes");
const authRoutes = require("./Routes/authentication.routes");
const bodyParser = require("body-parser");
const { checkUser, requireAuth } = require("./config/auth.middleware");
const cookieParser = require("cookie-parser");
const questionRoutes = require("./Routes/question.routes");
const publicationRoutes = require("./Routes/publication.routes");
const interviewRoutes = require("./Routes/interview.routes");
const messageRoutes = require("./Routes/message.routes");
const conversationRoutes = require("./Routes/conversation.routes");
const notifRoutes = require("./Routes/notification.routes");
const homefeedRoutes = require("./Routes/homefeeds.routes");
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
app.get("/jwtid", checkUser, (req, res) => {
  res.status(200).send(res.locals.user);
});

// //routes
app.use("/api/auth",authRoutes);
app.use("/api/user", checkUser,userRoutes);
app.use('/api/question', checkUser,questionRoutes);
app.use('/api/publication',checkUser,publicationRoutes);
app.use('/api/interview',checkUser,interviewRoutes);
app.use("/api/message", checkUser,messageRoutes);
app.use("/api/conversation", checkUser,conversationRoutes);
app.use("/api/notification", checkUser,notifRoutes);
app.use('/api/feeds',checkUser,homefeedRoutes);

//server
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});