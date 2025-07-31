# Bridge Scrims Ranked Bot

A comprehensive Discord bot designed for managing ranked Minecraft Bridge matches with an advanced ELO rating system, party management, and automated game scoring.

## Overview

This bot provides a complete ranked matchmaking system for Minecraft Bridge players on the Scrims Network. It features automated queue management, party systems, multiple scoring methods, and comprehensive statistics tracking across seasons.

### Key Features

- **ELO Rating System**: Advanced rating calculation using team averages with K-factor of 32
- **Party Management**: Create and manage teams before queuing
- **Multiple Scoring Methods**: Replay analysis, screenshot verification, and manual scoring
- **Season Support**: Statistics tracked across different competitive seasons
- **Strike System**: Moderation tools for managing player behavior
- **Automated Matchmaking**: Intelligent queue system with cooldowns and validation
- **Database Integration**: MongoDB with Mongoose for persistent data storage

## Discord Commands

### Public Commands (Available to All Users)

#### `/register <ign>`

Register your Discord account for ranked Bridge matches.

- **Parameters:**
    - `ign` (String): Your Minecraft username (3-16 characters)
- **Requirements:**
    - Must link Discord account via in-game `/link` command first
    - Username must exist on Scrims Network
- **Context:** Guild and DM

#### `/queue [channel]`

Join or leave a ranked queue.

- **Parameters:**
    - `channel` (Voice Channel, Optional): Specific queue to join
- **Features:**
    - Auto-resolves queue if no channel specified
    - Party leader can queue entire party
    - Handles cooldowns and access validation
- **Context:** Guild and DM

#### `/party <subcommand>`

Manage your party for team-based queuing.

**Subcommands:**

- `/party create [user]` - Create a new party, optionally inviting a user
- `/party invite <user>` - Invite a player to your party
- `/party leave` - Leave your current party
- `/party kick <user>` - Kick a player from your party (leader only)

- **Requirements:** All users must be registered
- **Context:** Guild and DM

#### `/score <replay>`

Score a game using replay analysis.

- **Parameters:**
    - `replay` (String): Replay link or ID from the match
- **Validation:**
    - Must be Bridge Duel mode
    - Minimum 1-minute duration
    - Replay timestamp after game start
    - Player matching between replay and game
- **Context:** Game channels only

#### `/score-screenshot <screenshot> <score>`

Request score confirmation using a screenshot.

- **Parameters:**
    - `screenshot` (Attachment): Game results image (.jpg, .jpeg, .heic, .png, .gif)
    - `score` (String): Your team's score in "X-Y" format
- **Process:** Other team must confirm via button interaction
- **Context:** Game channels only (participants only)

#### `/void`

Request to void/cancel the current game.

- **Process:** Other team must confirm via button interaction
- **Context:** Game channels only (participants only)

### Administrator Commands

#### `/create-queue <parameters>`

Set up a ranked queue for the server.

- **Parameters:**
    - `channel` (Voice Channel): Queue voice channel
    - `text-category` (Category): Game text channels category
    - `vc-category` (Category): Team voice channels category
    - `queue-log` (Text Channel): Queue activity log
    - `game-log` (Text Channel): Game results log
    - `teams-channel` (Text Channel): Party management channel
    - `team-size` (Integer): Team size 1-4 players
    - `token` (String): Worker bot token for game management
- **Security:** Token is encrypted before storage
- **Context:** Guild only

#### `/score-game [team-1-score] [team-2-score]`

Manually score a game with admin override.

- **Parameters:**
    - `team-1-score` (Number, Optional): Team 1's score
    - `team-2-score` (Number, Optional): Team 2's score
- **Features:** Requires confirmation via button
- **Context:** Game channels only

#### `/strike <subcommand>`

Manage player strikes and penalties.

**Subcommands:**

- `/strike add <user> [reason]` - Add a strike to a player
- `/strike list <user> [season]` - View player's strike history

- **Features:**
    - DM notifications to struck players
    - Season-based tracking
    - Paginated history display
- **Context:** Guild only

## Installation & Setup

### Prerequisites

- **Node.js/Bun**: Runtime environment (Bun recommended)
- **MongoDB**: Database for persistent storage
- **Discord Bot**: Application with bot permissions
- **Minecraft Account**: For Scrims Network integration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Discord Bot Configuration
CLIENT_TOKEN=your_discord_bot_token_here
USE_GUILD_COMMANDS=false  # Set to true for testing in specific guild

# Database Configuration
MONGO_URI=mongodb://localhost:27017/ranked-bridge

# Security
ENCRYPTION_SECRET=your_32_character_encryption_key

# Season Management
SEASON=season1  # Current competitive season identifier

# Development
NODE_ENV=production  # Set to development for testing
```

### Step-by-Step Installation

#### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd ranked-bot

# Install dependencies using Bun (recommended)
bun install

# Alternative: using npm
npm install
```

#### 2. Discord Bot Setup

1. **Create Discord Application:**
    - Go to [Discord Developer Portal](https://discord.com/developers/applications)
    - Click "New Application" and give it a name
    - Navigate to "Bot" section and create a bot
    - Copy the bot token for `CLIENT_TOKEN`

2. **Configure Bot Permissions:**
   Required bot permissions:
    - `Send Messages`
    - `Use Slash Commands`
    - `Manage Channels`
    - `Connect` (Voice)
    - `View Channels`
    - `Manage Messages`
    - `Embed Links`
    - `Attach Files`
    - `Read Message History`
    - `Add Reactions`

3. **Invite Bot to Server:**
    - In Discord Developer Portal, go to OAuth2 > URL Generator
    - Select "bot" and "applications.commands" scopes
    - Select the required permissions above
    - Use generated URL to invite bot to your server

#### 3. Database Setup

**MongoDB Installation:**

```bash
# macOS (using Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb

# Windows: Download from MongoDB official website
```

**Database Configuration:**

- Default connection: `mongodb://localhost:27017/ranked-bridge`
- For production, use MongoDB Atlas or dedicated server
- Ensure MongoDB is running before starting the bot

#### 4. Minecraft Integration

1. **Link Discord Account:**
    - Join the Scrims Network Minecraft server
    - Use `/link` command in-game to connect your Discord account
    - This enables the bot to verify your Minecraft username

2. **Verify Registration:**
    - Use `/register <your_minecraft_username>` in Discord
    - Bot will verify the account linkage and register you

#### 5. Build and Run

```bash
# Development mode (with hot reload)
bun run dev

# Production build
bun run build
bun run start

# Run tests
bun run test

# Linting and formatting
bun run lint
```

#### 6. Server Configuration

Once the bot is running, administrators need to:

1. **Create a Queue:**

    ```
    /create-queue channel:#bridge-queue text-category:Bridge-Games vc-category:Team-Calls queue-log:#queue-log game-log:#game-results teams-channel:#teams team-size:2 token:WORKER_BOT_TOKEN
    ```

2. **Set Up Channels:**
    - Voice channel for queueing
    - Text categories for game channels and team calls
    - Log channels for queue and game activity
    - Teams channel for party management

### Docker Deployment

```dockerfile
# Build and run with Docker
docker build -t ranked-bot .
docker run -d --name ranked-bot --env-file .env ranked-bot
```

### Advanced Configuration

#### Worker Bot Setup

The system uses additional worker bots for game management:

- Create separate Discord applications for worker bots
- Generate tokens and use in `/create-queue` command
- Workers handle game channel creation and management

#### Season Management

- Change `SEASON` environment variable to start new seasons
- Previous season stats are preserved
- Each season maintains separate leaderboards and statistics

#### Security Considerations

- Store tokens securely using environment variables
- Use strong encryption secrets (32+ characters)
- Regularly rotate bot tokens
- Monitor logs for suspicious activity

## ELO Rating System

The bot uses a sophisticated ELO rating system:

- **Starting Rating:** 1000 ELO
- **K-Factor:** 32 (moderate rating changes)
- **Team Calculation:** Average of all team members' ratings
- **Scale Factor:** 400 (standard ELO scaling)

**Rating Changes:**

- Win against equal team: ~16 ELO gain
- Loss against equal team: ~16 ELO loss
- Draws: Smaller rating adjustments
- Larger changes against mismatched teams

## Troubleshooting

### Common Issues

**Bot Not Responding:**

- Verify `CLIENT_TOKEN` is correct
- Check bot has necessary permissions
- Ensure bot is online in Discord

**Database Connection Failed:**

- Verify MongoDB is running
- Check `MONGO_URI` connection string
- Ensure database permissions are correct

**Commands Not Appearing:**

- Bot needs `applications.commands` scope
- Try toggling `USE_GUILD_COMMANDS` for testing
- Re-invite bot with correct permissions

**Registration Failing:**

- Verify Minecraft account is linked via `/link` in-game
- Check username spelling and existence
- Ensure Scrims Network connection

### Development Scripts

```bash
# Type checking
bun run typecheck

# Code formatting
bun run format:write

# Full linting suite
bun run lint

# Run specific tests
bun run test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing code style
4. Run tests and linting
5. Submit a pull request

## License

This project is designed for the Bridge Scrims community. Please respect the intended use for competitive Minecraft Bridge matches.
