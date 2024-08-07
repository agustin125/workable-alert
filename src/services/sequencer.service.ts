import { ethers, JsonRpcProvider } from 'ethers';
import 'dotenv/config';

const SEQUENCER_ABI: string[] = require('../../ABIs/SEQUENCER_ABI.json');
const WORKABLE_ABI: string[] = require('../../ABIs/WORKABLE_ABI.json');
const SEQUENCER_ADDRESS = process.env.SEQUENCER_ADDRESS as string;
const PROVIDER_URL = process.env.PROVIDER_URL;
const PROVIDER_WSS = process.env.PROVIDER_WSS as string;

export class SequencerService {
  provider: ethers.JsonRpcApiProvider;
  private sequencerContract: ethers.Contract;
  private jobContractCache: { [jobAddress: string]: ethers.Contract } = {};
  private networks: string[] = [];
  private jobs: string[] = [];

  constructor() {
    this.provider = new JsonRpcProvider(PROVIDER_URL);
    this.sequencerContract = new ethers.Contract(SEQUENCER_ADDRESS, SEQUENCER_ABI, this.provider);
  }

   /**
   * Initializes the SequencerService by fetching the number of networks and jobs,
   * and subscribing to contract events to update the internal state accordingly.
   */
  async initialize(): Promise<void> {
    const numNetworksPromise = this.sequencerContract.numNetworks();
    const numJobsPromise = this.sequencerContract.numJobs();
    const [numNetworks, numJobs] = await Promise.all([numNetworksPromise, numJobsPromise]);

    for (let i = 0; i < numNetworks; i++) {
      this.networks.push(await this.sequencerContract.networkAt(i));
    }

    for (let j = 0; j < numJobs; j++) {
      this.jobs.push(await this.sequencerContract.jobAt(j));
    }

    const providerWss = new ethers.WebSocketProvider(PROVIDER_WSS);
    const contractListener = new ethers.Contract(SEQUENCER_ADDRESS, SEQUENCER_ABI, providerWss);;

    contractListener.on("AddNetwork", (network, windowSize) => {
      console.log(`Network added: ${network}, Window Size: ${windowSize}`);
      if (!this.networks.includes(network)) {
        this.networks.push(network);
      }
    });

    contractListener.on("RemoveNetwork", (network) => {
      console.log(`Network removed: ${network}`);
      this.networks = this.networks.filter(n => n !== network);
    });

    contractListener.on("AddJob", (job) => {
      console.log(`Job added: ${job}`);
      if (!this.jobs.includes(job)) {
        this.jobs.push(job);
      }
    });

    contractListener.on("RemoveJob", (job) => {
      console.log(`Job removed: ${job}`);
      this.jobs = this.jobs.filter(j => j !== job);
    });
  }

  async getJobs(): Promise<string[]> {
    return this.jobs;

  }

  async getNetworks(): Promise<string[]> {
    return this.networks;
  }

  /**
   * Caches job contracts for the provided job addresses.
   *
   * @param {string[]} jobAddresses - An array of job addresses to cache contracts for.
   * @returns {Promise<{ [jobAddress: string]: ethers.Contract }>} - A promise that resolves to an object mapping job addresses to their contract instances.
   */
  private async getJobContractsCache(jobAddresses: string[]): Promise<{ [jobAddress: string]: ethers.Contract }> {
    for (const jobAddress of jobAddresses) {
      this.jobContractCache[jobAddress] ??= new ethers.Contract(jobAddress, WORKABLE_ABI, this.provider);
    }

    return this.jobContractCache;
  };

   /**
   * Fetches the workable status for all provided job addresses on a specific network.
   *
   * @param {string} network - The network to check the workable status on.
   * @param {string[]} jobAddresses - An array of job addresses to check.
   * @returns {Promise<any[]>} - A promise that resolves to an array of workable status responses.
   */
  async getAllWorkableStatus(network: string, jobAddresses: string[]) {
    const jobContracts = await this.getJobContractsCache(jobAddresses)
    const promises = jobAddresses.map((jobAddress: string) => jobContracts[jobAddress].workable(network));
    return await Promise.all(promises);
  };

}