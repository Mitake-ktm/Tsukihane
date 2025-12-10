# Tsukihane Discord Bot

A multifunctional Discord bot built in TypeScript using Discord.js v14.

## Features

- **🛡️ Moderation**: Ban, kick, mute, warn, clear messages, word filter
- **📊 Leveling System**: XP progression, leaderboards, rank roles
- **🎮 Fun Commands**: Roll dice, 8ball, fortune, quiz
- **📢 Notifications**: Chapter announcements, reminders
- **⚙️ Automation**: Channel/role management, content posting
- **🎭 Events**: Welcome messages, reaction roles, keyword reactions

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Configure the bot in `src/config/config.ts`:
   - Set channel IDs for logs, announcements, welcome
   - Configure leveling settings
   - Add keyword reactions
   - Set up rank roles

5. Deploy slash commands:
   ```bash
   npm run deploy
   ```

6. Start the bot:
   ```bash
   npm run dev    # Development
   npm run build  # Build for production
   npm start      # Production
   ```

## Configuration

Edit `src/config/config.ts` to customize:

| Setting | Description |
|---------|-------------|
| `ownerId` | Your Discord user ID |
| `channels.moderationLogs` | Channel for mod logs |
| `channels.announcements` | Announcement channel |
| `channels.welcome` | Welcome channel |
| `leveling.xpPerMessage` | XP range per message |
| `leveling.xpCooldown` | Cooldown between XP gains |
| `leveling.rankRoles` | Level → Role mappings |

## Commands

### Moderation
| Command | Description |
|---------|-------------|
| `/ban` | Ban a user |
| `/kick` | Kick a user |
| `/mute` | Timeout a user |
| `/unmute` | Remove timeout |
| `/warn` | Warn a user |
| `/warnings` | View/clear warnings |
| `/clear` | Delete messages |
| `/filter` | Manage word blacklist |

### Leveling
| Command | Description |
|---------|-------------|
| `/level` | View level / admin controls |
| `/leaderboard` | Server leaderboard |
| `/profile` | User profile |

### Fun
| Command | Description |
|---------|-------------|
| `/roll` | Roll dice |
| `/8ball` | Magic 8-ball |
| `/fortune` | Daily fortune |
| `/quiz` | Interactive quiz |

### Notifications
| Command | Description |
|---------|-------------|
| `/post` | Post content |
| `/notify` | Send notifications |
| `/reminder` | Manage reminders (owner) |

### Utility
| Command | Description |
|---------|-------------|
| `/channel` | Create/delete channels |
| `/role` | Assign/remove roles |
| `/help` | Show help menu |

## Auto-Moderation

The bot automatically:
- Deletes messages with blacklisted words
- Detects and removes spam
- Warns about excessive caps usage

## Project Structure

```
src/
├── index.ts              # Entry point
├── deploy-commands.ts    # Command deployment
├── config/
│   └── config.ts         # Bot configuration
├── database/
│   └── database.ts       # SQLite setup
├── handlers/
│   ├── commandHandler.ts # Slash command handler
│   └── eventHandler.ts   # Event handler
├── commands/
│   ├── moderation/       # Moderation commands
│   ├── leveling/         # Level commands
│   ├── fun/              # Fun commands
│   ├── automation/       # Automation commands
│   ├── notifications/    # Notification commands
│   └── general/          # General commands
├── events/
│   ├── ready.ts
│   ├── messageCreate.ts
│   ├── interactionCreate.ts
│   ├── guildMemberAdd.ts
│   └── messageReaction*.ts
├── services/
│   ├── moderationService.ts
│   ├── xpService.ts
│   ├── reminderService.ts
│   └── loggingService.ts
└── utils/
    ├── embed.ts
    ├── permissions.ts
    └── time.ts
```

## License

ISC
