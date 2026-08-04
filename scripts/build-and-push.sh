set -e

VERSION=0.0.11
IMAGE=registry.gitlab.com/netliinks/web/netguard/web

docker buildx build --platform linux/amd64 \
  -t ${IMAGE}:${VERSION} \
  -t ${IMAGE}:latest \
  --push .
