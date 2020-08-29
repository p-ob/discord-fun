# Bad Reilly Discord Bot

Unfortunately, a dedicated voice channel where Reilly can't speak isn't enough. Let's solve that 😈

## TODOs
- [ ] GitHub actions (build, etc.)
- [ ] deployment (I don't want to host this bot on my machine)

## Notes

- Uses discord.js NodeJS client (https://discord.js.org/)
- Requires the following env variables (can be stored off in a .env file):
  - BOT_TOKEN (the token from discord.com that let's you act as your both)
  - REILLY_ID (... Reilly's discord user id)
  - GUILD_ID (the id of the Discord server)
  - CHANNEL_ID (the id of the "shame" channel)
  - REILLY_TIMEOUT_ROLE_ID (the id of the role to put Reilly in when in timeout)
  - GOD_ID (the id of the super admin who can control this bot)
