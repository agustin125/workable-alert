import { checkJobs } from './helpers/jobsChecker.helper';

export async function handler(event: any) {
  await checkJobs();
}