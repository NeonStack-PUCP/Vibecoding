# ADR 0001: Frontend-only prototype for the MVP

## Status

Accepted

## Context

ReportaPe is being developed as a civic technology prototype focused on validating the user experience, the complaint flow, and the value proposition before implementing real backend services or municipal integrations.

The project must demonstrate how a citizen can report a neighborhood issue, provide evidence, receive AI-assisted guidance, generate a formal complaint preview, and track the case.

At this stage, implementing a real backend, database, file storage, authentication, AI API integration, or municipal portal integration would increase complexity and development time.

## Decision

We decided to build the MVP as a frontend-only prototype using mocked data and simulated interactions.

The prototype will simulate:

- Report creation.
- Audio transcription.
- AI analysis.
- Municipal category detection.
- Evidence upload.
- Formal complaint preview.
- Assisted official submission.
- Tracking code generation.
- Map publication.
- Community support.

The prototype will not implement:

- Real backend.
- Real database.
- Real authentication.
- Real file storage.
- Real municipal submissions.
- Real CAPTCHA solving.
- Real AI API calls.

## Consequences

### Positive

- Faster development.
- Easier demonstration during the hackathon.
- Lower technical risk.
- Better focus on product validation and user experience.
- The team can test the full journey without depending on external services.

### Negative

- Data is not persistent in a real database.
- Official complaints are not actually submitted.
- AI and tracking behaviors are simulated.
- Future work will require backend and real integrations.

## Related decisions

- ADR 0002: AI-assisted complaint flow.
- ADR 0003: Assisted official submission.
