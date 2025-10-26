# PR Review Reminder ⏰

[![GitHub release](https://img.shields.io/github/v/release/rkneela0912/pr-review-reminder)](https://github.com/rkneela0912/pr-review-reminder/releases) [![MIT License](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)

Send automated reminders for pull requests awaiting review after configurable time periods. Never let PRs go stale again!

## Why Use PR Review Reminder?

- **⏱️ Prevent Stale PRs:** Automatic reminders keep reviews moving
- **📈 Improve Velocity:** Faster reviews = faster delivery
- **🔔 Configurable Timing:** Set reminder thresholds that work for your team
- **👥 Reviewer Mentions:** Directly notifies requested reviewers
- **🤖 Fully Automated:** Set it and forget it

## Features

- Automatic reminders for PRs awaiting review
- Configurable time thresholds
- Mentions requested reviewers
- Tracks time since PR creation
- Works with scheduled workflows
- Non-intrusive notifications

## Quick Start

Create `.github/workflows/pr-reminders.yml`:

```yaml
name: PR Review Reminders

on:
  schedule:
    - cron: '0 9 * * 1-5'  # 9 AM weekdays
  workflow_dispatch:  # Manual trigger

jobs:
  remind:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      issues: write
    
    steps:
      - name: Send reminders
        uses: rkneela0912/pr-review-reminder@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          hours_until_reminder: 24
```

## Configuration

### Custom Time Threshold

```yaml
- uses: rkneela0912/pr-review-reminder@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    hours_until_reminder: 48  # 2 days
```

### Multiple Reminder Schedules

```yaml
# Gentle reminder after 24 hours
- cron: '0 9 * * *'  # Daily at 9 AM
  hours_until_reminder: 24

# Urgent reminder after 72 hours
- cron: '0 14 * * *'  # Daily at 2 PM
  hours_until_reminder: 72
```

## Inputs

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `github_token` | GitHub token for API access | - | ✅ Yes |
| `hours_until_reminder` | Hours to wait before sending reminder | `24` | No |

## Examples

### Daily Reminders

```yaml
name: Daily PR Reminders
on:
  schedule:
    - cron: '0 10 * * 1-5'  # 10 AM weekdays

jobs:
  remind:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      issues: write
    steps:
      - uses: rkneela0912/pr-review-reminder@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          hours_until_reminder: 24
```

### Escalating Reminders

```yaml
name: Escalating Reminders
on:
  schedule:
    - cron: '0 9,15 * * 1-5'  # 9 AM and 3 PM weekdays

jobs:
  gentle-reminder:
    if: github.event.schedule == '0 9 * * 1-5'
    runs-on: ubuntu-latest
    steps:
      - uses: rkneela0912/pr-review-reminder@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          hours_until_reminder: 24
  
  urgent-reminder:
    if: github.event.schedule == '0 15 * * 1-5'
    runs-on: ubuntu-latest
    steps:
      - uses: rkneela0912/pr-review-reminder@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          hours_until_reminder: 72
```

## How It Works

1. Runs on a schedule (cron) or manual trigger
2. Fetches all open pull requests
3. Calculates time since PR creation
4. Identifies PRs with requested reviewers
5. Posts reminder comments for PRs exceeding threshold
6. Mentions requested reviewers in the comment

## Best Practices

- **Set reasonable thresholds:** 24-48 hours is typical
- **Use weekday schedules:** Avoid weekend reminders
- **Combine with SLAs:** Document expected review times
- **Escalate appropriately:** Use multiple reminder levels
- **Respect time zones:** Schedule for team working hours

## Permissions

```yaml
permissions:
  pull-requests: write  # To post comments
  issues: write         # PRs are issues in GitHub's API
```

## License

[MIT License](LICENSE)

## Support

⭐ Star this repo if you find it helpful!

## 💡 ⏰ Never miss a review

Make your workflow more efficient with automation!
