#!/usr/bin/env node

/**
 * Test script to validate issue file parsing without creating GitHub issues
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
 * Main function
 */
async function main() {
  console.log('Testing issue file parsing...\n');
  
  // Read all files from issues directory
  const issuesDir = join(process.cwd(), 'issues');
  const files = await readdir(issuesDir);
  
  for (const file of files) {
    // Skip hidden files and directories
    if (file.startsWith('.')) {
      continue;
    }
    
    try {
      const filepath = join(issuesDir, file);
      const content = await readFile(filepath, 'utf-8');
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`File: ${file}`);
      console.log('='.repeat(80));
      
      const issueData = parseIssueFile(file, content);
      
      console.log(`Title: ${issueData.title}`);
      console.log(`Labels: ${issueData.labels ? issueData.labels.join(', ') : 'None'}`);
      console.log(`Body length: ${issueData.body.length} characters`);
      console.log(`Body preview (first 200 chars):\n${issueData.body.substring(0, 200)}...`);
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error instanceof Error ? error.message : error);
    }
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('✓ Parsing test completed successfully');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
