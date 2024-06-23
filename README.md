# DisLife Back-end

Follow the instructions below to set up the back-end server for [DisLife](https://github.com/pdt1806/DisLife). This server handles communication between the DisLife app and Discord, allowing you to share your posts as Rich Presence with your friends.

## ✅ Prerequisites

- Have the latest version of Node.js (>=18) installed
- Have the Discord app installed on the same machine\*

\*If you're using the web client or any other custom client, check out [arRPC](https://github.com/OpenAsar/arrpc) to use RPC.

## 📦 Installation

### 🖇️ 1. Clone this repo

### 📝 2. Create a .env file based on the example file

- `PASSWORD` is used for authorization when the DisLife app connects to this server. You can set it as anything you want, and you can change it anytime.
- To get the API key for ImgBB, which will then be put into `IMGBB_KEY`, do the following:

1. Go to [ImgBB](https://imgbb.com/) and create an account.
2. Optional - Adjust the settings of your account to meet your needs (recommend changing your account privacy to Private).
3. [Get the API key](https://api.imgbb.com/).

### 💻 3. `npm install`

> [!WARNING]
> The latest version of the `sharp` dependency needs SSE4.2 CPU on Linux x64 (older CPUs incompatible). Use `npm install sharp@0.27.2` for last known compatible version (see [Stack Overflow: NodeJS Illegal instruction (core dumped) error after using sharp library](https://stackoverflow.com/questions/67580821/nodejs-illegal-instruction-core-dumped-error-after-using-sharp-library)).

### 🚀 4. Run the server with `node main.js` or use pm2

By default, the server runs on `http://localhost:60206`.

### 🌐 5. Make sure the server is accessible from the public network (by port forwarding, CF Tunnel, etc.)

## ⚙️ Adjustments

Where you can make changes for personalization (default value):

- Port number (60206)
- Request size limit (50MB)

Technically, you have the right to change whatever you want in the code, but I hope you keep any credits to DisLife and ImgBB.

## 🤝 Contributions

Contributions are welcome in both this repo and [the front-end repo](https://github.com/pdt1806/DisLife).
Feel free to submit pull requests or open issues to contribute to the development of the project.

## 🔧 Troubleshooting

If you encounter any issues, feel free to search for solutions online or reach out to the project maintainers.
