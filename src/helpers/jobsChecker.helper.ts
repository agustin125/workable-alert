
import { sendDiscordAlert } from '../services/discord.service';
import { SequencerService } from '../services/sequencer.service';
import { errorHelper } from './error.helper';

export async function checkJobs(): Promise<void> {
  const sequencerService = new SequencerService();
  let failedJobsCount: { [address: string]: number } = {};

  sequencerService.provider.on('block', async (blockNumber) => {
    console.log(`New block mined: ${blockNumber}`);
    try {
      const jobs = await sequencerService.getJobs();

      jobs.forEach((job) => {
        if (!job.canWork) {
          failedJobsCount[job.address] = 0;
        } else {
          if (!failedJobsCount[job.address]) {
            failedJobsCount[job.address] = 0;
          }
          failedJobsCount[job.address]++;
        }
      });

      const failedJobs = Object.keys(failedJobsCount).filter((address: string) => failedJobsCount[address] >= 10);
      if (failedJobs.length > 0)
        await sendDiscordAlert(`Job/s failed: ${failedJobs} in block number ${blockNumber}`);
    } catch (error) {
      errorHelper(`Error fetching active network in block number ${blockNumber}:`, error);
    }
  });
}
