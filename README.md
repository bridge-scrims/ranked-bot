# Ranked Bridge
Simple yet effective ELO-based Discord bot for competitive bridge.

## Installation
**NOTE:** This project utilizes [Bun](https://bun.sh). Please install it before attempting to run the Discord bot.
1. Clone this repository and `cd` into the directory.
```bash
git clone https://github.com/bridge-scrims/ranked-bot.git
cd ranked-bot
```
2. Run `bun i`. This will install all dependencies.
3. Create a new Discord application via [Discord's Developer Portal](https://discord.com/developers/applications).
4. Copy the application ID and put it in your `.env` file.
5. On the `Bot` section of the application, click `Reset Token` and copy it. Put it in your `.env` file.
6. Enable the following intents: **Presence Intent, Server Members Intent, and Message Content Intent**.
7. Invite the bot to your server via the `Installation` section of the application. Click "Discord Provided Link" and visit the URL provided. An example URL is `https://discord.com/oauth2/authorize?client_id=1234567891234567890&permissions=0&scope=bot`.
8. Run `bun dev` to start the Discord bot.

## How it Works
TBD