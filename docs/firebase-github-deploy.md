# GitHub Actions deployment for Firebase (world-map-1)

The workflow `.github/workflows/deploy-firebase.yml` deploys **only from main**,
automatically after relevant source changes, or via manual workflow_dispatch.
It uses keyless GitHub OIDC + Google Cloud Workload Identity Federation, not
long-lived service-account JSON keys. No Firebase deployment has happened by
adding this workflow.

## Repair of run 41115847680

The failing step is **Verify workload identity configuration**, before Google
Cloud authentication. Both `GCP_WIF_PROVIDER` and `GCP_FIREBASE_DEPLOY_SA`
are missing from the GitHub `firebase-production` environment. Mobile CI
passed separately; no Cloud Function was deployed by that failed run.

### One-time owner action

In Google Cloud Shell or on a machine authenticated with `gcloud`,
review and execute this repository-provided bootstrap:

```bash
bash scripts/bootstrap-firebase-deploy.sh --apply
```

The script verifies project `world-map-1` (number `923307762389`),
creates a dedicated GitHub OIDC trust provider restricted to
`spider-su/world-maps` on `main`, and grants the service account the
necessary Cloud Functions and Firebase Rules IAM roles. It uses **no
service-account keys** and does not grant project Owner or Editor.

If `gh` is installed and authenticated with repository settings access,
it writes the two GitHub environment variables. Otherwise it prints
their exact values for manual entry under
**Settings → Environments → firebase-production → Environment variables**.

The script modifies Google Cloud IAM. It does not modify billing,
enable APIs or deploy resources. You need a Google Cloud project owner or
authorized IAM administrator to run it. Wait for IAM propagation (a few
minutes) and trigger **Actions → Deploy Firebase friends → Run workflow**.

A green Mobile CI run is not evidence of a deployed callable; confirm
the Firebase deploy job reaches `firebase functions:list`. If later
deploy steps fail, inspect their specific missing API or permission
instead of broadening permissions to Owner/Editor.

## Initial Google Cloud authorization (project owner)

Use the Google Cloud Console to configure a **Workload Identity Pool** and
OIDC provider using GitHub's issuer `https://token.actions.githubusercontent.com`.
Map `google.subject=assertion.sub` and `attribute.repository=assertion.repository`.
Restrict the provider attribute condition to:

```
assertion.repository == 'spider-su/world-maps' && assertion.ref == 'refs/heads/main'
```

Create a deployment service account, for example
`github-firebase-deploy@world-map-1.iam.gserviceaccount.com`.
Grant it only required deployment roles (Firebase Rules, Cloud Functions,
Cloud Build, Artifact Registry and permission to act as the Functions runtime
service account) according to your project's API/role setup. Do **not** grant
Owner or Editor. Assign `roles/iam.workloadIdentityUser` on the deploy service
account to the restricted GitHub workload identity principal. Firebase CLI can
request additional permissions for first-time API enablement; an administrator
should enable APIs ahead of time instead of over-privileging the CI identity.

In GitHub repository **Settings → Environments**, create `firebase-production`.
Set these **environment variables** (not secrets; they are identifiers):
- `GCP_WIF_PROVIDER` = `projects/923307762389/locations/global/workloadIdentityPools/<pool>/providers/<provider>`
- `GCP_FIREBASE_DEPLOY_SA` = deployment service account email

Optional: add protected-branch/required-review rules to the environment.
Once configured, merge the workflow to `main`, then open
**Actions → Deploy Firebase friends → Run workflow**.

The workflow will fail clearly if these identifiers are missing. It will
not use a service account JSON key or prompt for interactive Firebase login.

Before testing invites, configure Android Firebase App Check: callables have
`enforceAppCheck: true`. Firebase Functions are deployed to the default
`us-central1` region; the app client also uses this region. Confirm deployed
function names and region in the Actions logs.

First deploy may use Google Cloud resources with nonzero billing. Configure
billing alerts in the Cloud Console, recognizing they are **not** hard caps.
