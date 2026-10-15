# Security Policy

## Reporting a Vulnerability

If you discover a security issue in Orbe Runner 3D, please report it responsibly rather than opening a public issue.

Send an email to **aitor.mendoza@naindev.com** with:
- Description of the vulnerability and its potential impact.
- Steps to reproduce or proof of concept.
- Remediation suggestions if available.

Reports will receive an initial response within 48 hours.

## Security Model and Posture

Orbe Runner 3D is a client-side WebGL application served as static files:
- **Zero Remote Dependencies at Runtime:** No external CDNs, tracking analytics, or dynamic script injection.
- **Client Isolation:** The game operates entirely in the browser DOM and WebGL context with no server-side execution or persistent user data transmission.
- **Resource Integrity:** Assets (geometry, materials, sound) are procedurally generated in-memory without loading external binary assets or untrusted content.
