set -e

VERSION=0.0.3

docker buildx build --platform linux/amd64 \
  -t registry.gitlab.com/netliinks/stacks/face/netguard:${VERSION} \
  -t registry.gitlab.com/netliinks/stacks/face/netguard:latest \
  --push .
