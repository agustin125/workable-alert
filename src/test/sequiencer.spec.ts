import { SequencerService } from '../services/sequencer.service';
import { ethers } from 'ethers';
import 'dotenv/config';

jest.setTimeout(30000);

describe('SequencerService', () => {
  let sequencerService: SequencerService;

  beforeEach(() => {
    sequencerService = new SequencerService();
  });

  it('should initialize the SequencerService', async () => {
    await sequencerService.initialize();
    expect(sequencerService.provider).toBeInstanceOf(ethers.JsonRpcApiProvider);
  });

  it('should cache job contracts', async () => {
    const jobAddresses = ['job1', 'job2'];
    const jobContracts = await (sequencerService as any).getJobContractsCache(jobAddresses);
    expect(Object.keys(jobContracts)).toEqual(jobAddresses);
  });
});