# AI Commit Message Agent Guidelines

## Overview
This document provides comprehensive guidelines and best practices for the AI commit message agent to generate clear, consistent, and informative commit messages that enhance project maintainability, team collaboration, and automated tooling integration.

## 1. Commit Message Structure and Format

### Conventional Commits Standard
All commit messages must follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Subject Line Requirements
- **Character Limit**: Maximum 50 characters (prefer 40-45 for better display)
- **Capitalization**: Capitalize the first letter of the subject
- **No Period**: Do not end the subject line with a period
- **Imperative Mood**: Use imperative present tense ("Add" not "Added" or "Adds")
- **Clarity**: Be specific and descriptive about what the commit does

#### ✅ Good Examples:
```
feat(auth): Implement OAuth2 authentication flow
fix(api): Resolve memory leak in user session handling
docs(README): Update installation instructions for Windows
```

#### ❌ Bad Examples:
```
fixed stuff
Updated things
auth changes
WIP
```

### Body Guidelines
- **Line Length**: Wrap lines at 72 characters for optimal readability
- **Blank Line**: Always separate subject from body with a blank line
- **Content Focus**: Explain *what* and *why*, not *how*
- **Context**: Provide sufficient context for future developers
- **Multiple Paragraphs**: Use multiple paragraphs for complex changes

### Footer Guidelines
- **Breaking Changes**: Use `BREAKING CHANGE:` for breaking changes
- **Issue References**: Include `Fixes #123`, `Closes #456`, or `Relates to #789`
- **Co-authors**: Use `Co-authored-by: Name <email@example.com>` when applicable
- **Reviewers**: Reference reviewers when significant collaboration occurred

## 2. Commit Types and Scopes

### Primary Commit Types

#### **feat** - New Features
```
feat(dashboard): Add patient appointment scheduling
feat(api): Implement health coach matching algorithm
feat(mobile): Add offline data synchronization
```

#### **fix** - Bug Fixes
```
fix(auth): Prevent session timeout during file upload
fix(ui): Resolve calendar display issue on mobile devices
fix(api): Handle null reference in patient data retrieval
```

#### **docs** - Documentation Changes
```
docs(api): Add endpoint documentation for health metrics
docs(setup): Update Docker configuration instructions
docs(contributing): Add code review guidelines
```

#### **style** - Code Style Changes
```
style(components): Format React components with Prettier
style(api): Apply ESLint fixes to authentication module
style(css): Standardize button component styling
```

#### **refactor** - Code Refactoring
```
refactor(auth): Extract authentication logic into service layer
refactor(utils): Simplify date formatting helper functions
refactor(database): Optimize query structure for patient records
```

#### **perf** - Performance Improvements
```
perf(api): Implement caching for frequently accessed patient data
perf(mobile): Optimize image loading in appointment gallery
perf(database): Add indexes for patient search queries
```

#### **test** - Testing Changes
```
test(auth): Add unit tests for password validation
test(integration): Implement end-to-end appointment booking tests
test(utils): Add edge case tests for date calculations
```

#### **build** - Build System Changes
```
build(webpack): Update configuration for production deployment
build(docker): Optimize container size for mobile app builds
build(ci): Add automated security scanning to pipeline
```

#### **ci** - Continuous Integration Changes
```
ci(github): Add automated dependency updates workflow
ci(testing): Implement parallel test execution
ci(deployment): Configure staging environment deployment
```

#### **chore** - Maintenance and Other Changes
```
chore(deps): Update React Native to version 0.72.4
chore(cleanup): Remove deprecated API endpoints
chore(config): Update environment variables for production
```

### Digital Care Navigator Specific Scopes

#### Healthcare Domain Scopes
- `(patient)` - Patient-related functionality
- `(provider)` - Healthcare provider features
- `(appointment)` - Appointment scheduling and management
- `(health-metrics)` - Health data tracking and analytics
- `(coaching)` - Health coaching features
- `(telemedicine)` - Virtual visit functionality

#### Technical Scopes
- `(auth)` - Authentication and authorization
- `(api)` - Backend API endpoints
- `(database)` - Database schema and queries
- `(mobile)` - Mobile app specific changes
- `(web)` - Web interface changes
- `(notifications)` - Push notifications and alerts

#### Infrastructure Scopes
- `(security)` - Security-related changes
- `(monitoring)` - Logging and monitoring
- `(deployment)` - Deployment and infrastructure
- `(integration)` - Third-party service integrations

## 3. Content Guidelines and Best Practices

### Writing Effective Commit Messages

#### Subject Line Best Practices
1. **Start with Action Verb**: Begin with what the commit does
2. **Be Specific**: Avoid vague terms like "update," "change," or "fix"
3. **Use Domain Language**: Include relevant healthcare or technical terminology
4. **Avoid Acronyms**: Write out abbreviations for clarity

#### Body Content Guidelines
```
feat(appointment): Implement recurring appointment scheduling

This commit adds support for patients to schedule recurring 
appointments with their healthcare providers. The feature 
includes:

- Weekly, bi-weekly, and monthly recurrence patterns
- Automatic conflict detection with existing appointments
- Email notifications for recurring appointment reminders
- Provider approval workflow for recurring requests

The implementation uses a new RecurrencePattern model and
extends the existing AppointmentScheduler service to handle
the additional complexity of recurring schedules.

Fixes #234
Relates to #189
```

#### Healthcare-Specific Considerations
- **Patient Privacy**: Ensure no PHI (Personal Health Information) in commit messages
- **Compliance References**: Include relevant compliance considerations (HIPAA, etc.)
- **Clinical Context**: Provide healthcare context when relevant for clinical features
- **Security Implications**: Highlight security considerations for healthcare data

### Atomic Commit Principles

#### One Logical Change Per Commit
```
✅ Good - Separate commits:
feat(auth): Add two-factor authentication
test(auth): Add two-factor authentication tests
docs(auth): Document two-factor authentication setup

❌ Bad - Multiple unrelated changes:
chore: Fix auth bug, update docs, and refactor database
```

#### Include Related Changes
- Include test updates in feature commits when directly related
- Include documentation updates for new public APIs
- Include configuration changes required for the feature

### Breaking Changes Documentation

#### Breaking Change Format
```
feat(api): Restructure patient data response format

BREAKING CHANGE: The patient API response structure has been 
updated to improve consistency and reduce payload size.

Migration Guide:
- Update client code to use `patient.personalInfo.name` 
  instead of `patient.name`
- Update `patient.contactDetails.phone` instead of `patient.phone`
- Remove references to deprecated `patient.metadata` field

The old format will be supported until v2.0.0 with deprecation
warnings. See migration guide in docs/api-migration.md for 
complete details.

Fixes #456
```

## 4. Security and Compliance Guidelines

### Security-Related Commits
```
security(auth): Implement rate limiting for login attempts
security(api): Add input validation for patient data endpoints  
security(database): Encrypt sensitive patient information fields
```

### Compliance Documentation
```
feat(audit): Implement HIPAA-compliant audit logging

This commit adds comprehensive audit logging to track all
access to patient health information as required by HIPAA
compliance standards.

Features:
- Log all PHI access with user identification
- Tamper-proof audit trail storage
- Automated compliance reporting
- Failed access attempt monitoring

Compliance: HIPAA §164.312(b)
Security-Impact: High - affects all patient data access
```

### Sensitive Information Guidelines
- **Never commit**: Passwords, API keys, personal data, or test patient information
- **Use placeholders**: Reference configuration files or environment variables
- **Sanitize examples**: Use fictional data in commit messages and documentation

## 5. Integration and Automation

### Issue Tracking Integration

#### GitHub Integration Keywords
```
Fixes #123          # Closes the issue
Closes #456         # Closes the issue  
Resolves #789       # Closes the issue
Relates to #101     # Links without closing
Implements #202     # Links feature request
Addresses #303      # Links partially resolved issue
```

#### Jira Integration (if applicable)
```
feat(patient): Add patient search functionality

Implements advanced patient search with filtering capabilities
including name, date of birth, and medical record number.

JIRA: DCN-234
```

### Automated Changelog Generation

#### Conventional Commits for Automation
The commit format enables automated:
- **Changelog Generation**: Automatic release notes from commit history
- **Semantic Versioning**: Automatic version bumping based on commit types
- **Release Management**: Automated release workflows
- **Documentation Updates**: Auto-generated API documentation updates

#### Example Generated Changelog
```markdown
# Changelog

## [1.2.0] - 2025-09-22

### Features
- **patient**: Add recurring appointment scheduling (#234)
- **telemedicine**: Implement virtual waiting room (#245)
- **notifications**: Add SMS appointment reminders (#251)

### Bug Fixes
- **auth**: Resolve session timeout during file upload (#239)
- **mobile**: Fix calendar display on small screens (#242)

### Performance Improvements
- **api**: Implement Redis caching for patient queries (#247)
```

### Git Hooks and Validation

#### Pre-commit Hook Template
```bash
#!/bin/sh
# .git/hooks/commit-msg

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# Validate conventional commit format
pattern="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|security)(\(.+\))?: .{1,50}$"

if ! echo "$commit_msg" | head -n1 | grep -qE "$pattern"; then
    echo "❌ Invalid commit message format!"
    echo "Format: <type>(<scope>): <subject>"
    echo "Example: feat(auth): Implement OAuth2 authentication"
    exit 1
fi

# Check for sensitive information
if echo "$commit_msg" | grep -qiE "(password|secret|key|token)"; then
    echo "⚠️  Warning: Commit message may contain sensitive information"
    echo "Please review and ensure no secrets are exposed"
fi

echo "✅ Commit message format is valid"
```

## 6. Templates and Tools

### Commit Message Template
Create `~/.gitmessage`:
```
# <type>(<scope>): <subject> (max 50 chars)
# |<----  Using a Maximum Of 50 Characters  ---->|

# Explain why this change is being made
# |<----   Try To Limit Each Line to a Maximum Of 72 Characters   ---->|

# Provide links or keys to any relevant tickets, articles or other resources
# Example: Fixes #23

# --- COMMIT END ---
# Type can be:
#    feat     (new feature)
#    fix      (bug fix)
#    docs     (changes to documentation)
#    style    (formatting, missing semi colons, etc; no code change)
#    refactor (refactoring production code)
#    test     (adding missing tests, refactoring tests; no production code change)
#    chore    (updating grunt tasks etc; no production code change)
#    perf     (performance improvements)
#    build    (build system or external dependencies)
#    ci       (CI configuration changes)
#    security (security-related changes)
# --------------------
# Remember to:
#    - Use the imperative mood in the subject line
#    - Do not end the subject line with a period
#    - Capitalize the subject line and each paragraph
#    - Use the body to explain what and why vs. how
#    - Separate subject from body with a blank line
```

### VS Code Integration
Add to `.vscode/settings.json`:
```json
{
  "git.inputValidation": "always",
  "git.inputValidationLength": 50,
  "git.inputValidationSubjectLength": 50,
  "scm.inputFontSize": 14,
  "scm.inputMinLineCount": 3
}
```

### Commitlint Configuration
Create `commitlint.config.js`:
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'security'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'patient',
        'provider',
        'appointment',
        'health-metrics',
        'coaching',
        'telemedicine',
        'auth',
        'api',
        'database',
        'mobile',
        'web',
        'notifications',
        'security',
        'monitoring',
        'deployment',
        'integration'
      ]
    ],
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72]
  }
};
```

## 7. Quality Assurance and Review

### Self-Review Checklist
Before committing, verify:
- [ ] Commit type accurately reflects the change
- [ ] Scope is appropriate and specific
- [ ] Subject line is under 50 characters
- [ ] Subject line uses imperative mood
- [ ] Body explains why, not just what
- [ ] No sensitive information included
- [ ] Issue references are correct
- [ ] Breaking changes are properly documented
- [ ] Tests are included where appropriate

### Common Mistakes to Avoid

#### Vague Commit Messages
```
❌ Bad:
fix: bug fix
feat: new feature
chore: updates

✅ Good:
fix(auth): Prevent duplicate session creation on rapid login
feat(dashboard): Add real-time patient vital monitoring
chore(deps): Update React Native to address security vulnerability
```

#### Mixing Unrelated Changes
```
❌ Bad:
feat: Add patient search and fix login bug and update docs

✅ Good:
feat(patient): Add advanced patient search functionality
fix(auth): Resolve login timeout issue
docs(api): Update authentication endpoint documentation
```

#### Insufficient Context
```
❌ Bad:
fix(api): Handle edge case

✅ Good:
fix(api): Handle null patient ID in appointment booking

When a patient ID is null during appointment booking, the API
would throw an unhandled exception. This change adds proper
validation and returns a 400 Bad Request with a descriptive
error message.

Fixes #567
```

## 8. Monitoring and Improvement

### Metrics to Track
- **Commit Message Quality**: Regular audits of commit message clarity and completeness
- **Convention Adherence**: Percentage of commits following the conventional format
- **Issue Linking**: Percentage of commits properly linked to issues
- **Breaking Change Documentation**: Completeness of breaking change descriptions

### Regular Review Process
- **Monthly Reviews**: Team review of commit message quality and consistency
- **Guideline Updates**: Regular updates based on team feedback and new tools
- **Training Sessions**: Ongoing education for team members on best practices
- **Tool Integration**: Continuous improvement of automated validation and assistance

### Success Indicators
- Improved code review efficiency through clear commit history
- Faster debugging through descriptive commit messages
- Successful automated changelog and release management
- Enhanced team collaboration through consistent communication

---

*This document should be reviewed and updated regularly to reflect evolving team practices and project requirements. Last updated: September 22, 2025*
