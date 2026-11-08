const express = require("express");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const multer = require("multer");
require("dotenv").config();
const stripeSecret = process.env.STRIPE_KEY;
const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = require("stripe")(stripeSecret);

const app = express();
const port = process.env.PORT || 3080;

app.use(
  cors({
    origin: "*",
    methods: "*",
    credentials: true,
  })
);

app.use("/checkHasStripe", async (req, res) => {
  try {
    res.json(!!stripeSecret && !!stripeWebhook);
  } catch (error) {
    console.log(error);
  }
});

app.use(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const { courseId, userId } = session?.metadata;

        if (session.payment_status == "paid") {
          await Order.update(
            { status: "complete" },
            { where: { courseId: courseId, userId: userId } }
          );
        }

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/email", upload.single("file"), (req, res) => {
  const { file } = req;
  const { courseName, toEmail, toName, fromCompany, fromEmail, key } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: fromEmail,
      pass: key,
    },
  });

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const mailOptions = {
    from: process.env.EMAIL,
    to: toEmail,
    subject: `ขอแสดงความยินดีกับความสำเร็จของท่านที่ได้รับใบเกียรติบัติในการอบรมในหลักสูตร ${courseName}`,
    html: `เรียน ${toName}, <br/><br/>

    ขอแสดงความยินดีกับความสำเร็จของท่านที่ได้รับใบเกียรติบัติในครั้งนี้ ทางเราขอชื่นชมในความพยายามและความมุ่งมั่นของท่านในการพัฒนาตนเองให้ดียิ่งขึ้น<br/><br/>
    ขอให้ท่านนำความรู้และประสบการณ์ที่ได้รับไปใช้ให้เกิดประโยชน์สูงสุด และขอให้ท่านประสบความสำเร็จในทุกๆ ด้านของชีวิตในอนาคต<br/><br/>

    ด้วยความนับถืออย่างสูง <br/> ${fromCompany}`,
    attachments: [
      {
        filename: req.file.originalname,
        content: req.file.buffer,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error sending email.", error);
    }

    res.status(200).end();
  });
});

app.post("/sendEmailVerify", async (req, res) => {
  const { toEmail, verifyCode, fromCompany, fromEmail, key, apiEndpoint } =
    req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: fromEmail,
      pass: key,
    },
  });

  try {
    const user = await User.findOne({
      where: { email: toEmail },
      attributes: ["verifyCode"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: `โปรดยืนยันที่อยู่อีเมลของคุณ`,
      html: `กรุณายืนยันอีเมลของคุณโดยใช้รหัสยืนยันนี้: <strong>${
        verifyCode || user?.verifyCode
      }</strong><br/><br/>
      ขอให้ท่านนำรหัสนี้ไปใช้ในขั้นตอนการยืนยันอีเมลเพื่อดำเนินการต่อ<br/><br/>

      หรือคลิกลิงค์นี้เพื่อทำการยืนยันอีเมล : ${
        process.env.FRONTEND_URL
      }/activate?email=${toEmail}&key=${verifyCode || user?.verifyCode}
      ด้วยความนับถืออย่างสูง, <br/>${fromCompany}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Error sending email.");
      }

      res.status(200).send("Email sent successfully.");
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing request.");
  }
});

const routes = require("./routers/index");
const { Order, User } = require("./models");
app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
