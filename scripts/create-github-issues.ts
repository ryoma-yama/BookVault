#!/usr/bin/env node

/**
 * Script to create GitHub issues from local markdown files in the /issues directory
 * 
 * Usage:
 *   pnpm create-issues
 * 
 * Environment variables required:
 *   GITHUB_TOKEN - Personal access token with repo scope
 *   GITHUB_REPOSITORY - Repository in format "owner/repo" (optional, defaults to current repo)
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

interface IssueData {
  title: string;
  body: string;
  labels?: string[];
}

/**
 * Parse a markdown file to extract title and body
 */
function parseIssueFile(filename: string, content: string): IssueData {
  // Extract title from filename
  let title = filename;
  
  // Remove .md extension if present
  if (title.endsWith('.md')) {
    title = title.slice(0, -3);
  }
  
  // If filename is just a number, try to extract title from content
  if (/^\d+$/.test(title)) {
    // Try to find first heading (# or ##)
    const firstHeading = content.match(/^#{1,2}\s+(.+)$/m);
    if (firstHeading) {
      const headingText = firstHeading[1];
      // If the heading is generic like "概要" (overview), create a descriptive title
      if (headingText === '概要' || headingText === 'Overview') {
        title = `[Phase 1-1] Laravel 12プロジェクトのセットアップとDocker環境構築`;
      } else {
        title = headingText;
      }
    } else {
      title = `Issue #${title}`;
    }
  }
  
  // Detect labels from content or filename
  const labels: string[] = [];
  if (filename.includes('Phase') || content.includes('Phase')) {
    labels.push('enhancement');
  }
  if (content.includes('PostgreSQL') || content.includes('database')) {
    labels.push('database');
  }
  if (content.includes('Laravel')) {
    labels.push('migration');
  }
  
  return {
    title,
    body: content,
    labels: labels.length > 0 ? labels : undefined,
  };
}

/**
 * Create a GitHub issue using the GitHub REST API
 */
async function createGitHubIssue(
  token: string,
  repo: string,
  issueData: IssueData
): Promise<void> {
  const [owner, repoName] = repo.split('/');
  
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/issues`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: issueData.title,
        body: issueData.body,
        labels: issueData.labels,
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create issue: ${response.status} ${error}`);
  }
  
  const data = await response.json();
  console.log(`✓ Created issue #${data.number}: ${issueData.title}`);
  console.log(`  URL: ${data.html_url}`);
}

/**
 * Main function
 */
async function main() {
  // Check for required environment variables
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is required');
    console.error('Please set it to a personal access token with repo scope');
    process.exit(1);
  }
  
  // Get repository from environment or git config
  let repo = process.env.GITHUB_REPOSITORY;
  if (!repo) {
    // Try to extract from git remote
    try {
      const { execSync } = await import('node:child_process');
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
      const match = remoteUrl.match(/github\.com[:/](.+?)\.git$/);
      if (match) {
        repo = match[1];
      }
    } catch (error) {
      // Ignore error
    }
  }
  
  if (!repo) {
    console.error('Error: GITHUB_REPOSITORY environment variable is required');
    console.error('Set it to the repository in format "owner/repo"');
    process.exit(1);
  }
  
  console.log(`Creating issues for repository: ${repo}\n`);
  
  // Read all files from issues directory
  const issuesDir = join(process.cwd(), 'issues');
  const files = await readdir(issuesDir);
  
  let createdCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    // Skip hidden files and directories
    if (file.startsWith('.')) {
      continue;
    }
    
    try {
      const filepath = join(issuesDir, file);
      const content = await readFile(filepath, 'utf-8');
      
      console.log(`Processing: ${file}`);
      const issueData = parseIssueFile(file, content);
      
      await createGitHubIssue(token, repo, issueData);
      createdCount++;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error instanceof Error ? error.message : error);
      errorCount++;
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Created: ${createdCount} issues`);
  console.log(`Errors: ${errorCount} issues`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
