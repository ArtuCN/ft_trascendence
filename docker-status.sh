#!/bin/bash

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}\n=== Containers ===${NC}"
docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"

echo -e "${GREEN}\n=== Images ===${NC}"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}"

echo -e "${GREEN}\n=== Volumes ===${NC}"
docker volume ls --format "table {{.Name}}\t{{.Driver}}\t{{.Mountpoint}}"

echo -e "${GREEN}\n=== Networks ===${NC}"
docker network ls --format "table {{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}"

echo -e "${GREEN}\n=== System Health ===${NC}"
docker system df
