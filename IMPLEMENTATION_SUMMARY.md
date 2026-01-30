# GitHub Issue Creation Feature - Implementation Summary

## Overview
This implementation adds functionality to programmatically create GitHub issues from local markdown files stored in the `/issues/` directory.

## Problem Statement
The original problem statement "Ask; GitHubにイシューを作成できますか？" (Can you create an issue on GitHub?) was interpreted as a request to implement a feature that allows creating GitHub issues programmatically from local markdown files.

## Solution
A TypeScript script that:
1. Reads markdown files from the `/issues/` directory
2. Parses each file to extract:
   - Title (from filename or first heading)
   - Body (entire file content)
   - Labels (auto-detected from content keywords)
3. Creates issues via GitHub REST API

## Files Added

### `scripts/create-github-issues.ts`
Main script that creates GitHub issues. Features:
- Reads all files from `/issues/` directory
- Smart title extraction:
  - Uses filename (with `.md` extension removed)
  - For numbered files, extracts from first heading
  - Falls back to "Issue #N" for generic headings
- Auto-detects labels based on content keywords:
  - "Phase" → `enhancement`
  - "PostgreSQL" or "database" → `database`
  - "Laravel" → `migration`
- Handles errors gracefully:
  - Missing GITHUB_TOKEN
  - Missing repository configuration
  - Missing issues directory
  - API failures
- Rate limiting protection (1 second delay between issues)

### `scripts/test-parse-issues.ts`
Test script for validating parsing logic without creating actual issues. Useful for:
- Testing title extraction
- Verifying label detection
- Previewing how issues will be created

### `scripts/README.md`
Comprehensive documentation in Japanese covering:
- Prerequisites (GitHub PAT)
- Installation instructions
- Usage examples
- File format specifications
- Auto-label detection rules
- Troubleshooting guide

## Files Modified

### `package.json`
- Added `create-issues` npm script
- Added dependencies:
  - `tsx` (4.19.2) - TypeScript executor
  - `@types/node` (22.10.5) - Node.js type definitions

### `README.md`
- Added "GitHub Issue Creation" section
- Documents basic usage
- Links to detailed documentation in `scripts/README.md`

### `pnpm-lock.yaml`
- Updated with new dependencies

## Usage

### Basic Usage
```bash
export GITHUB_TOKEN=ghp_your_token_here
pnpm create-issues
```

### With Custom Repository
```bash
export GITHUB_TOKEN=ghp_your_token_here
export GITHUB_REPOSITORY=owner/repo
pnpm create-issues
```

### Test Parsing (Dry Run)
```bash
npx tsx scripts/test-parse-issues.ts
```

## Security Considerations

1. **Token Protection**: Script requires GITHUB_TOKEN as environment variable (not hardcoded)
2. **Error Handling**: Sanitized error messages to avoid exposing sensitive API response details
3. **Dependency Scanning**: All dependencies checked against GitHub Advisory Database
4. **CodeQL Analysis**: Passed security scanning with no alerts

## Implementation Notes

1. **No Duplication Check**: Script doesn't check for existing issues, so running it multiple times will create duplicates
2. **Rate Limiting**: 1-second delay between API calls to avoid GitHub rate limits
3. **Label Detection**: Project-specific but can be easily modified for other projects
4. **Git Remote Detection**: Automatically extracts repository from git remote if GITHUB_REPOSITORY not set

## Future Enhancements (Not Implemented)

Potential improvements identified during code review:
1. Extract parsing logic to shared module (DRY principle)
2. Make label detection configurable via config file
3. Add duplication detection based on title or content hash
4. Support for issue assignments, milestones, and projects
5. Batch mode with better progress reporting

## Testing Performed

1. ✅ Parse test with existing issue files
2. ✅ Error handling test (missing directory)
3. ✅ Linting (ESLint)
4. ✅ Type checking (TypeScript)
5. ✅ Security scanning (CodeQL)
6. ✅ Dependency vulnerability check

## Limitations

1. No actual GitHub API call test (requires valid token and may create duplicate issues)
2. Label detection is project-specific
3. Function duplication between main and test scripts
4. No configuration file support

---

**Implementation Date**: January 30, 2026  
**Branch**: copilot/create-github-issue  
**Status**: Complete ✅
