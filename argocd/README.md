# ArgoCD — GitOps para Kubernetes

Deploy declarativo basado en GitOps. ArgoCD observa este repositorio y sincroniza automáticamente el cluster cuando detecta cambios en `k8s/manifests/`.

## Estructura

```
argocd/
├── app/
│   ├── app.js
│   ├── package.json
│   └── Dockerfile
└── k8s/
    ├── application.yaml          ← le dice a ArgoCD qué y cómo desplegar
    └── manifests/
        ├── deployment.yaml       ← definición del pod y réplicas
        └── service.yaml          ← exposición del servicio
```

## Prerequisitos

### Instalar ArgoCD en Kubernetes

```bash
# Crear namespace
kubectl create namespace argocd

# Instalar ArgoCD
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Esperar que los pods estén listos
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Exponer la UI de ArgoCD
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Obtener la contraseña inicial
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

### Registrar la aplicación en ArgoCD

```bash
# Aplicar el manifest de la aplicación
kubectl apply -f k8s/application.yaml

# Verificar que ArgoCD la detectó
kubectl get applications -n argocd

# Sincronización manual (si no está en modo automático)
argocd app sync mi-app
```

## Flujo GitOps

```
1. Desarrolladora hace commit + push a main
         ↓
2. ArgoCD detecta el cambio en k8s/manifests/
         ↓
3. Compara estado deseado (Git) vs estado real (cluster)
         ↓
4. Sincroniza automáticamente (si syncPolicy.automated = true)
         ↓
5. Kubernetes aplica los cambios
         ↓
6. selfHeal: si alguien hace kubectl apply manual,
            ArgoCD lo revierte al estado de Git
```

## Actualizar la imagen (flujo CI + GitOps)

El flujo recomendado combina CI (GitHub Actions) con GitOps (ArgoCD):

```
GitHub Actions build imagen nueva
         ↓
Hace push a registry con nuevo tag
         ↓
Actualiza el tag en deployment.yaml y hace commit
         ↓
ArgoCD detecta el commit y despliega automáticamente
```

## Comandos útiles

```bash
# Ver estado de la app
argocd app get mi-app

# Ver historial de deploys
argocd app history mi-app

# Rollback a versión anterior
argocd app rollback mi-app 3   # número de revisión

# Forzar sincronización
argocd app sync mi-app --force

# Ver diferencias entre Git y cluster
argocd app diff mi-app
```

## Personalizar

En `k8s/application.yaml` cambia:

| Campo | Valor |
|-------|-------|
| `repoURL` | URL de tu repositorio |
| `targetRevision` | rama a seguir (main, release, etc.) |
| `namespace` | namespace de destino en Kubernetes |

En `k8s/manifests/deployment.yaml` cambia:

| Campo | Valor |
|-------|-------|
| `image` | URL de tu imagen Docker |
| `replicas` | número de pods |

## Ventajas

- Estado del sistema completamente en Git
- Rollback = revertir un commit en Git
- Self-healing automático
- Auditoría completa por Git history
- Sin credenciales del cluster en sistemas externos

## Desventajas

- Requiere Kubernetes (no apto para apps simples)
- Tiene un techo de escala con múltiples clusters
- Requiere gestión de secretos separada (no van en Git)
