import { ethers, JsonRpcProvider } from 'ethers';
import 'dotenv/config';
import { IJob } from '../interfaces/Job.interface';

const SEQUENCER_ABI: string[] = require('../../ABIs/SEQUENCER_ABI.json');
const SEQUENCER_ADDRESS = process.env.SEQUENCER_ADDRESS as string;
const PROVIDER_URL = process.env.PROVIDER_URL;

export class SequencerService {
  provider: ethers.JsonRpcApiProvider;
  private sequencerContract: ethers.Contract;

  constructor() {
    this.provider = new JsonRpcProvider(PROVIDER_URL);
    this.sequencerContract = new ethers.Contract(SEQUENCER_ADDRESS, SEQUENCER_ABI, this.provider);
  }

  private async getActiveNetwork(): Promise<string> {
    const network = await this.sequencerContract.getMaster();
    return network; 
  }

  async getJobs(): Promise<IJob[]> {
    const network = await this.getActiveNetwork();
    const nextJobs = await this.sequencerContract.getNextJobs.staticCall(network);

    const jobs: IJob[] = []
    for (const job of nextJobs) {
      jobs.push( { address: job[0], canWork: job[1] } )
    }

    return jobs;
  }
}