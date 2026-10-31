#!/usr/bin/env bash
# One-time owner-operated keyless Firebase CI deployment bootstrap.
set -euo pipefail
PROJECT_ID=world-map-1
PROJECT_NUMBER=923307762389
REPO=spider-su/world-maps
ENVIRONMENT=firebase-production
POOL=worldmaps-github
PROVIDER=main-only
SERVICE_ACCOUNT=github-firebase-deploy@world-map-1.iam.gserviceaccount.com
CONDITION="assertion.repository == 'spider-su/world-maps' && assertion.ref == 'refs/heads/main'"

if [[ "$#" != 1 || "$1" != "--apply" ]]; then
  echo "Usage: bash scripts/bootstrap-firebase-deploy.sh --apply"
  echo "Creates Google Cloud IAM and GitHub environment variables. Review before running."
  exit 2
fi
command -v gcloud >/dev/null || { echo "gcloud CLI required" >&2; exit 1; }
ACTUAL_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
if [[ "$ACTUAL_NUMBER" != "$PROJECT_NUMBER" ]]; then
  echo "Wrong GCP project number; refusing IAM changes." >&2
  exit 1
fi

if ! gcloud iam workload-identity-pools describe "$POOL" \
  --project="$PROJECT_ID" --location=global >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$POOL" --project="$PROJECT_ID" \
    --location=global --display-name="World Maps GitHub CI"
fi
if ! gcloud iam workload-identity-pools providers describe "$PROVIDER" \
  --project="$PROJECT_ID" --location=global --workload-identity-pool="$POOL" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" \
    --project="$PROJECT_ID" --location=global --workload-identity-pool="$POOL" \
    --issuer-uri=https://token.actions.githubusercontent.com \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
    --attribute-condition="$CONDITION" --display-name="World Maps main only"
fi

# Validate an existing provider rather than accepting weaker trust restrictions.
CURRENT_CONDITION="$(gcloud iam workload-identity-pools providers describe "$PROVIDER" \
  --project="$PROJECT_ID" --location=global --workload-identity-pool="$POOL" \
  --format='value(attributeCondition)')"
CURRENT_ISSUER="$(gcloud iam workload-identity-pools providers describe "$PROVIDER" \
  --project="$PROJECT_ID" --location=global --workload-identity-pool="$POOL" \
  --format='value(oidc.issuerUri)')"
if [[ "$CURRENT_CONDITION" != "$CONDITION" || "$CURRENT_ISSUER" != "https://token.actions.githubusercontent.com" ]]; then
  echo "Existing OIDC provider has unexpected identity restrictions. Inspect manually." >&2
  exit 1
fi

if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT" \
  --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam service-accounts create github-firebase-deploy \
    --project="$PROJECT_ID" --display-name="Firebase deploy from World Maps GitHub"
fi

PRINCIPAL="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository/$REPO"
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT" \
  --project="$PROJECT_ID" --role=roles/iam.workloadIdentityUser \
  --member="$PRINCIPAL" --quiet >/dev/null

# Limit CI permissions to Firebase functions + Firestore rules deployment.
for ROLE in roles/cloudfunctions.admin roles/firebaserules.admin roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT" --role="$ROLE" \
    --condition=None --quiet >/dev/null
done

# Service-account impersonation is restricted to existing Functions runtime SAs.
for RUNTIME_SA in "$PROJECT_NUMBER-compute@developer.gserviceaccount.com" "$PROJECT_ID@appspot.gserviceaccount.com"; do
  if gcloud iam service-accounts describe "$RUNTIME_SA" \
    --project="$PROJECT_ID" >/dev/null 2>&1; then
    gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
      --project="$PROJECT_ID" --role=roles/iam.serviceAccountUser \
      --member="serviceAccount:$SERVICE_ACCOUNT" --quiet >/dev/null
  fi
done

PROVIDER_NAME="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/providers/$PROVIDER"
printf '\nGitHub environment: %s\nGCP_WIF_PROVIDER=%s\nGCP_FIREBASE_DEPLOY_SA=%s\n' "$ENVIRONMENT" "$PROVIDER_NAME" "$SERVICE_ACCOUNT"

if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  gh api -X PUT "repos/$REPO/environments/$ENVIRONMENT" >/dev/null
  gh variable set GCP_WIF_PROVIDER -R "$REPO" -e "$ENVIRONMENT" --body "$PROVIDER_NAME"
  gh variable set GCP_FIREBASE_DEPLOY_SA -R "$REPO" -e "$ENVIRONMENT" --body "$SERVICE_ACCOUNT"
  echo "GitHub environment variables configured."
else
  echo "gh CLI not authenticated; set the two printed values manually in:"
  echo "https://github.com/$REPO/settings/environments"
fi
echo "After IAM propagation, manually run: https://github.com/$REPO/actions/workflows/deploy-firebase.yml"
echo "This script does not deploy or create service-account keys."
