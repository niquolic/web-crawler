#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting cleanup of Project Crawler...${NC}\n"

# 1. Delete Kubernetes resources
echo -e "${GREEN}Deleting Kubernetes resources...${NC}"
kubectl delete namespace dev --force --grace-period=0

# 2. Stop and delete Minikube profile
echo -e "\n${GREEN}Stopping and deleting Minikube profile...${NC}"
minikube stop --profile=projectcrawler
minikube delete --profile=projectcrawler

# 3. Remove Docker images
echo -e "\n${GREEN}Removing Docker images...${NC}"
docker rmi projectcrawler-frontend:1.0.0
docker rmi projectcrawler-api:1.0.0
docker rmi projectcrawler-crawler:1.0.0

# 4. Remove from hosts file
echo -e "\n${GREEN}Checking hosts file...${NC}"
if grep -q "dev.projectcrawler.com" /etc/hosts; then
    echo "Please remove the following line from your /etc/hosts file:"
    echo "127.0.0.1 dev.projectcrawler.com"
    echo "You may need to run: sudo nano /etc/hosts"
fi

# 5. Remove Minikube container
echo -e "\n${GREEN}Removing Minikube container...${NC}"
docker rm -f projectcrawler 2>/dev/null || true

echo -e "\n${BLUE}Cleanup completed!${NC}"
echo -e "All Project Crawler resources have been removed from your system." 