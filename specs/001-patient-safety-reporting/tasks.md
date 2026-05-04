# Tasks: Patient Safety Reporting

**Input**: Design documents from `/specs/001-patient-safety-reporting/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create frontend project structure in frontend/
- [X] T002 Create backend project structure in backend/
- [X] T003 Initialize Bun and Angular dependencies in backend/bunfig.toml and frontend/package.json
- [X] T004 Configure Tailwind CSS scaffolding in frontend/src/styles/
- [X] T005 [P] Add base repository configuration files in .gitignore and .github/copilot-instructions.md

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T006 Setup backend Express application and in-memory Better-SQLite3 initialization in backend/src/startup.ts
- [ ] T007 [P] Implement backend data models in backend/src/models/user.ts and backend/src/models/patient.ts
- [ ] T008 [P] Implement backend data models in backend/src/models/safety-event.ts and backend/src/models/notification-config.ts
- [X] T009 Create backend configuration and supervisor email settings in backend/src/config.ts
- [X] T010 Implement shared backend validation and error response helpers in backend/src/shared/validation.ts
- [X] T011 Implement backend persistence repository for users and patients in backend/src/repositories/user-repository.ts and backend/src/repositories/patient-repository.ts
- [X] T012 Implement backend repository for safety events in backend/src/repositories/event-repository.ts
- [X] T013 Implement backend authentication service in backend/src/services/auth-service.ts
- [X] T014 Implement backend notification service in backend/src/services/notification-service.ts

---

## Phase 3: User Story 1 - Report patient safety event (Priority: P1)

**Goal**: Allow a logged-in healthcare professional to register a safety event and notify a supervisor.

**Independent Test**: Login, complete the event form, submit, and verify the report is stored, reporter identity is recorded, supervisor notification is attempted, and the app returns to the dashboard.

### Implementation

- [X] T015 [P] [US1] Define the event reporting API contract in specs/001-patient-safety-reporting/contracts/api-contract.md
- [ ] T016 [US1] Implement backend event creation route and controller in backend/src/routes/events.ts and backend/src/controllers/events-controller.ts
- [ ] T017 [US1] Implement safety event business logic in backend/src/services/event-service.ts
- [ ] T018 [US1] Implement patient creation and event association logic in backend/src/services/event-service.ts
- [ ] T019 [US1] Implement supervisor notification call in backend/src/services/notification-service.ts
- [ ] T020 [US1] Create the frontend event report component in frontend/src/app/event-report/event-report.component.ts
- [ ] T021 [US1] Create the frontend event report template in frontend/src/app/event-report/event-report.component.html
- [ ] T022 [US1] Implement event form validation and submission handling in frontend/src/app/event-report/event-report.component.ts
- [ ] T023 [US1] Implement redirect to dashboard after successful event submission in frontend/src/app/event-report/event-report.component.ts

### Testing

- [ ] T024 [P] [US1] Add backend unit tests for event creation and notification status in backend/tests/unit/event-service.test.ts
- [ ] T025 [P] [US1] Add frontend unit tests for event report form and submit behavior in frontend/src/app/event-report/event-report.component.spec.ts

---

## Phase 4: User Story 2 - Account access and recovery (Priority: P2)

**Goal**: Provide registration, login, and password recovery workflows for healthcare professionals.

**Independent Test**: Register a new account, sign in successfully, and request password recovery instructions.

### Implementation

- [ ] T026 [P] [US2] Implement backend auth routes and controller in backend/src/routes/auth.ts and backend/src/controllers/auth-controller.ts
- [ ] T027 [US2] Implement backend auth service with registration, login, and recovery in backend/src/services/auth-service.ts
- [ ] T028 [US2] Implement frontend login component in frontend/src/app/auth/login.component.ts
- [ ] T029 [US2] Implement frontend registration component in frontend/src/app/auth/register.component.ts
- [ ] T030 [US2] Implement frontend password recovery component in frontend/src/app/auth/recover.component.ts
- [ ] T031 [US2] Configure auth routing in frontend/src/app/app-routing.module.ts

### Testing

- [ ] T032 [P] [US2] Add backend unit tests for auth registration, login, and recovery in backend/tests/unit/auth-service.test.ts
- [ ] T033 [P] [US2] Add frontend unit tests for auth components in frontend/src/app/auth/login.component.spec.ts and frontend/src/app/auth/register.component.spec.ts

---

## Phase 5: User Story 3 - Base dashboard navigation (Priority: P3)

**Goal**: Provide a dashboard page that exposes navigation to the patient safety event reporting module.

**Independent Test**: Sign in and verify the dashboard clearly shows navigation to the event report workflow.

### Implementation

- [ ] T034 [P] [US3] Implement frontend dashboard component in frontend/src/app/dashboard/dashboard.component.ts
- [ ] T035 [P] [US3] Implement dashboard template and navigation cards in frontend/src/app/dashboard/dashboard.component.html
- [ ] T036 [US3] Implement protected route handling for authenticated dashboard access in frontend/src/app/app-routing.module.ts
- [ ] T037 [US3] Implement backend current-user route in backend/src/routes/me.ts and backend/src/controllers/auth-controller.ts
- [ ] T038 [US3] Wire the event report navigation link into the dashboard in frontend/src/app/dashboard/dashboard.component.html

### Testing

- [ ] T039 [P] [US3] Add frontend unit tests for dashboard navigation and route protection in frontend/src/app/dashboard/dashboard.component.spec.ts

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality improvements and cross-cutting consistency work.

- [ ] T040 [P] Implement DESIGN.md theme tokens in frontend/src/styles/theme.css
- [ ] T041 [P] Refine Tailwind styling and responsive layout in frontend/src/app/event-report/event-report.component.html
- [ ] T042 [P] Add backend notification failure handling and retry metadata in backend/src/services/event-service.ts
- [ ] T043 [P] Validate the API contract documentation in specs/001-patient-safety-reporting/contracts/api-contract.md
- [ ] T044 [P] Update quickstart.md with final setup and test commands in specs/001-patient-safety-reporting/quickstart.md
- [ ] T045 [P] Run frontend and backend coverage reports and ensure ≥80% coverage in frontend/src/ and backend/tests/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** must complete before foundational work begins.
- **Foundational (Phase 2)** blocks all user stories and must complete before story implementation.
- **User Story phases (Phase 3+)** can begin after foundational work completes.
- **Polish (Phase 6)** depends on all user stories being functionally complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other user stories; depends only on foundational backend and auth setup.
- **User Story 2 (P2)**: Depends on foundational auth service and backend setup; can be implemented concurrently with US3 once Phase 2 is complete.
- **User Story 3 (P3)**: Depends on foundational backend auth endpoints and frontend routing; can be implemented concurrently with US2 once Phase 2 is complete.

### Within Each User Story

- Model and service setup must be done before component wiring for the story.
- Frontend templates may be developed in parallel with backend endpoints after the API contract is defined.
- Tests should be written and validated once the core story flow is implemented.

---

## Parallel Opportunities

- **Phase 1**: `T003`, `T005` can run in parallel.
- **Phase 2**: `T007` and `T008` can run in parallel; data model tasks are independent.
- **User Story 1**: `T016` and `T017` can run in parallel once the API contract is defined; `T024` and `T025` can run in parallel.
- **User Story 2**: `T028`, `T029`, `T030` can be worked on in parallel by separate frontend developers.
- **User Story 3**: `T034`, `T035`, and `T038` can be developed in parallel after routing is defined.
- **Polish**: Most tasks in Phase 6 are marked `[P]` and can be completed concurrently.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 project setup.
2. Complete Phase 2 foundational backend and auth infrastructure.
3. Implement User Story 1 event reporting end-to-end.
4. Stop and validate the event creation flow, notification path, and dashboard redirect.

### Incremental Delivery

- Deliver User Story 1 first to confirm core value.
- Add User Story 2 authentication flows next to secure access.
- Add User Story 3 dashboard navigation last to connect the flows.
- Finish with cross-cutting polishing, coverage validation, and documentation updates.
