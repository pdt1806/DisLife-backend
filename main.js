var currentPost = {};
var currentPostTimeout;

const DiscordRPC = require("discord-rpc");
const RPC = new DiscordRPC.Client({ transport: "ipc" });

const express = require("express");
const app = express();
const port = 60206;

const appID = "1246950872206938123";

require("dotenv").config();
const API_KEY = process.env.API_KEY;
const IMGBB_KEY = process.env.IMGBB_KEY;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json({ limit: "50mb" }));

app.listen(port);

app.get("/", (req, res) => {
  res.status(200).send({
    message: "DisLife Server is running!",
  });
});

// ----------------------------------------------

function checkAPIKey(req, res) {
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader !== API_KEY)
    res.status(401).send({
      message: "Unauthorized",
    });
  return authorizationHeader === API_KEY;
}

// ----------------------------------------------

app.get("/verify", (req, res) => {
  if (!checkAPIKey(req, res)) return;
  res.status(200).send({
    message: "OK",
  });
});

// ----------------------------------------------

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
          currentPost = {};
          RPC.clearActivity();
        }, 1000 * 60 * 60 * 12); // 12 hours
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
    let optionsDate = { day: "numeric", month: "long", year: "numeric" };
    let formattedDate = date.toLocaleDateString("en-GB", optionsDate);

    let optionsTime = {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
    let formattedTime = date.toLocaleTimeString("en-GB", optionsTime);

    return `${formattedDate}, ${formattedTime}`;
  }

  async function uploadImage(base64Image) {
    const payload = new URLSearchParams({
      key: IMGBB_KEY || "",
      image: base64Image,
      expiration: "43200", // 12 hours in seconds
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
      const image = await uploadImage(data.image);

      if (!image) {
        console.error("Image upload failed");
        return {};
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
      return {};
    }
  };
});

// ----------------------------------------------

app.get("/clear", (req, res) => {
  if (!checkAPIKey(req, res)) return;

  try {
    RPC.clearActivity();
    currentPost = {};
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

app.get("/fetch", (req, res) => {
  if (!checkAPIKey(req, res)) return;

  if (Object.keys(currentPost).length > 0) {
    res.status(200).send({
      message: "OK",
      data: currentPost,
    });
  } else {
    res.status(400).send({
      message: "Not OK",
    });
  }
});
