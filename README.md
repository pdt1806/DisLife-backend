# DisLife Back-end

Follow the instructions below to set up the back-end server for [DisLife](https://github.com/pdt1806/DisLife).

## Prerequisites

- Have the latest version of Node.js (>=18) installed
- Have the Discord app installed on the same machine\*

\*If you're using the web client or any other custom client, check out [arRPC](https://github.com/OpenAsar/arrpc) to use RPC.

## Installation

### 1. Clone this repo

### 2. Create a .env file based on the example file

- `API_KEY` is basically a 'password' that you will use later on when connecting the app to the back-end.
- To get the API key for ImgBB, which will then be put into `IMGBB_KEY`, do the following:

1. Go to [ImgBB](https://imgbb.com/) and create an account.
2. Optional - Adjust the settings of your account to meet your needs (recommend changing your account privacy to Private).
3. [Get the API key](https://api.imgbb.com/).

### 3. `npm install`

### 4. Run the server with `node main.js` or use pm2

### 5. Make sure the server is accessible from the public network (by port forwarding, CF Tunnel, etc.)

## Adjustments

Where you can make changes for personalization (default value):

- Port number (60206)
- Request size limit (50MB)

Technically, you have the right to change whatever you want in the code, but I hope you keep any credits to DisLife and ImgBB.

## Contributions

Contributions are welcomed in both this repo and [the front-end's repo](https://github.com/pdt1806/DisLife).
Feel free to submit pull requests or open issues to contribute to the development of the project.
