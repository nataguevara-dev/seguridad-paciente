# Implementation Plan: Patient Safety Reporting

**Branch**: `001-evento-seguridad` | **Date**: 2026-05-03 | **Spec**: specs/001-patient-safety-reporting/spec.md
**Input**: Feature specification from `/specs/001-patient-safety-reporting/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a prototype of ENTORNOS SEGUROS with Angular frontend and Bun + Express backend. Implement basic email/password registration, login, and password recovery, a dashboard shell, and a patient safety event reporting module. The backend uses Better-SQLite3 in-memory persistence and a configured supervisor email for event notification. The event form will follow the provided Figma wireframe and DESIGN.md styling guidance.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**:
- Frontend: Angular, Tailwind CSS, Lucide icons
- Backend: Bun runtime, Express, Better-SQLite3
- Validation/test- Validation/test- Validation/test- Validaneeded
- Validation/test- Validation/test- Validation/test- Validaneeded
n + Express backend. Implement basic email/pats for backend; target ≥80% coverage
**Target Platform**: Browser web application wit**Target Platform**: Browser web application wit**Target Platform**: Browser web application wit**Target Platform**: Browser web applica00ms for local APIs, fast UI form transitions, low bundle overhead
**Constraints**: Minimal external dependencies, in-memory persistence only, adherence to DESIGN.md and Figma form layout, supervisor notification via configured email address
**Scale/Scope**: Proof-of-concept prototype; session-only persistence and developer-focused UX

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The plaThe plaTatisfy the conThe plaThe plaTatisfy the conitectureThe plaThe plaTatisin, useThe plaThe plaTatisfy the conThe plaThe pllignedThe plaThe plaTatisfy the conThe plaThe plaTat eThe plaThe plaTatisfy the conThe plaThe plaTatisfy the conitect anThe plaThe plaTatisfy the conThe plaThe plaTatisfy the conitectuarThe plaThe plaTatisfy the conThe plaThe plaTatisfy the conitectureThe plaThe plaTahrThe plaThe plaTatisfy the conThe plaThe plaTatisfy the conitectureThe plaThe plaTatisin, useThe plaThe plaTatisfy the conThe plaThe pllignedThe plaThe plaTatisfy the conThe plaThe plaTat eThe plaThe plaTatisfy the conThe plaThe plaTatisfy the conit  └── api-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── auth/
│   ││   ││   ││   ││   ││   ││   ││   ││   ││   ││ red/
│   ├── assets/
│  │  │  │  │  │  │  │  │  │  │  │  │  │  │ackend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   └── startup.ts
├── tests/
└── bunfig.toml
```

**Structure Decision**: Use a two-project web application structure to separate frontend Angular concerns from backend Bun/Express implementation. This supports clean architecture boundaries and keeps the notification/persistence layer isolated.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Dual frontend/backend structure | Needed to isolate UI from API and support clea| Dual frontend/backend structurgle monorepo app woul| Dual fronsent| Dual frontend/bac, making testing and architect| Dual frontend/backend structure | Needed to isolate UI from API and support clea| Dual frontendma| Dual frontend/b. Imple| Dual frontend/backend structure | Needed to isolate UI from API and support nd navigation to the event reporting module.
4. Implement the patient safety event form with Figm4. Implement the patient saftion.
5. Add backend storage, notification, and persistence using Better-SQLite3 in-memory.
6. Write unit tests to reach ≥80% coverage before finalizing the feature.

