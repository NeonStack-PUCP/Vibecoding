# ADR 0002: AI-assisted complaint flow using audio and structured extraction

## Status

Accepted

## Context

Citizens often do not know how to write a formal complaint or what information a municipality requires. Many complaints are incomplete because they lack address, reference, impact, evidence, or a clear requested action.

ReportaPe aims to reduce friction by allowing the citizen to explain the problem naturally through audio or text. The system then structures the information into a formal complaint format.

## Decision

We decided that the complaint creation flow will be assisted by AI.

The user can:

1. Select the type of problem.
2. Record an audio or write a description.
3. Review the generated transcript.
4. Let the system extract relevant fields.
5. Complete only missing data.
6. Review a formal complaint preview.

The AI-assisted flow will extract:

- Exact address.
- Visible reference.
- Problem type.
- Specific details.
- Approximate date or time.
- Frequency.
- Impact.
- Known responsible party, if any.
- Requested action.
- Suggested municipal category.
- Confidence level.

## Consequences

### Positive

- Faster complaint creation.
- Less manual typing for the citizen.
- More complete reports.
- Better alignment with municipal requirements.
- More accessible experience for users with low technical knowledge.

### Negative

- AI may extract incomplete or incorrect information.
- The user must always review and approve the generated complaint.
- The MVP must clearly show when data is missing.
- Future real implementation will require AI service integration and error handling.

## Design constraint

All AI-generated user-facing content must be shown in Spanish and must be editable before submission.
