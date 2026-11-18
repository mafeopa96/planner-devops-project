# AWS CodePipeline + ECS Fargate

Pipeline CI/CD 100% serverless en AWS. CodeBuild compila y sube a ECR, CodePipeline despliega a ECS Fargate.

## Estructura

```
aws-codepipeline/
├── buildspec.yml       ← instrucciones para CodeBuild
├── taskdef.json        ← definición de tarea ECS
└── app/
    ├── app.js
    ├── package.json
    └── Dockerfile
```

## Prerequisitos en AWS

```bash
# Instalar AWS CLI
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
aws configure

# Crear ECR (Elastic Container Registry)
aws ecr create-repository \
  --repository-name mi-app \
  --region us-east-1

# Crear cluster ECS
aws ecs create-cluster --cluster-name mi-cluster

# Crear servicio ECS (requiere taskdef.json subido previamente)
aws ecs register-task-definition \
  --cli-input-json file://taskdef.json

aws ecs create-service \
  --cluster mi-cluster \
  --service-name mi-app \
  --task-definition mi-app \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

## Crear el pipeline en AWS

```bash
# Crear pipeline (desde consola AWS es más fácil)
# 1. CodePipeline → Create pipeline
# 2. Source: GitHub (conectar repo)
# 3. Build: CodeBuild (usar buildspec.yml)
# 4. Deploy: Amazon ECS
#    - Cluster: mi-cluster
#    - Service: mi-app
#    - Image definitions file: imagedefinitions.json
```

## Variables de entorno en CodeBuild

| Variable | Valor |
|----------|-------|
| `AWS_ACCOUNT_ID` | tu account ID (12 dígitos) |
| `AWS_DEFAULT_REGION` | us-east-1 |
| `IMAGE_REPO_NAME` | mi-app |
| `ECS_CLUSTER` | mi-cluster |
| `ECS_SERVICE` | mi-app |

## Permisos IAM requeridos para CodeBuild

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["ecs:UpdateService", "ecs:DescribeServices"],
      "Resource": "*"
    }
  ]
}
```

## Flujo del pipeline

```
Push a GitHub
    ↓
CodePipeline detecta el cambio
    ↓
CodeBuild: npm test → docker build → ECR push
    ↓
CodePipeline: ECS deploy con nueva imagen
    ↓
ECS reemplaza tareas con rolling update
```

## Ventajas

- 100% serverless — sin infraestructura que mantener
- Autenticación IAM nativa sin credenciales externas
- Integración perfecta con todos los servicios AWS
- Paga solo por lo que usas

## Desventajas

- Solo funciona bien dentro del ecosistema AWS
- Vendor lock-in severo
- Poco flexible fuera de AWS
