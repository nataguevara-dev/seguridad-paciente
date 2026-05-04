# Research Findings: Patient Safety Reporting

## Decision: Stack and persistence
**Chosen**: Angular frontend with Bun + Express backend, using Better-SQLite3 in-memory persistence.
**Rationale**: This matches the prompt requirements exactly while minimizing dependencies. Bun provides a lightweight runtime, Express offers a familiar HTTP layer, and Better-SQLite3 keeps storage simple without external database services.
**Alternatives considered**:
- Use full Node.js + npm: valid, but Bun is preferred for minimal runtime overhead and bundle simplicity.
- Use a file-backed SQLite store: possible, but in-memory persistence is explicitly requested and avoids file management for a prototype.

## Decision: Supervisor notification behavior
**Chosen**: Use a configured supervisor email address for prototype notification delivery.
**Rationale**: This avoids building a role-based supervisor selector while still satisfying the requirement to notify a supervisor. It supports testing without a full user hierarchy.
**Alternatives considered**:
- Select a supervisor from a user list: adds complexity and role management.
- Send notification to a generic admin mailbox: acceptable, but a configured supervisor email is closer to the stated requirement.

## Decision: UI design
**Chosen**: Implement the patient safety event form using Tailwind CSS based on the provided Figma wireframe and DESIGN.md styling tokens.
**Rationale**: This ensures visual consistency with the project brand and the request to follow the Figma form layout. Tailwind keeps styles maintainable and avoids adding a heavier UI framework.
**Alternatives considered**:
- Use a prebuilt component library: faster, but violates the minimal-dependencies requirement.
- Build custom CSS from scratch: more effort and risk of inconsistent styling.

## Decision: Testing approach
**Chosen**: Use Angular's standard unit testing for frontend components and Bun-compatible tests for backend logic.
**Rationale**: Angular testing is built into the frontend stack, while Bun supports lightweight backend test execution. This balances the coverage requirement with minimal library overhead.
**Alternatives considered**:
- Use Vitest across both frontend and backend: possible but introduces an extra dependency to the Angular stack.
- Skip coverage enforcement until later: not acceptable because the constitution requires ≥80% unit coverage.
