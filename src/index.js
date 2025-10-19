const core = require('@actions/core');
const github = require('@actions/github');
async function run() {
  try {
    const token = core.getInput('github_token', { required: true });
    const hours = parseInt(core.getInput('hours_until_reminder'));
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;
    
    const { data: prs } = await octokit.rest.pulls.list({
      owner, repo, state: 'open'
    });
    
    const now = new Date();
    for (const pr of prs) {
      const createdAt = new Date(pr.created_at);
      const hoursSince = (now - createdAt) / (1000 * 60 * 60);
      
      if (hoursSince >= hours && pr.requested_reviewers.length > 0) {
        await octokit.rest.issues.createComment({
          owner, repo, issue_number: pr.number,
          body: `⏰ Reminder: This PR has been waiting for review for ${Math.floor(hoursSince)} hours.`
        });
        core.info(`Reminded reviewers on PR #${pr.number}`);
      }
    }
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}
run();
