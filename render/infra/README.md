# Render Infrastructure

Terraform manages a Docker-backed Render Web Service for the Flask backend and a Render Static Site for the React frontend. Render builds both directly from the configured GitHub repository; the frontend is not containerized.

## Prerequisites

- Terraform 1.3 or newer
- A Render account with access to the GitHub repository
- A Render API key
- The GitHub repository connected to Render

The Render Terraform provider reads the API key from `RENDER_API_KEY` and also requires the account or team owner ID in `RENDER_OWNER_ID`. The API key is secret; the owner ID is an identifier, not a credential. Neither is stored in Terraform configuration or variable files.

## Configuration

From PowerShell, set the API key for the current terminal session:

```powershell
$env:RENDER_API_KEY="YOUR_RENDER_API_KEY"
$env:RENDER_OWNER_ID="YOUR_RENDER_OWNER_ID"
```

Get a valid owner ID from the Render API. With `RENDER_API_KEY` set in PowerShell, list the workspaces your key can access:

```powershell
$owners = Invoke-RestMethod -Uri "https://api.render.com/v1/owners" -Headers @{ Authorization = "Bearer $env:RENDER_API_KEY" }
$owners | ForEach-Object { $_.owner } | Format-Table id, name, type
```

Set `RENDER_OWNER_ID` to the `id` from the workspace that should own these services. Use the API-returned ID exactly; a dashboard user ID may not be a valid workspace ID. Copy `terraform.tfvars.example` to `terraform.tfvars` and set `repository_url` to this repository's HTTPS URL. Service names are configurable there and have Zylo defaults. The branch (`main`) and region (`singapore`) are fixed project settings. Terraform state is local in this directory; do not commit it. Local state is not shared or backed up, so keep it safe and consider a secure remote backend if multiple people need to manage these resources.

The backend uses the repository-root `Dockerfile` and `.` build context. Its health check is `/api/health`; Render supplies `PORT`, which the application already reads. The frontend uses `npm ci && npm run build` from `frontend/` and publishes `frontend/build/`. Terraform automatically sets frontend build-time `REACT_APP_BACKEND_URL` from the backend service's computed Render URL. The backend API currently serves only public, unauthenticated read-only endpoints, so it returns `Access-Control-Allow-Origin: *` and does not need the frontend URL as an input.

Both services have Render automatic deploys disabled. Service names default to `zylo-backend` and `zylo-frontend`. Render-generated service URLs are available automatically as the `backend_url` and `frontend_url` Terraform outputs; URL suffixes are handled by the provider and do not need to be guessed or entered.

## Terraform Workflow

Run these commands from `render/infra`:

```powershell
terraform init
terraform fmt -recursive
terraform validate
terraform plan
```

Review the plan before applying. To create or update the Render resources, run `terraform apply` intentionally and confirm its plan. `terraform destroy` deletes the managed Render services and is destructive; use it only when you intentionally want to remove them.

The Render provider v1.9.1 documentation lists paid Web Service plans but does not list `free`, even though Render currently documents Free Web Services. The configuration requests `free` and passes Terraform's local configuration validation, but that does not prove Render's API will accept it when creating the service. Do not replace it with a paid plan. Static Sites are free on Render.

Provider v1.9.1 also sends `maintenance_mode` on Web Service updates, which Render rejects for Free services. This is tracked in [provider issue #80](https://github.com/render-oss/terraform-provider-render/issues/80); the proposed fix is not yet in a released provider. Terraform ignores the backend service's environment-variable map to avoid this update path. Other backend configuration changes may also fail on the Free plan until a provider release fixes this issue. Review plans carefully and avoid applying unexpected backend updates.

## GitHub Actions

The existing workflow runs backend tests/lint and builds the runtime Docker target, frontend lint/tests/build, and the repository secret scan. An aggregate `ci` job succeeds only when all checks pass. Only a successful push to `main` can continue to deployment:

```text
Push or pull request
  -> CI checks
  -> all checks pass
  -> production environment approval
  -> Render backend Web Service and frontend Static Site deploy
```

The deployment job triggers Render's Git-based deploy API for the exact commit that passed CI. Render automatic deploys are disabled so pushes and pull requests cannot deploy around this approval gate. Pull requests never run the production deployment job.

In GitHub repository settings, create the `production` environment and configure required reviewers at **Settings -> Environments -> production -> Required reviewers**. Configure these environment values:

- Secret `RENDER_API_KEY`: the Render API key used by the deployment API.
- Variable `RENDER_BACKEND_SERVICE_ID`: Terraform output `backend_service_id`.
- Variable `RENDER_FRONTEND_SERVICE_ID`: Terraform output `frontend_site_id`.

Only the API key is a secret; service IDs are environment variables. Reviewers and environment protection are configured in GitHub settings, not simulated in workflow YAML.