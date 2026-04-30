# Security Policy

## Supported versions

Only the latest tagged release is actively supported.

## Reporting a vulnerability

If you find a security issue — for example, a way to escape the local
storage namespace, an XSS in a user-supplied value (imported palette
name, custom hex), or a way to leak data from another origin — please
**don't open a public GitHub issue.**

Instead, email **jeff.alldridge@gmail.com** with:

- A description of the issue
- Steps to reproduce
- Your suggested severity rating

You should expect a response within a few days. Once the issue is fixed
and released, you'll be credited in the changelog (unless you'd rather
stay anonymous).

## Threat model

This is a fully static client-side web app. It:

- Runs entirely in the user's browser
- Reads and writes only the user's own `localStorage`
- Does not phone home, log telemetry, or call any external API
- Does not accept user uploads (only text paste / drag-drop into the
  Import field)

Practical attack surface is therefore narrow:

- Parsing untrusted text in the Import panel (CSS, Tailwind, hex, JSON)
- DOM rendering of user-controlled strings (color names, custom hex)
- localStorage parsing on app boot

Issues outside this scope (e.g. browser-engine bugs, OS-level concerns)
are usually better reported upstream.
