# ADR 0006: Community support and complaint tracking

## Status

Accepted

## Context

Many neighborhood problems affect more than one citizen. A single complaint can become stronger when other neighbors support it. Also, citizens need a simple way to remember and track their submitted or prepared complaints.

ReportaPe should not only generate isolated reports. It should allow cases to remain visible on a civic map, receive support, and store tracking information.

## Decision

We decided to include community support and tracking as core features of the MVP.

Each report can store:

- Report category.
- District.
- Address or approximate location.
- Evidence.
- Generated complaint text.
- Official channel.
- Tracking code.
- Status.
- Support count.

Citizens can:

- View reports on a map.
- Open report details.
- Support a report.
- Share the case.
- Save or consult a tracking code.
- See when a case reaches a support threshold.

If a report reaches a defined support threshold, the UI will show that it can escalate as a collective request.

## Consequences

### Positive

- Encourages community participation.
- Makes recurring problems more visible.
- Supports collective pressure.
- Adds continuity after the complaint is created.

### Negative

- Real implementation will require user/session control to prevent duplicate support.
- Tracking depends on the official municipal channel.
- Future versions may need moderation to avoid spam or false reports.
