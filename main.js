var currentPost = null;
var currentPostTimeout;

// ----------------------------------------------
// Adjustable variables

const port = 60206;
const requestSizeLimit = "50mb";

// ----------------------------------------------
// Don't change these variables

const appID = "1246950872206938123"; // DisLife App ID

require("dotenv").config();
const API_KEY = process.env.API_KEY;
const IMGBB_KEY = process.env.IMGBB_KEY;

// ----------------------------------------------
// Importing and initializing required modules

const DiscordRPC = require("discord-rpc");
const RPC = new DiscordRPC.Client({ transport: "ipc" });

const express = require("express");
const app = express();

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
// Authorizing API Key

function checkAPIKey(req, res) {
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader !== API_KEY) {
    res.status(401).send({
      message: "Unauthorized",
    });
  }
  return authorizationHeader === API_KEY;
}

// ----------------------------------------------
// Verify API Endpoint / Key

app.get("/verify", (req, res) => {
  if (!checkAPIKey(req, res)) return;
  res.status(200).send({
    message: "OK",
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
// Discord RPC Events + Post Endpoint

RPC.on("ready", () => {
  app.post("/post", async (req, res) => {
    if (!checkAPIKey(req, res)) return;

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

  function formatDateTime(date) {
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12 || 12;
    const formattedHours = hours.toString().padStart(2, "0");

    return `${formattedDate}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  }

  async function uploadImage(base64Image, expirationTime = 12 * 60 * 60) {
    const payload = new URLSearchParams({
      key: IMGBB_KEY || "",
      image: base64Image,
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
      return data;
    } catch (e) {
      console.error(new Date().toISOString() + " | " + e.message);
      return null;
    }
  };
});

// ----------------------------------------------
// Clear Discord RPC Activity

app.get("/clear", (req, res) => {
  if (!checkAPIKey(req, res)) return;

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

app.get("/fetch", (req, res) => {
  if (!checkAPIKey(req, res)) return;

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
