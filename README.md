# DevOps CI/CD — Proyecto de Referencia

Colección de pipelines CI/CD listos para usar, organizados por herramienta.
Cada carpeta es independiente y contiene la app, el pipeline y su README.

```
devops-project/
├── github-actions/     → Pipeline con GitHub Actions + Cloud Run (GCP)
├── jenkins/            → Pipeline con Jenkins + Docker
├── azure-devops/       → Pipeline con Azure DevOps + Azure Web App
├── aws-codepipeline/   → Pipeline con AWS CodePipeline + ECS
└── argocd/             → GitOps con ArgoCD en Kubernetes
```

## App de ejemplo

Todas las carpetas usan la misma app Node.js/Express con 3 endpoints:

| Endpoint | Descripción |
|----------|-------------|
| `GET /` | Health check — devuelve JSON con estado y versión |
| `GET /api/hello?name=X` | Saludo personalizado |
| `GET /metrics` | Métricas Prometheus (prom-client) |

## Prerequisitos comunes

- Node.js 20+
- Docker
- Git

## Universidad de Boyacá · 2026 · github.com/mafeopa
