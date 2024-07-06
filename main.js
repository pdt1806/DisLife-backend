import DiscordRPC from "discord-rpc";
import dotenv from "dotenv";
import express from "express";
import { cropBase64ToSquare, formatDateTime } from "./utils.js";

// ----------------------------------------------
// Importing required modules

const RPC = new DiscordRPC.Client({ transport: "ipc" });
const app = express();

dotenv.config();

// ----------------------------------------------
// Adjustable variables

const port = 60206;
const requestSizeLimit = "50mb";

// ----------------------------------------------
// Don't change these variables

var currentPost = null;
var currentPostTimeout;

const appID = "1246950872206938123";

const IMGBB_KEY = process.env.IMGBB_KEY;

const PASSWORD = process.env.PASSWORD;

// ----------------------------------------------
// Initializing

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: requestSizeLimit }));

app.listen(port);

app.get("/", (req, res) => {
  res.status(200).send({
    message: "DisLife Server is running!",
  });
});

// ----------------------------------------------
// Discord RPC Connection

async function login() {
  try {
    await RPC.login({ clientId: appID });
    console.clear();
    console.log(`DisLife Server listening on http://localhost:${port}`);
  } catch (e) {
    console.error(e.message);
  }
}

login();

// ----------------------------------------------
// Authorizing password

function checkPassword(req, res) {
  try {
    const password = req.body.password;

    if (!password) {
      res.status(400).send({
        message: "Bad Request here",
      });
      return false;
    }

    if (!(password === PASSWORD)) {
      res.status(401).send({
        message: "Unauthorized",
      });
    }
    return password === PASSWORD;
  } catch (error) {
    res.status(400).send({
      message: "Bad Request",
    });
    return false;
  }
}

// ----------------------------------------------
// Verify API Endpoint & Password

app.post("/verify", async (req, res) => {
  if (!checkPassword(req, res)) return;
  res.status(200).send({
    message: "API Endpoint saved successfully!",
  });
});

// ----------------------------------------------
// Discord RPC Events + Post Endpoint

RPC.on("ready", () => {
  app.post("/post", async (req, res) => {
    if (!checkPassword(req, res)) return;

    try {
      currentPost = await runRpc(req.body);
      if (Object.keys(currentPost).length > 0) {
        if (currentPostTimeout) clearTimeout(currentPostTimeout);

        res.status(200).send({
          message: "OK",
        });

        currentPostTimeout = setTimeout(() => {
          currentPost = null;
          RPC.clearActivity();
        }, 1000 * currentPost.expirationTime);
      } else {
        res.status(400).send({
          message: "Not OK",
        });
      }
    } catch (e) {
      res.status(400).send({
        message: "Not OK",
      });
    }
  });

  async function uploadImage(base64Image, expirationTime = 12 * 60 * 60) {
    const croppedBase64 = await cropBase64ToSquare(base64Image);

    const payload = new URLSearchParams({
      key: IMGBB_KEY,
      image: croppedBase64,
      expiration: expirationTime.toString(),
    });

    try {
      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData["data"]["url"];
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  const runRpc = async (data) => {
    try {
      const image = await uploadImage(data.image, data.expirationTime);

      if (!image) {
        console.error("Image upload failed");
        return null;
      }

      const createdDate = new Date();

      data.description1 =
        data.description1 !== "" ? data.description1 : undefined;
      data.description2 =
        data.description2 !== "" ? data.description2 : undefined;
      data.image = image;
      data.timestamp = data.timestamp ? createdDate : undefined;
      data.created = formatDateTime(createdDate);

      var buttonList = [
        {
          label: "DisLife",
          url: "https://github.com/pdt1806/DisLife",
        },
      ];
      if (data.viewFullImage)
        buttonList = [
          {
            label: "View full image",
            url: image,
          },
          ...buttonList,
        ];

      await RPC.setActivity({
        details: data.description1,
        state: data.description2,
        startTimestamp: data.timestamp,
        largeImageKey: data.image,
        largeImageText: "Powered by ImgBB",
        instance: false,
        buttons: buttonList,
      });

      delete data.password;
      return data;
    } catch (e) {
      console.error(new Date().toISOString() + " | " + e.message);
      return null;
    }
  };
});

// ----------------------------------------------
// Clear Discord RPC Activity

app.post("/clear", async (req, res) => {
  if (!checkPassword(req, res)) return;

  try {
    RPC.clearActivity();
    currentPost = null;
    currentPostTimeout = undefined;
    res.status(200).send({
      message: "OK",
    });
  } catch (e) {
    res.status(400).send({
      message: "Not OK",
    });
  }
});

// ----------------------------------------------
// Fetch Discord RPC Activity

app.post("/fetch", async (req, res) => {
  if (!checkPassword(req, res)) return;

  try {
    res.status(200).send({
      message: "OK",
      data: currentPost,
    });
  } catch (e) {
    res.status(400).send({
      message: "Not OK",
    });
  }
});
