var postAvailable = false;

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

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

app.listen(port, () => {
  console.clear();
  console.log(`DisLife Server listening on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.status(200).send({
    message: "OK",
  });
});

// ----------------------------------------------

app.get("/valid", (req, res) => {
  res.status(200).send({
    appID: appID,
    message: "OK",
  });
});

// ----------------------------------------------

RPC.on("ready", () => {
  app.post("/post", (req, res) => {
    postAvailable = runRpc(req.body);
    if (postAvailable) {
      res.status(200).send({
        message: "OK",
      });
    } else {
      res.status(400).send({
        message: "Not OK",
      });
    }
  });

  const runRpc = async (data) => {
    async function setActivity() {
      RPC.setActivity({
        details: data.description1,
        state: data.description2,
        startTimestamp: data.timestamp ? new Date() : undefined,
        largeImageKey: data.image,
        largeImageText: "Powered by [to be announced]",
        instance: false,
        buttons: [
          data.button1,
          {
            label: "[to be announced]",
            url: "https://github.com/pdt1806/",
          },
        ],
      });
    }

    try {
      setActivity();
      return true;
    } catch (e) {
      console.log("Error: " + e);
      return false;
    }
  };
});

async function login() {
  try {
    await RPC.login({ clientId: appID });
  } catch (e) {
    console.log("Invalid Application ID.");
  }
}

login();

// ----------------------------------------------

app.get("/clear", (req, res) => {
  RPC.clearActivity();
  postAvailable = false;
  res.status(200).send({
    message: "OK",
  });
});

// ----------------------------------------------

app.get("/check", (req, res) => {
  if (postAvailable) {
    res.status(200).send({
      message: "OK",
    });
  } else {
    res.status(400).send({
      message: "Not OK",
    });
  }
});
