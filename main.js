var currentPost = {};
var currentPostTimeout;

const DiscordRPC = require("discord-rpc");
const RPC = new DiscordRPC.Client({ transport: "ipc" });

const express = require("express");
const app = express();
const port = 60206;

const yargs = require("yargs");

const argv = yargs
  .options({
    appID: { type: "string", demandOption: true, describe: "App ID" },
  })
  .help().argv;

const appID = argv.appID;

require("dotenv").config();
const API_KEY = process.env.API_KEY;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

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
    imgbb_key: process.env.IMGBB_KEY,
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

  const runRpc = async (data) => {
    try {
      var buttonList = [
        {
          label: "DisLife",
          url: "https://github.com/pdt1806/",
        },
      ];
      if (data.button1) buttonList = [data.button1, ...buttonList];

      await RPC.setActivity({
        details: data.description1,
        state: data.description2 !== "" ? data.description2 : undefined,
        startTimestamp: data.timestamp ? new Date() : undefined,
        largeImageKey: data.image,
        largeImageText: "Powered by DisLife",
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

app.get("/check", (req, res) => {
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
