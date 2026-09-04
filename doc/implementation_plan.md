# Project Plan: Refactoring Web Registration to Azure

Based on the `README.md` conclusion and the requirements to avoid massive "big bang" changes, I have structured this refactoring plan into isolated, testable milestones. We will incrementally move the architecture from the current prototype to a production-ready, Azure-hosted solution, while ensuring each milestone is verifiable and maintains a stable state. 

We will also incorporate this into the existing Terraform infrastructure defined in `ih-hand-sanitation-azure`.

## User Review Required

> [!IMPORTANT]
> Please review the milestones below. If they align with your timeline and risk tolerance, we can proceed with Milestone 1. Let me know if you would prefer to adjust the scope of any of these phases.

## Open Questions

> [!WARNING]
> 1. **Identity Provider Details**: Do we have an existing Microsoft Entra ID (or Azure AD B2C) tenant ready for this integration, or should the creation of the Entra App Registration be included in the Terraform work?
> 2. **Backend Language**: The README recommends .NET 8 for the Azure Function. Is this the preferred stack for the API?

---

## Proposed Milestones

### Milestone 1: Angular Clean Up & Reactive Forms (Front-end Only)

**Goal:** Remove inline logic from the HTML template and adopt Angular best practices, without changing how the app fundamentally behaves.

*   **Move Logic to TypeScript:** Extract all inline JavaScript (`<script>` tags) from `registration.component.html` and place it in `registration.component.ts`.
*   **Implement Reactive Forms:** Refactor the UI to use Angular Reactive Forms (`FormGroup`, `FormControl`, `Validators`).
*   **Isolate Mock Services:** Create a temporary `RegistrationService` that encapsulates the current mock token generation and random tenant ID generation. This allows the component to communicate with a "service" interface that can be easily swapped later.
*   **Testable Milestone:** The UI functions exactly as it does today locally, but the codebase is clean, modular, and unit-testable.

### Milestone 2: Microsoft Entra ID Integration

**Goal:** Stop fabricating tokens and establish a real identity flow using Microsoft Entra ID.

*   **Install MSAL:** Add `@azure/msal-angular` and `@azure/msal-browser` to the project.
*   **Configure Authentication:** Configure the `MsalModule` and replace the mock token generation in `RegistrationService` with real Entra authentication (`loginRedirect` or `loginPopup`).
*   **Auto-fill Fields:** Update the form to auto-populate fields like Name and Company using the claims provided by the Entra ID token.
*   **Testable Milestone:** A user can click "Register", be redirected to a real Microsoft Entra login screen, authenticate, and return to the application with a valid token.

### Milestone 3: Infrastructure as Code (Terraform)

**Goal:** Extend the existing Terraform stack to provision the required Azure resources for the production environment.

*   **Static Web App:** Add a `staticwebapp.tf` configuration to host the Angular frontend.
*   **Azure Functions / App Service:** Add configuration to host the `Registration API`.
*   **Database:** Provision the necessary backend data store (Azure SQL or Cosmos DB).
*   **Role Assignments & Networking:** Set up Managed Identities and networking rules to allow the Azure Function to securely access the database.
*   **Testable Milestone:** Running `terraform apply` successfully provisions all required Azure resources, and they are visible in the Azure Portal.

### Milestone 4: Backend API & Integration

**Goal:** Move business logic (tenant generation, validation) to the server side and connect the frontend to the backend.

*   **Create Registration API:** Build an Azure Function endpoint that accepts the registration payload.
*   **Token Validation:** Implement JWT validation in the Azure Function to ensure requests are authorized.
*   **Server-Side Logic:** Move the Tenant ID generation to the backend using UUIDs instead of random 6-digit hashes.
*   **Connect Frontend:** Update the Angular `RegistrationService` to send a POST request with the MSAL Bearer token to the new API.
*   **Testable Milestone:** End-to-end integration test. A user registers via the UI, authenticates with Entra, and the backend successfully receives the request, validates the token, generates a Tenant UUID, and stores the record in the database.

---

## Verification Plan

We will verify each milestone sequentially before moving to the next.

### Automated Tests
- **Milestone 1**: Run `ng test` to ensure component tests pass after refactoring to Reactive Forms.
- **Milestone 3**: Run `terraform plan` and `terraform validate` to ensure IaC correctness.

### Manual Verification
- **Milestone 1**: Verify the form validates and submits correctly in the local browser.
- **Milestone 2**: Perform a login flow and inspect the browser network tab/storage to verify a real MSAL token is acquired.
- **Milestone 4**: Verify the complete end-to-end flow locally and deployed. Check the Azure database to ensure the Tenant UUID and customer record are created properly.
