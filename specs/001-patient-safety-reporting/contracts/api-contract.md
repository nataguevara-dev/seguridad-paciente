# API Contract: Patient Safety Reporting

## Base URL

`/api`

## Endpoints

### POST /api/auth/register
Register a new health professional account.

Request body:

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

Response:

```json
{
  "id": "string",
  "email": "user@example.com"
}
```

### POST /api/auth/login
Authenticate a user with email and password.

Request body:

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

Response:

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "user@example.com",
    "role": "enfermero"
  }
}
```

### POST /api/auth/recover
Request password recovery instructions.

Request body:

```json
{
  "email": "user@example.com"
}
```

Response:

```json
{
  "message": "Recovery instructions sent if the email exists."
}
```

### GET /api/auth/me
Return the current authenticated user.

Response:

```json
{
  "id": "string",
  "email": "user@example.com",
  "role": "enfermero"
}
```

### POST /api/events
Create a patient safety event report.

Request body:

```json
{
  "patient": {
    "firstName": "Ana",
    "lastName": "Pérez",
    "clinicalHistoryNumber": "12345",
    "documentType": "Cédula de ciudadanía",
    "documentNumber": "987654321",
    "birthDate": "1990-01-01"
  },
  "service": "Urgencias",
  "location": "Hospital Central - Sala 3",
  "occurredAt": "2026-05-03T14:30:00Z",
  "description": "Descripción detallada del evento..."
}
```

Response:

```json
{
  "id": "string",
  "patientId": "string",
  "reporterId": "string",
  "notificationStatus": "sent",
  "createdAt": "string"
}
```

### GET /api/events
List reported patient safety events.

Response:

```json
[
  {
    "id": "string",
    "patientId": "string",
    "reporterId": "string",
    "service": "Urgencias",
    "location": "Hospital Central - Sala 3",
    "occurredAt": "2026-05-03T14:30:00Z",
    "description": "Descripción detallada del evento...",
    "notificationStatus": "sent",
    "createdAt": "string"
  }
]
```

## Error format

All errors use the same payload structure:

```json
{
  "error": "string",
  "details": ["string"]
}
```
