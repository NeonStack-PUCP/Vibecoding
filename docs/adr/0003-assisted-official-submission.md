# ADR 0003: Assisted official submission instead of automatic municipal submission

## Status

Accepted

## Context

Municipal portals in Peru often require user confirmation, CAPTCHA, session fields, dynamic forms, or login credentials. For example, some municipal complaint forms use CAPTCHA and dynamic web fields that cannot be bypassed ethically or reliably.

ReportaPe should not claim that it can automatically submit complaints to official municipal portals when those portals require citizen confirmation.

## Decision

We decided that ReportaPe will use an assisted official submission model.

The app will:

- Prepare the complaint information.
- Generate a formal complaint message.
- Show the official channel.
- Allow the user to copy the prepared data.
- Allow the user to download or preview the expediente.
- Open the official municipal portal.
- Inform the user when CAPTCHA or confirmation is required.
- Let the user save the tracking code after registration.

The app will not:

- Bypass CAPTCHA.
- Submit complaints without citizen confirmation.
- Pretend that a case was officially registered if it was only prepared inside ReportaPe.
- Store or misuse municipal login credentials.

## Consequences

### Positive

- More transparent and ethical process.
- Avoids legal or technical risks from bypassing municipal systems.
- Keeps the citizen in control of the official submission.
- Makes the MVP realistic for Peruvian municipal portals.

### Negative

- The flow requires one extra step from the user.
- The app cannot always guarantee official submission.
- Some tracking codes must be entered manually by the user.

## User-facing message

The app must show a message similar to:

> El portal oficial de la municipalidad puede requerir CAPTCHA y confirmación del ciudadano. ReportaPe prepara tu queja y te guía para completar el registro oficial de forma segura.
