import { sendDiscordAlert } from "../services/discord.service";

describe('sendDiscordAlert', () => {
  it('should send a message to Discord', async () => {
    const testMessage = 'Test message from Jest';
    await sendDiscordAlert(testMessage);
  });
});
