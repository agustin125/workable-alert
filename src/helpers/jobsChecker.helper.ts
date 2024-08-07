
import { sendDiscordAlert } from '../services/discord.service';
import { SequencerService } from '../services/sequencer.service';
import { errorHelper } from './error.helper';

/**
 * Monitors blockchain jobs by subscribing to new blocks and checking their workable status.
 * Initializes the SequencerService, subscribes to block events, fetches active networks,
 * retrieves job addresses, and handles the workable status of each job.
 */
export async function checkJobs(): Promise<void> {
  const sequencerService = new SequencerService();
  await sequencerService.initialize();
  const consecutiveWorkableBlocks: { [jobAddress: string]: number } = {};

  sequencerService.provider.on('block', async (blockNumber) => {
    try {
      console.log(`Checking jobs for block number ${blockNumber}`);
      const networks = [...await sequencerService.getNetworks()]; //  [...] is utilized to copy array and avoid listener concurrency error
      const addresses: string[] = [...await sequencerService.getJobs()];

      for (const network of networks) {
        const workableStatusResponses = await sequencerService.getAllWorkableStatus(network, addresses);

        for (let k = 0; k < addresses.length; k++) {
          const jobAddress = addresses[k];
          const canWork = workableStatusResponses[k];
          handleConsecutiveWorkableBlocks(consecutiveWorkableBlocks, jobAddress, network, blockNumber, canWork);
        }
      }
    } catch (error) {
      errorHelper(`Error fetching active network in block number ${blockNumber}:`, error);
    }

  });
}

/**
 * Handles the monitoring of consecutive workable blocks for each job.
 * Logs the status of each job, updates the consecutive workable blocks count,
 * and sends alerts if a job has not been worked for a specified number of consecutive blocks.
 *
 * @param {Object} consecutiveWorkableBlocks - An object tracking the count of consecutive workable blocks for each job.
 * @param {string} jobAddress - The address of the job being monitored.
 * @param {string} network - The network on which the job is being monitored.
 * @param {number} blockNumber - The current block number.
 * @param {any} canWork - The workable status of the job.
 */
export const handleConsecutiveWorkableBlocks = async (consecutiveWorkableBlocks: { [jobAddress: string]: number }, jobAddress: string, network: string, blocknumber: number, canWork: any) => {
  try {
    if (canWork[0] && consecutiveWorkableBlocks[`${jobAddress}-${network}`] > 0) {
      consecutiveWorkableBlocks[`${jobAddress}-${network}`] = 0;
    }
    if (!canWork[0]) {
      consecutiveWorkableBlocks[`${jobAddress}-${network}`] = (consecutiveWorkableBlocks[`${jobAddress}-${network}`] ?? 0) + 1;
      if (consecutiveWorkableBlocks[`${jobAddress}-${network}`] >= 10) {
        await sendDiscordAlert(`Workable job ${jobAddress} has not been worked for ${consecutiveWorkableBlocks[`${jobAddress}-${network}`]} consecutive blocks`);
      }
    }
    console.log(` ${jobAddress} has been worked ${canWork[0]} after ${consecutiveWorkableBlocks[`${jobAddress}-${network}`]} consecutive blocks, at block ${blocknumber} on network ${network}`)
  } catch (error) {
    console.error(`Error checking workable status for job ${jobAddress} on network ${network}:`, error);
  }
};