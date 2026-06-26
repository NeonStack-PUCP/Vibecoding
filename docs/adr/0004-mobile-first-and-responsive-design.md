# ADR 0004: Mobile-first and responsive design

## Status

Accepted

## Context

ReportaPe is designed for citizens who report urban problems while they are physically near the issue. In most cases, the user will use a smartphone to capture location, take photos, record audio, and submit or prepare the complaint.

However, the prototype must also work on desktop browsers for presentation, testing, and demonstration purposes.

## Decision

We decided to use a mobile-first design approach while keeping the web prototype responsive.

The experience will prioritize:

- Fast report creation from mobile.
- Audio capture.
- Photo evidence capture.
- Location selection.
- Simple step-by-step navigation.
- Clear Spanish copy.
- Large buttons and readable cards.
- Minimal cognitive load.

The desktop version will adapt the same flow using larger layouts, sidebars, maps, and preview panels.

## Consequences

### Positive

- Better fit for real citizen use.
- Easier evidence capture.
- More realistic MVP experience.
- Works for both mobile and desktop demonstrations.

### Negative

- More UI states must be considered.
- Map and form layouts must adapt across screen sizes.
- Some desktop components may need simplified mobile variants.
