#!/usr/bin/env node

/**
 * Pre-commit Blog Validation Hook
 * Automatically validates and repairs blog posts before commits
 */

const { execSync } = require('child_process');
const path = require('path');

/**
 * Colors for console output
 */
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * Runs a command and returns the result
 */
function runCommand(command, description) {
  console.log(`${colors.blue}🔍 ${description}...${colors.reset}`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
    
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || error.message,
      error: error.stderr || error.message
    };
  }
}

/**
 * Main pre-commit validation process
 */
async function preCommitCheck() {
  console.log(`${colors.bold}${colors.blue}🚀 Pre-commit Blog Validation${colors.reset}\n`);
  
  let hasIssues = false;
  
  // Step 1: Validate all blog posts
  console.log(`${colors.bold}Step 1: Validating blog posts${colors.reset}`);
  const validation = runCommand('npm run blog:validate', 'Running blog validation');
  
  if (!validation.success) {
    console.log(`${colors.yellow}⚠️  Found validation issues${colors.reset}`);
    
    // Step 2: Attempt automatic repair
    console.log(`\n${colors.bold}Step 2: Attempting automatic repair${colors.reset}`);
    const repair = runCommand('npm run blog:repair', 'Running automatic repair');
    
    if (repair.success) {
      console.log(`${colors.green}✅ Automatic repair completed${colors.reset}`);
      
      // Step 3: Re-validate after repair
      console.log(`\n${colors.bold}Step 3: Re-validating after repair${colors.reset}`);
      const revalidation = runCommand('npm run blog:validate', 'Re-running validation');
      
      if (!revalidation.success) {
        console.log(`${colors.red}❌ Issues remain after repair${colors.reset}`);
        console.log(revalidation.output);
        hasIssues = true;
      } else {
        console.log(`${colors.green}✅ All issues resolved!${colors.reset}`);
        
        // Add repaired files to git
        console.log(`\n${colors.bold}Step 4: Adding repaired files to commit${colors.reset}`);
        try {
          execSync('git add blog/', { cwd: path.join(__dirname, '..') });
          console.log(`${colors.green}✅ Repaired blog files added to commit${colors.reset}`);
        } catch (error) {
          console.log(`${colors.yellow}⚠️  Could not add files to git: ${error.message}${colors.reset}`);
        }
      }
    } else {
      console.log(`${colors.red}❌ Automatic repair failed${colors.reset}`);
      console.log(repair.error || repair.output);
      hasIssues = true;
    }
  } else {
    console.log(`${colors.green}✅ All blog posts are valid${colors.reset}`);
  }
  
  // Final result
  if (hasIssues) {
    console.log(`\n${colors.red}${colors.bold}❌ Pre-commit check failed${colors.reset}`);
    console.log(`${colors.red}Please fix the remaining issues before committing.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}🎉 Pre-commit check passed!${colors.reset}`);
    console.log(`${colors.green}All blog posts are valid and ready for commit.${colors.reset}`);
  }
}

/**
 * CLI argument handling
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bold}Pre-commit Blog Validation Hook${colors.reset}

Usage: node scripts/pre-commit-blog-check.js

This script:
1. Validates all blog posts
2. Automatically repairs common issues (smart quotes, etc.)
3. Re-validates after repair
4. Adds repaired files to the git commit
5. Fails the commit if issues remain

Use this as a git pre-commit hook to ensure blog quality.

To install as a git hook:
  cp scripts/pre-commit-blog-check.js .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
`);
    return;
  }
  
  preCommitCheck().catch(error => {
    console.error(`${colors.red}❌ Pre-commit check failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { preCommitCheck };
