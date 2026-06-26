# EliteHosting VPS Multi-Tenant Docker Deployment

This guide explains how to set up your VPS to host multiple user applications using Docker, ensuring each user has their own isolated container.

## 1. Prerequisites
- Ubuntu 22.04+ VPS
- Docker & Docker Compose
- Domain name pointed to your VPS IP

## 2. Install Docker
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
```

## 3. Architecture: Reverse Proxy
To host multiple applications on the same VPS, we use a Reverse Proxy (like Traefik or Nginx).

### Using Traefik (Recommended for Docker)
Traefik automatically detects new containers and configures SSL.

Create `docker-compose.yml` for Traefik:
```yaml
version: '3'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=your-email@example.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
    networks:
      - proxy

networks:
  proxy:
    external: true
```
First, create the network: `docker network create proxy`.

## 4. Deploying User Containers
Each user deployment should run in its own container with specific labels for Traefik.

Example Deployment Command (Automated by Worker):
```bash
docker run -d \
  --name elitehost-user123-app \
  --network proxy \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.userapp.rule=Host(\`userapp.yourdomain.com\`)" \
  --label "traefik.http.routers.userapp.entrypoints=websecure" \
  --label "traefik.http.routers.userapp.tls.certresolver=myresolver" \
  elitehost/user-app:latest
```

## 5. Security & Isolation
- **Resource Limits:** Always run containers with memory and CPU limits.
  `--memory="512m" --cpus="0.5"`
- **Read-Only Filesystem:** Use `--read-only` where possible.
- **Network Isolation:** Keep user containers on private networks and only expose them through the reverse proxy.
- **User Namespaces:** Enable Docker user namespaces to prevent root escalation.

## 6. Monitoring
Use `ctop` or `Portainer` to monitor all running user containers.
```bash
docker run --rm -it --name ctop -v /var/run/docker.sock:/var/run/docker.sock:ro quay.io/vektorlab/ctop:latest
```
