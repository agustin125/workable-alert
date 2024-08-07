import { checkJobs, handleConsecutiveWorkableBlocks } from '../helpers/jobsChecker.helper';
import { sendDiscordAlert } from '../services/discord.service';
import { SequencerService } from '../services/sequencer.service';
import { errorHelper } from '../helpers/error.helper';

// Mocking dependencies
jest.mock('../services/discord.service');
jest.mock('../services/sequencer.service');
jest.mock('../helpers/error.helper');

describe('checkJobs', () => {
  let sequencerServiceMock: any;
  const providerMock = {
    on: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock SequencerService methods and properties
    sequencerServiceMock = {
      initialize: jest.fn(),
      getNetworks: jest.fn().mockResolvedValue(['network-1']),
      getJobs: jest.fn().mockResolvedValue(['job-1', 'job-2']),
      getAllWorkableStatus: jest.fn().mockResolvedValue([true, false]),
      provider: providerMock,
    };

    // Override the original implementation with the mock
    (SequencerService as jest.Mock).mockImplementation(() => sequencerServiceMock);
  });

  it('should initialize SequencerService and set up block event listener', async () => {
    await checkJobs();

    expect(sequencerServiceMock.initialize).toHaveBeenCalledTimes(1);
    expect(providerMock.on).toHaveBeenCalledTimes(1);
    expect(providerMock.on).toHaveBeenCalledWith('block', expect.any(Function));
  });

  it('should handle blocks and process workable status correctly', async () => {
    await checkJobs();

    const blockHandler = providerMock.on.mock.calls[0][1];

    await blockHandler(123); // Simulate block event

    expect(sequencerServiceMock.getNetworks).toHaveBeenCalledTimes(1);
    expect(sequencerServiceMock.getJobs).toHaveBeenCalledTimes(1);
    expect(sequencerServiceMock.getAllWorkableStatus).toHaveBeenCalledWith('network-1', ['job-1', 'job-2']);
  });

  it('should call errorHelper on error', async () => {
    sequencerServiceMock.getNetworks.mockRejectedValue(new Error('Test Error'));

    await checkJobs();

    const blockHandler = providerMock.on.mock.calls[0][1];

    await blockHandler(123); // Simulate block event

    expect(errorHelper).toHaveBeenCalledWith('Error fetching active network in block number 123:', expect.any(Error));
  });
});

describe('handleConsecutiveWorkableBlocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reset consecutive blocks count when job is workable', async () => {
    const consecutiveWorkableBlocks = { 'job-1-network-1': 5 };

    await handleConsecutiveWorkableBlocks(consecutiveWorkableBlocks, 'job-1', 'network-1', 123, [true]);

    expect(consecutiveWorkableBlocks['job-1-network-1']).toBe(0);
  });

  it('should increment consecutive blocks count when job is not workable', async () => {
    const consecutiveWorkableBlocks = { 'job-1-network-1': 5 };

    await handleConsecutiveWorkableBlocks(consecutiveWorkableBlocks, 'job-1', 'network-1', 123, [false]);

    expect(consecutiveWorkableBlocks['job-1-network-1']).toBe(6);
  });

  it('should send alert when job has not been workable for 10 consecutive blocks', async () => {
    const consecutiveWorkableBlocks = { 'job-1-network-1': 9 };

    await handleConsecutiveWorkableBlocks(consecutiveWorkableBlocks, 'job-1', 'network-1', 123, [false]);

    expect(sendDiscordAlert).toHaveBeenCalledWith('Workable job job-1 has not been worked for 10 consecutive blocks');
    expect(consecutiveWorkableBlocks['job-1-network-1']).toBe(10);
  });

});