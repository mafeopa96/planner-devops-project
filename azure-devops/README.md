# Azure DevOps + Azure Web App

Pipeline CI/CD con 4 stages: build, staging, aprobación manual y producción.

## Estructura

```
azure-devops/
├── azure-pipelines.yml     ← el pipeline
└── app/
    ├── app.js
    ├── package.json
    └── Dockerfile
```

## Prerequisitos en Azure

```bash
# Instalar Azure CLI
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
az login

# Crear Resource Group
az group create --name mi-rg --location eastus

# Crear Azure Container Registry
az acr create --resource-group mi-rg \
  --name TU_AZURE_CONTAINER_REGISTRY \
  --sku Basic

# Crear Azure Web App
az appservice plan create --name mi-plan \
  --resource-group mi-rg --sku B1 --is-linux

az webapp create --resource-group mi-rg \
  --plan mi-plan --name mi-app-web \
  --deployment-container-image-name node:20-slim

# Crear slot de staging
az webapp deployment slot create \
  --name mi-app-web \
  --resource-group mi-rg \
  --slot staging
```

## Configurar en Azure DevOps

1. Ve a **dev.azure.com** y crea un proyecto
2. En **Pipelines → New Pipeline**
3. Conecta tu repositorio
4. Selecciona el archivo `azure-devops/azure-pipelines.yml`
5. Configura las variables:

## Variables a personalizar

En `azure-pipelines.yml` cambia:

| Variable | Valor |
|----------|-------|
| `dockerRegistry` | `TU_REGISTRY.azurecr.io` |
| `azureSubscription` | nombre de tu service connection |
| `webAppName` | nombre de tu Azure Web App |
| `resourceGroup` | nombre de tu resource group |

## Flujo del pipeline

```
Push a main
    ↓
Build + Tests + Docker build/push a ACR
    ↓
Deploy automático a Staging
    ↓
⏸ Aprobación manual (60 min timeout)
    ↓
Deploy a Producción
```

## Ventajas

- Aprobación manual antes de producción
- Slot de staging para validar antes del go-live
- Suite completa Azure integrada
- Rollback swap de slots en segundos

## Desventajas

- Vendor lock-in Microsoft/Azure
- Configuración inicial más compleja
- Costoso a escala enterprise
