# Data Model: Patient Safety Reporting

## Entities

### User
Represents an authenticated healthcare professional.

- `id`: string (UUID)
- `email`: string
- `passwordHash`: string
- `role`: string
- `createdAt`: string (ISO timestamp)

### Patient
Represents the patient affected by the reported event.

- `id`: string (UUID)
- `firstName`: string
- `lastName`: string
- `clinicalHistoryNumber`: string
- `documentType`: string
- `documentNumber`: string
- `birthDate`: string (ISO date)

### SafetyEvent
Represents a reported patient safety incident.

- `id`: string (UUID)
- `patientId`: string
- `reporterId`: string
- `service`: string
- `location`: string
- `occurredAt`: string (ISO datetime)
- `description`: string
- `notificationStatus`: `pending` | `sent` | `failed`
- `notificationError`: string | null
- `createdAt`: string (ISO timestamp)

### NotificationConfig
Prototype configuration for supervisor notification.

- `supervisorEmail`: string

## Relationships

- One `User` can create many `SafetyEvent` records.
- One `Patient` can be associated with many `SafetyEvent` records.
- Each `SafetyEvent` links a reporter (`User`) and an affected patient (`Patient`).

## Validation Rules

- `email`: valid email format, required
- `passwordHash`: required for stored accounts
- `firstName`, `lastName`, `clinicalHistoryNumber`, `documentType`, `documentNumber`: required for patient traceability
- `occurredAt`: required; must include date and time
- `location`: required
- `service`: required
- `description`: required, maximum 15000 characters
- `supervisorEmail`: required in configuration for notification delivery

## Traceability and State

- `SafetyEvent` records maintain a complete audit trail of the reporter, patient, service, location, and timestamp.
- `notificationStatus` captures whether supervisor notification succeeded or failed.
- If notification fails, the event remains stored and retains `notificationError` details for later inspection.
