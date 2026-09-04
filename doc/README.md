Short answer: No, this should not live in the HTML file, and the browser should never issue, generate, or manipulate Entra-issued JWTs the way this proof-of-concept currently does.

Your current file is functioning as a standalone prototype that combines:

UI (HTML)
Business logic (JavaScript)
Identity workflow (mock Entra authentication)
Tenant provisioning logic

For a production Angular + Entra architecture, I would split these responsibilities completely.

What I See

The component currently:

Collects:
Name
Address
Company
Tenant ID
Generates a random "Tenant ID"
Simulates Entra authentication
Creates a mock JWT
Displays tokens in the browser
Stores tokens in hidden fields

All of that was appropriate for local experimentation, but none of that would survive a security review.

Recommended Production Architecture
Angular SPA
     |
     | MSAL Login
     v
Entra ID
     |
     | ID Token
     v
Angular Application
     |
     | POST Registration
     v
Registration API
(Azure Function / App Service)
     |
     | Validate JWT
     | Create Customer Record
     | Generate Tenant Key
     | Provision Resources
     v
Database

Move ALL JavaScript Out of HTML

Instead of:

<script>
  function generateTenantId() { ... }
</script>


Use:

registration.component.ts


Example:

export class RegistrationComponent {

  register(): void {
      ...
  }

  generateTenantId(): string {
      ...
  }
}


Angular already gives you:

Reactive Forms
Validation
Event binding
Dependency Injection
RxJS

There is no benefit to embedding browser JavaScript in the template.

Do NOT Generate Tokens

This block should disappear entirely:

function mockEntraIdToken(...)


and

const result = mockEntraIdToken(...)


and

<input type="hidden" id="idToken">
<input type="hidden" id="accessToken">


The client should never fabricate tokens.

Instead use:

MsalService


Example:

this.msalService.loginRedirect();


or

this.msalService.acquireTokenSilent(...)

Let Entra Fill Most Fields Automatically

You may not even need:

Full Name


or

Company


because Entra can already provide:

account.name
account.username
tenantId
oid
groups
roles


Typical registration page:

Company Name
Organization Size
Contact Phone
Terms Acceptance


Everything identity-related comes from Entra.

The Tenant ID Strategy Needs Refactoring

This concerns me:

Math.random()


and:

6-digit hash


A six-digit value:

100000 - 999999


Only provides:

900,000 possibilities


That is extremely collision-prone if customer growth occurs.

Instead:

Tenant UUID


Example:

9a52d1d7-fd4d-4bce-900b-347ab437b2b8


or

TEN-7KQ4N8RM


generated server-side.

Never generate customer identifiers in the browser.

Create a Registration Service

Instead of:

console.log('Requesting token...')


Send to a backend:

this.registrationService.register({
    company,
    address
});


Example:

@Injectable()
export class RegistrationService {

    constructor(private http: HttpClient) {}

    register(request: RegistrationRequest) {
        return this.http.post(
            '/api/registration',
            request
        );
    }
}

Backend Responsibilities

I would move the following server-side:

Customer Creation
Company
Address
Contact

Tenant Generation
TenantKey
CustomerId
SubscriptionId

Provisioning

Potentially:

CosmosDB
SQL
Storage
Container
Subscription Mapping

Authorization

Validate:

Entra JWT
Issuer
Audience
Scopes


before creating anything.

Angular Form Recommendation

Use Reactive Forms.

Instead of:

<input id="name">


Use:

registrationForm = this.fb.group({
  company: ['', Validators.required],
  address: ['', Validators.required]
});


Template:

<form [formGroup]="registrationForm">


This is the Angular-native approach.

What I Would Build

For an Azure-centric SaaS onboarding platform:

Front End
Angular
MSAL Angular
Reactive Forms

Identity
Microsoft Entra ID
External ID (if customers are external)

API
Azure Functions
.NET 8

Data
Azure SQL


or

Cosmos DB

Tenant Creation
Server-side UUID

Provisioning
Durable Functions
Event Grid
Service Bus


for asynchronous onboarding.

If This Were My System

I would reduce the HTML to something resembling:

<form [formGroup]="registrationForm"
      (ngSubmit)="register()">

  <ih-input formControlName="company"></ih-input>

  <ih-input formControlName="address"></ih-input>

  <button type="submit">
      Register Organization
  </button>

</form>


Then:

registration.component.html

Presentation only

registration.component.ts

Form validation
MSAL integration
API calls

registration.service.ts

Backend communication

Azure Function API

Tenant creation
Entra token validation
Customer provisioning

That separation is the architecture I would recommend for a production Angular SaaS platform using Entra ID.