set -e

VERSION=0.0.5
IMAGE=registry.gitlab.com/netliinks/stacks/face/netguard

docker buildx build --platform linux/amd64 \
  -t ${IMAGE}:${VERSION} \
  -t ${IMAGE}:latest \
  --push .
