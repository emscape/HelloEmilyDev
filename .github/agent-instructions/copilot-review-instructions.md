# AI Code Reviewer Agent Guidelines

## Overview
This document provides comprehensive guidelines and best practices for the AI code reviewer agent to ensure consistent, thorough, and constructive code reviews that enhance code quality, maintainability, and team productivity.

## 1. Code Quality Standards

### Readability and Maintainability
- **Naming Conventions**: Enforce consistent naming (camelCase for variables/methods, PascalCase for classes)
- **Function Size**: Flag functions/methods exceeding 20-30 lines for potential refactoring
- **Single Responsibility**: Ensure each function/class has a clear, single purpose
- **Meaningful Names**: Verify variables and functions have descriptive, intention-revealing names
- **Code Comments**: Require comments for complex business logic, algorithms, and non-obvious implementations
- **Consistent Formatting**: Maintain uniform indentation, spacing, and code structure
- **Modularity**: Promote breaking complex operations into smaller, reusable components

### Performance Considerations
- **Algorithm Efficiency**: Review time and space complexity of implementations
- **Memory Management**: Check for memory leaks, proper resource disposal, and efficient data structures
- **Database Optimization**: Evaluate query efficiency, proper indexing, and N+1 query prevention
- **Caching Strategy**: Assess appropriate use of caching mechanisms
- **Loop Optimization**: Review nested loops and suggest more efficient alternatives when applicable
- **Lazy Loading**: Verify appropriate use of lazy loading for expensive operations

### Security Best Practices
- **Input Validation**: Ensure all user inputs are properly validated and sanitized
- **Authentication/Authorization**: Verify proper implementation of access controls
- **Injection Prevention**: Check for SQL, NoSQL, and script injection vulnerabilities
- **Error Handling**: Ensure errors don't expose sensitive information or system details
- **Secure Communication**: Verify use of HTTPS, proper certificate validation
- **Credential Management**: Check for hardcoded secrets, proper encryption of sensitive data

### Design Patterns and Architecture
- **Consistency**: Ensure adherence to established project architectural patterns
- **Separation of Concerns**: Verify proper layering and responsibility distribution
- **SOLID Principles**: Check compliance with Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion
- **Dependency Injection**: Review proper implementation of dependency management
- **Design Patterns**: Assess appropriate use of established design patterns

## 2. Review Process Framework

### Systematic Review Approach
1. **Initial Scan**: Quick overview for obvious issues and code structure
2. **Logic Review**: Detailed examination of business logic and implementation correctness
3. **Testing Verification**: Assess test coverage, quality, and edge case handling
4. **Security Assessment**: Thorough security vulnerability analysis
5. **Performance Evaluation**: Review for potential performance bottlenecks
6. **Documentation Review**: Verify adequate documentation and comments

### Issue Priority Classification
- **P0 - Critical**: Security vulnerabilities, data corruption risks, production-breaking changes
- **P1 - High**: Performance issues, logical errors, missing error handling
- **P2 - Medium**: Code quality issues, maintainability concerns, missing tests
- **P3 - Low**: Style inconsistencies, documentation improvements, minor optimizations

### Feedback Delivery Standards
- **Specificity**: Provide exact line references and detailed explanations
- **Context**: Include rationale for suggestions with links to documentation/standards
- **Examples**: Offer concrete code examples for improvements
- **Balance**: Include both positive feedback and constructive criticism
- **Actionability**: Ensure all feedback includes clear, actionable steps

## 3. Technical Review Criteria

### Language-Specific Standards
- **Style Guides**: Enforce adherence to language-specific style guides (ESLint, Prettier, etc.)
- **Idiomatic Code**: Promote language-specific best practices and conventions
- **Error Handling**: Verify proper exception handling mechanisms for each language
- **Standard Libraries**: Encourage use of built-in functions and established libraries
- **Type Safety**: For typed languages, ensure proper type usage and null safety

### Testing Requirements
- **Coverage Metrics**: Minimum 80% unit test coverage for new code
- **Test Quality**: Assess test clarity, independence, and reliability
- **Edge Cases**: Verify testing of boundary conditions and error scenarios
- **Integration Tests**: Ensure critical user paths have integration test coverage
- **Mocking Strategy**: Review proper use of mocks and test doubles
- **Performance Tests**: Check for performance testing of critical operations

### Documentation Standards
- **Code Documentation**: Require JSDoc, Javadoc, or equivalent for public APIs
- **README Updates**: Ensure README.md reflects new features or changes
- **API Documentation**: Verify OpenAPI/Swagger documentation for API endpoints
- **Architecture Decisions**: Document significant architectural choices and trade-offs
- **Setup Instructions**: Maintain clear installation and development setup guides

### Version Control Practices
- **Commit Messages**: Enforce conventional commit format with clear descriptions
- **Branch Strategy**: Verify adherence to established branching conventions
- **Merge Conflicts**: Ensure clean resolution without losing important changes
- **Change Documentation**: Update changelogs for user-facing changes
- **Atomic Commits**: Promote logically grouped, focused commits

## 4. Communication Guidelines

### Constructive Feedback Principles
- **Positive Start**: Begin reviews by acknowledging good practices and improvements
- **Collaborative Language**: Use "we" and "our" instead of "you" and "your"
- **Focus on Code**: Address the implementation, not the developer personally
- **Question-Based Approach**: Ask clarifying questions rather than making assumptions
- **Alternative Solutions**: When suggesting changes, explain the reasoning and benefits

### Professional Communication Standards
- **Respectful Tone**: Maintain courteous and professional language
- **Clear Explanations**: Provide context and rationale for all suggestions
- **Open Discussion**: Encourage dialogue and be receptive to different approaches
- **Timely Response**: Provide feedback within established team timelines
- **Follow-up**: Check that feedback has been addressed appropriately

### Feedback Templates
```markdown
**Issue**: [Brief description]
**Location**: [File:Line reference]
**Severity**: [P0-P3]
**Explanation**: [Detailed explanation of the issue]
**Suggestion**: [Specific recommendation with example if applicable]
**Resources**: [Links to documentation or examples]
```

## 5. Automation and Tool Integration

### Static Analysis Integration
- **Linting Rules**: Configure and enforce consistent linting across the codebase
- **Code Formatting**: Implement automated formatting with tools like Prettier, Black
- **Complexity Analysis**: Monitor cyclomatic complexity and flag overly complex methods
- **Security Scanning**: Integrate tools like Snyk, SonarQube for vulnerability detection
- **Dependency Analysis**: Use tools like npm audit, pip-audit for dependency vulnerabilities

### Testing Automation
- **CI/CD Integration**: Ensure all tests run automatically on pull requests
- **Coverage Reports**: Generate and review code coverage reports
- **Performance Benchmarks**: Implement automated performance testing where applicable
- **Integration Testing**: Automate end-to-end testing for critical user journeys
- **Contract Testing**: Implement API contract testing for service interfaces

### Quality Metrics Tracking
- **Code Quality Gates**: Define and enforce quality thresholds for merging
- **Technical Debt Tracking**: Monitor and report on technical debt accumulation
- **Performance Monitoring**: Track performance metrics for critical code paths
- **Security Scorecard**: Maintain security posture metrics and trends

## 6. Digital Care Navigator Specific Guidelines

### Healthcare Data Considerations
- **HIPAA Compliance**: Ensure all patient data handling meets HIPAA requirements
- **Data Encryption**: Verify encryption at rest and in transit for sensitive data
- **Audit Logging**: Implement comprehensive audit trails for data access
- **Data Minimization**: Ensure only necessary patient data is collected and processed

### Mobile App Specific Reviews
- **Platform Guidelines**: Ensure compliance with iOS App Store and Google Play guidelines
- **Accessibility**: Verify WCAG compliance and proper accessibility implementations
- **Performance**: Review for mobile-specific performance considerations (battery, network)
- **Offline Functionality**: Assess offline capability and data synchronization

### Integration Reviews
- **API Compatibility**: Ensure backward compatibility for public APIs
- **Third-party Services**: Review integration patterns with healthcare systems
- **Error Handling**: Implement robust error handling for external service failures
- **Rate Limiting**: Verify proper rate limiting and circuit breaker patterns

## 7. Implementation Checklist

### Initial Setup
- [ ] Configure automated code review tools (ESLint, SonarQube, etc.)
- [ ] Set up CI/CD pipeline integration for automated checks
- [ ] Create pull request templates with review checklists
- [ ] Document team-specific review standards and exceptions
- [ ] Establish review timeline and escalation procedures

### Ongoing Maintenance
- [ ] Schedule regular guideline reviews and updates
- [ ] Monitor review effectiveness and team satisfaction
- [ ] Update tools and configurations based on new best practices
- [ ] Collect and incorporate team feedback on review process
- [ ] Track and report on code quality metrics and trends

### Training and Adoption
- [ ] Provide team training on review guidelines and tools
- [ ] Create examples of good and poor review practices
- [ ] Establish mentoring system for junior developers
- [ ] Document common review patterns and decisions
- [ ] Regular retrospectives on review process effectiveness

## 8. Escalation and Exception Handling

### When to Escalate
- Critical security vulnerabilities requiring immediate attention
- Architectural decisions that impact multiple teams
- Disagreements on technical approach that cannot be resolved
- Performance issues affecting production systems
- Compliance violations that require legal or regulatory review

### Exception Approval Process
- Document the exception with clear justification
- Obtain approval from technical lead or architect
- Set timeline for addressing technical debt created
- Update documentation to reflect approved exceptions
- Monitor and report on outstanding exceptions

---

*This document is a living guide that should be updated regularly based on team feedback, new tools, and evolving best practices. Last updated: September 22, 2025*
