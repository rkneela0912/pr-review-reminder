const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('github_token', { required: true });
    const hoursUntilReminder = parseInt(core.getInput('hours_until_reminder') || '24');
    const reminderMessage = core.getInput('reminder_message') || '⏰ **Reminder:** This PR has been waiting for review for {hours} hours.\n\nRequested reviewers: {reviewers}\n\nPlease review when you have a chance!';
    
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;
    
    core.info(`Checking for PRs awaiting review for more than ${hoursUntilReminder} hours...`);
    
    // Get all open pull requests
    const { data: prs } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'open',
      per_page: 100
    });
    
    core.info(`Found ${prs.length} open PRs`);
    
    const now = new Date();
    let remindedCount = 0;
    
    for (const pr of prs) {
      // Skip draft PRs
      if (pr.draft) {
        core.info(`Skipping draft PR #${pr.number}`);
        continue;
      }
      
      const createdAt = new Date(pr.created_at);
      const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);
      
      // Check if PR has requested reviewers
      const hasRequestedReviewers = pr.requested_reviewers && pr.requested_reviewers.length > 0;
      const hasRequestedTeams = pr.requested_teams && pr.requested_teams.length > 0;
      
      if (!hasRequestedReviewers && !hasRequestedTeams) {
        continue;
      }
      
      // Check if enough time has passed
      if (hoursSinceCreated < hoursUntilReminder) {
        continue;
      }
      
      // Check if we've already sent a reminder recently (check last 5 comments)
      const { data: comments } = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: pr.number,
        per_page: 5,
        sort: 'created',
        direction: 'desc'
      });
      
      const recentReminderExists = comments.some(comment => 
        comment.body && comment.body.includes('⏰') && comment.body.includes('Reminder')
      );
      
      if (recentReminderExists) {
        core.info(`PR #${pr.number} already has a recent reminder, skipping`);
        continue;
      }
      
      // Build reviewer mentions
      const reviewerMentions = pr.requested_reviewers
        .map(reviewer => `@${reviewer.login}`)
        .join(', ');
      
      const teamMentions = pr.requested_teams
        .map(team => `@${owner}/${team.slug}`)
        .join(', ');
      
      const allReviewers = [reviewerMentions, teamMentions]
        .filter(Boolean)
        .join(', ');
      
      // Create reminder message
      const message = reminderMessage
        .replace('{hours}', Math.floor(hoursSinceCreated))
        .replace('{reviewers}', allReviewers)
        .replace('{pr_number}', pr.number.toString())
        .replace('{pr_title}', pr.title)
        .replace('{pr_author}', pr.user.login);
      
      // Post reminder comment
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pr.number,
        body: message
      });
      
      core.info(`✅ Sent reminder for PR #${pr.number}: "${pr.title}"`);
      remindedCount++;
    }
    
    core.info(`\n📊 Summary: Sent ${remindedCount} reminder(s)`);
    core.setOutput('reminded_count', remindedCount.toString());
    
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}\n${error.stack}`);
  }
}

run();

