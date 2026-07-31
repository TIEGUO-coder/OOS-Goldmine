# Security Policy

## Supported Versions

OSS Goldmine is currently an MVP.

| Version | Supported |
| --- | --- |
| main | Yes |

## Reporting a Vulnerability

Please do not open a public issue for sensitive vulnerabilities.

For now, create a private report through GitHub's security advisory flow if available, or contact the repository owner directly.

## Token Handling

OSS Goldmine accepts an optional GitHub token only to increase GitHub API rate limits.

Current MVP behavior:

- The server token is read from environment variables when the API is deployed.
- User-provided browser tokens are used only for GitHub API requests.
- Tokens are not stored in a database.

Do not paste tokens into issues, screenshots, pull requests, or public demos.
