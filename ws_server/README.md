# WS Server
## Requirements
- Node.js (v18 or later)
- Yarn (or npm)
- ngrok (optional, for tunneling)
### How to install 
for macOS:

1. Download and install Homebrew
```bash
curl -o- https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash
```
2. Download and install Node.js:
```bash
brew install node@22
```
3. Verify the Node.js version: (>= v18)
```bash
node -v
```
4. Download and install Yarn:
```bash
corepack enable yarn
```
5. Verify Yarn version:
```bash
yarn -v
```

6. Install ngrok (optional, for tunneling):
 (go to https://ngrok.com/download and follow the instructions for your OS)

for windows:
1. Download and install Node.js from https://nodejs.org/
2. Verify the Node.js version: (>= v18)
```bash
node -v
```
3. Install Yarn
```bash
npm install -g corepack
npm install -g yarn
```
4. Verify Yarn version:
```bash
yarn -v
```
5. Install ngrok (optional, for tunneling):
 (go to https://ngrok.com/download and follow the instructions for your OS)


## How to run the WebSocket server
1. Install dependencies
```bash
yarn
```
2. Start the server
```bash
yarn dev
```

## Usage
- The WebSocket server will start on `ws://localhost:5243` and `http://xxx.xxx.xxx.xxx:5243` (your internal or public IP address) by default.

- The server will log the port it is running on, e.g., `Server is running on port 5243`.

- The server will log the command for connecting to the WebSocket server, e.g., `localStorage.setItem("ws","ws://xxxxxxxxxxxx") `


## Using ngrok (optional)
If you want to expose your local WebSocket server to the internet, you can use ngrok
1. Start ngrok
```bash
ngrok http 5243
```

2. Copy the generated ngrok URL (e.g., `https://12345678.ngrok.io`)

3. Use this URL to substitute the `ws://` URL in your client code, 
e.g., if ngrok URL is `http://12345678.ngrok.io` 
you would use:
```js
localStorage.setItem("ws","ws://12345678.ngrok.io")
```