import axios from 'axios';
import 'dotenv/config';

// Send a message to a Discord channel
export async function sendDiscordAlert(message: string): Promise<void> {
  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL as string, {
      content: message,
    });
  } catch (error) {
    console.error('Error sending Discord alert:', error);
  }
}
