# Jenkins + Docker

Pipeline CI/CD self-hosted con Jenkins. Build, test, push a Docker Hub y deploy en el mismo servidor.

## Estructura

```
jenkins/
├── Jenkinsfile         ← el pipeline (Groovy)
└── app/
    ├── app.js
    ├── package.json
    └── Dockerfile
```

## Prerequisitos

### Instalar Jenkins (Ubuntu/Debian)

```bash
# Java (requerido)
sudo apt install openjdk-17-jdk -y

# Jenkins
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update && sudo apt install jenkins -y
sudo systemctl start jenkins

# Docker (para que Jenkins pueda hacer build)
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Configurar credenciales en Jenkins

1. Ve a **Manage Jenkins → Credentials → System → Global credentials**
2. Agrega credencial tipo **Username with password**:
   - ID: `docker-hub-credentials`
   - Username: tu usuario de Docker Hub
   - Password: tu token de Docker Hub

### Crear el pipeline en Jenkins

1. **New Item → Pipeline**
2. En **Pipeline → Definition** selecciona: `Pipeline script from SCM`
3. SCM: `Git`
4. Repository URL: tu repo
5. Script Path: `jenkins/Jenkinsfile`
6. Guarda y ejecuta

## Variables a personalizar

En el `Jenkinsfile` cambia:

```groovy
DOCKER_REGISTRY = "docker.io/TU_USUARIO"  // tu usuario Docker Hub
```

## Lo que hace el pipeline

```
Checkout → npm install → npm test → docker build → docker push → docker run → health check
```

Con rollback automático si el deploy falla.

## Ventajas

- Control total sobre la infraestructura
- Sin límites de minutos
- Sin vendor lock-in de cloud
- Rollback automático incluido

## Desventajas

- Requiere mantener el servidor Jenkins
- Gestión manual de actualizaciones
