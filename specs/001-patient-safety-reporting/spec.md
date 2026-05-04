# Feature Specification: Patient Safety Reporting

**Feature Branch**: `N/A`
**Created**: 2026-05-03
**Status**: Draft
**Input**: User description: "Prototipo de un Sistema de Gestion de Seguridad del Paciente llamado ENTORNOS SEGUROS. Se necesita un autenticacion basica con email y clave, opciones de registrarse y recuperar clave. Un dashboard base para navegar entre los modulos. Un modulo de Registrar Eventos de Seguridad del Paciente, donde un profesional de salud sin importar el rol (auxiliares, enfermeros, bacteriologos, medicos, odontologos, instrumentador quirurgico, psicologo) pueda registrar un evento de seguridad del paciente y norificarlo via email a su superior. La historia de usuario seria: Yo como profesional de la salud quiero reportar eventos de seguridad del paciente para que quede registro del mismo y luego se puedan tomar acciones.
- La información registrada queda almacenada.
- Dado que el usuario hizo login, queda almacenado automáticamente quién realizó el reporte.
- Se incluye información del paciente afectado para generar trazabilidad.
- Se incluye información básica de día, hora y lugar de ocurrencia.
- Se incluye servicio prestado en el cual sucedió el evento.
- Puedo contar en mis palabras lo que sucedió.
- Al finalizar el reporte, se dispara el envío de notificación de un nuevo evento reportado.
- Al finalizar el reporte, se regresa automáticamente a la pantalla principal."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Report patient safety event (Priority: P1)

A logged-in healthcare professional uses the event reporting module to capture a patient safety incident, ensuring the incident is stored, traceable, and escalated to a supervisor.

**Why this priority**: This is the core feature that delivers the main value of the system: capturing safety incidents and enabling follow-up actions.

**Independent Test**: Login, submit a new safety event with patient and occurrence details, and verify the report is saved, the reporter identity is recorded, an email notification is triggered, and the user returns to the main dashboard.

**Acceptance Scenarios**:

1. **Given** a logged-in health professional, **When** they complete the patient safety event form with patient data, date, time, place, service, and narrative, **Then** the event is stored and the supervisor notification is triggered.
2. **Given** a valid event submission, **When** the report is accepted, **Then** the system records the identity of the current user automatically and returns the user to the dashboard.

---

### User Story 2 - Account access and recovery (Priority: P2)

A new or returning user can create an account, sign in with email and password, and recover access if they forget their password.

**Why this priority**: Authentication and account recovery are required to secure access and enable any safety report workflow.

**Independent Test**: Register a new account, sign in with the new credentials, and request a password recovery instruction to verify the workflow is functional.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they register with email and password, **Then** a new account is created and they can sign in immediately.
2. **Given** a user who cannot remember their password, **When** they request recovery, **Then** the system sends password recovery guidance to the registered email.

---

### User Story 3 - Base dashboard navigation (Priority: P3)

A signed-in user can access a dashboard that provides navigation to available modules, including the event reporting workflow.

**Why this priority**: A clear dashboard provides context, reduces friction, and connects authentication to the reporting module.

**Independent Test**: Sign in, open the dashboard, and verify that the dashboard shows a module for patient safety event reporting and a path to the registration form.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they arrive at the home screen, **Then** they can see dashboard navigation options and access the safety event registration module.

---

### Edge Cases

- Submitting the safety event form with missing required fields should show validation feedback and prevent saving.
- If email notification fails after a successful save, the event should still be stored and the user should receive a clear warning that notification delivery must be retried.
- A user attempts to register with an already registered email; the system should provide a duplicate account error.
- The in-memory storage resets when the application restarts, so persistence is valid only for the current runtime session.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to sign in using email and password.
- **FR-002**: System MUST allow new users to register an account with email and password.
- **FR-003**: System MUST provide a password recovery workflow for users who forget their password.
- **FR-004**: System MUST present a base dashboard after sign in, with navigation to the patient safety reporting module.
- **FR-005**: System MUST allow any authenticated healthcare professional role to submit a patient safety event.
- **FR-006**: System MUST store each reported event with the current user as the reporter.
- **FR-007**: System MUST collect patient details, date, time, location, service, and a narrative description for each event.
- **FR-008**: System MUST trigger a notification to a supervisor when a new event is successfully reported.
- **FR-009**: System MUST redirect the user back to the main dashboard after successful event submission.
- **FR-010**: System MUST preserve event traceability by associating the report with the affected patient and occurrence metadata.

### Key Entities *(include if feature involves data)*

- **User**: A healthcare professional who signs in, registers events, and whose identity is recorded with each report.
- **Patient**: The affected patient whose identifying fields are captured for traceability.
- **Safety Event**: A reported incident that contains patient details, occurrence metadata, service context, reporter identity, and narrative description.
- **Notification**: A supervisor-facing alert generated after a safety event is recorded.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can sign in, register, or recover access with email and password without requiring code changes.
- **SC-002**: A logged-in health professional can submit a patient safety event with required fields and receive confirmation within the same flow.
- **SC-003**: Every successfully submitted safety event stores reporter identity, patient traceability, occurrence date/time/place, service context, and narrative.
- **SC-004**: The system triggers a supervisor notification for at least 95% of successful event submissions under normal conditions.
- **SC-005**: Users are returned to the dashboard automatically within 3 seconds after a successful event report.
- **SC-006**: The dashboard clearly exposes the event reporting module and supports navigation for authenticated users.

## Assumptions

- The prototype uses in-memory persistence; data remains available only while the application is running.
- Supervisor notification delivery may be implemented as an email gateway or simulated email output for prototype validation.
- All listed healthcare professional roles are allowed to report safety events without additional role-based restrictions.
- The base dashboard is sufficient for navigation; advanced analytics and administration are out of scope for this feature.
- The user experience and visual styling are guided by DESIGN.md, with a focus on consistency, accessibility, and responsive behavior.
