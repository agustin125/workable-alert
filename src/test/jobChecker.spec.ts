import { checkJobs } from '../helpers/jobsChecker.helper';
import { sendDiscordAlert } from '../services/discord.service';
import { SequencerService } from '../services/sequencer.service';

jest.mock('../services/discord.service', () => ({
  sendDiscordAlert: jest.fn(),
}));

/*
describe('checkJobs', () => {
  let sequencerService: SequencerService;
  let sendDiscordAlertMock: jest.Mock;

  beforeEach(() => {
    sequencerService = new SequencerService();
    sendDiscordAlertMock = sendDiscordAlert as jest.Mock;
  });

  it('should call sendDiscordAlert when there are failed jobs', async () => {
    const jobs = [
      { address: 'job1', canWork: false },
      { address: 'job2', canWork: true },
      { address: 'job3', canWork: false },
    ];

    sequencerService.getJobs = async () => jobs;

    await checkJobs();

    expect(sendDiscordAlertMock).toHaveBeenCalledTimes(1);
    expect(sendDiscordAlertMock).toHaveBeenCalledWith('Job/s failed: job1,job3 in block number 1');
  });

  it('should not call sendDiscordAlert when there are no failed jobs', async () => {
    const jobs = [
      { address: 'job1', canWork: true },
      { address: 'job2', canWork: true },
    ];

    sequencerService.getJobs = async () => jobs;

    await checkJobs();

    expect(sendDiscordAlertMock).toHaveBeenCalledTimes(0);
  });

});*/