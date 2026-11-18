# GitHub Actions + Google Cloud Run

Pipeline CI/CD que despliega automáticamente a Cloud Run en cada push a `main`.
Usa Workload Identity Federation — sin claves JSON expuestas.

## Estructura

```
github-actions/
├── .github/
│   └── workflows/
│       └── deploy.yml      ← el pipeline
└── app/
    ├── app.js              ← aplicación Node.js/Express
    ├── package.json
    └── Dockerfile
```

## Prerequisitos en GCP

```bash
# 1. Habilitar APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  iam.googleapis.com iamcredentials.googleapis.com

# 2. Crear Artifact Registry
gcloud artifacts repositories create mi-app \
  --repository-format=docker --location=us-central1

# 3. Crear Service Account
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions SA"

# 4. Permisos
gcloud projects add-iam-policy-binding TU_PROJECT_ID \
  --member="serviceAccount:github-actions-sa@TU_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding TU_PROJECT_ID \
  --member="serviceAccount:github-actions-sa@TU_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# 5. Workload Identity Pool
gcloud iam workload-identity-pools create "github-pool" --location="global"

gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner=='TU_USUARIO_GITHUB'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# 6. Vincular SA al pool
gcloud iam service-accounts add-iam-policy-binding \
  github-actions-sa@TU_PROJECT_ID.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/TU_PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository_owner/TU_USUARIO_GITHUB"
```

## Secretos en GitHub

Ve a **Settings → Secrets and variables → Actions** y agrega:

| Secret | Valor |
|--------|-------|
| `GCP_PROJECT_ID` | tu-project-id |
| `WIF_PROVIDER` | projects/NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider |
| `WIF_SERVICE_ACCOUNT` | github-actions-sa@tu-project-id.iam.gserviceaccount.com |

## Uso

```bash
# Clonar, modificar y hacer push
git add .
git commit -m "feat: mi cambio"
git push origin main
# El pipeline se dispara automáticamente
```

## Verificar despliegue

```bash
gcloud run services describe mi-app \
  --region=us-central1 \
  --format="value(status.url)"
```

## Ventajas de esta configuración

- Sin claves JSON — Workload Identity Federation
- Imagen taggeada por commit SHA (trazabilidad)
- Serverless — escala a cero sin costo
- HTTPS automático en Cloud Run

## Desventajas

- 2000 min/mes en plan free de GitHub
- Vendor lock-in de GitHub
