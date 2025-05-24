#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to handle errors
handle_error() {
    echo -e "\n${RED}Error: Command failed with exit code $?${NC}"
    echo -e "${RED}Please check the error message above and fix the issue.${NC}"
    echo -e "${RED}You may need to run some commands manually.${NC}"
    exit 1
}

# Set error handler
trap 'handle_error' ERR

echo -e "${BLUE}Starting Project Crawler deployment...${NC}\n"

# 1. Build Docker images
echo -e "${GREEN}Building Docker images...${NC}"
cd crawler-front
docker build -t projectcrawler-frontend:1.0.0 .
cd ../crawler-api
docker build -t projectcrawler-api:1.0.0 .
cd ../crawler
docker build -t projectcrawler-crawler:1.0.0 .
cd ..

# 2. Start Minikube
echo -e "\n${GREEN}Starting Minikube...${NC}"
minikube start --driver=docker --profile=projectcrawler
minikube profile projectcrawler

# 3. Load Docker images into Minikube
echo -e "\n${GREEN}Loading Docker images into Minikube...${NC}"
eval $(minikube docker-env)

cd crawler-front
docker build -t projectcrawler-frontend:1.0.0 .
cd ../crawler-api
docker build -t projectcrawler-api:1.0.0 .
cd ../crawler
docker build -t projectcrawler-crawler:1.0.0 .
cd ..

eval $(minikube docker-env -u)

# 4. Create namespace
echo -e "\n${GREEN}Creating namespace...${NC}"
cd manifests
kubectl apply -f namespaces/namespace-dev.yml

# 5. Create shared volume
echo -e "\n${GREEN}Creating shared volume...${NC}"
kubectl apply -f storage/websites-pvc.yml -n dev

# 6. Deploy MongoDB
echo -e "\n${GREEN}Deploying MongoDB...${NC}"
kubectl apply -f storage/mongodb-pvc.yml -n dev
kubectl apply -f deployments/mongodb/deployment-dev.yml -n dev
kubectl apply -f services/mongodb-service.yml -n dev

# 7. Deploy ElasticSearch and Kibana
echo -e "\n${GREEN}Deploying ElasticSearch and Kibana...${NC}"
kubectl apply -f deployments/elasticsearch/deployment-dev.yml -n dev
kubectl apply -f services/elasticsearch-nodeport.yml -n dev
kubectl apply -f deployments/kibana/deployment-dev.yml -n dev
kubectl apply -f services/kibana-service.yml -n dev

# 8. Deploy other services
echo -e "\n${GREEN}Deploying other services...${NC}"
kubectl apply -f deployments/front/deployment-dev.yml -n dev
kubectl apply -f deployments/api/deployment-dev.yml -n dev
kubectl apply -f deployments/rabbitmq/deployment-dev.yml -n dev
kubectl apply -f services/rabbitmq-service.yml -n dev
kubectl apply -f deployments/crawler/deployment-dev.yml -n dev

# 9. Configure Ingress
echo -e "\n${GREEN}Configuring Ingress...${NC}"
minikube addons enable ingress

# Wait for ingress controller to be ready
echo -e "\n${GREEN}Waiting for ingress controller to be ready...${NC}"
sleep 30

# Apply ingress configurations with error handling
echo -e "\n${GREEN}Applying ingress configurations...${NC}"
if ! kubectl apply -f services/api-nodeport.yml -n dev; then
    echo -e "${RED}Failed to apply api-nodeport.yml${NC}"
    exit 1
fi

if ! kubectl apply -f services/crawler-nodeport.yml -n dev; then
    echo -e "${RED}Failed to apply crawler-nodeport.yml${NC}"
    exit 1
fi

if ! kubectl apply -f services/front-nodeport.yml -n dev; then
    echo -e "${RED}Failed to apply front-nodeport.yml${NC}"
    exit 1
fi

if ! kubectl apply -f services/app-ingress.yml -n dev; then
    echo -e "${RED}Failed to apply app-ingress.yml${NC}"
    echo -e "${RED}Please run this command manually:${NC}"
    echo "kubectl apply -f services/app-ingress.yml -n dev"
    exit 1
fi

if ! kubectl apply -f services/kibana-ingress.yml -n dev; then
    echo -e "${RED}Failed to apply kibana-ingress.yml${NC}"
    echo -e "${RED}Please run this command manually:${NC}"
    echo "kubectl apply -f services/kibana-ingress.yml -n dev"
    exit 1
fi

# 10. Check if hosts file needs to be updated
echo -e "\n${GREEN}Checking hosts file...${NC}"
if ! grep -q "dev.projectcrawler.com" /etc/hosts; then
    echo "Please add the following line to your /etc/hosts file:"
    echo "127.0.0.1 dev.projectcrawler.com"
    echo "You may need to run: sudo nano /etc/hosts"
fi

echo -e "\n${BLUE}Deployment completed!${NC}"
echo "Please run the following command in a new terminal:"
echo "minikube tunnel"
echo -e "After that, you can access the application at: ${GREEN}http://dev.projectcrawler.com${NC}"
echo -e "For logs, visit: ${GREEN}https://dev.projectcrawler.com/kibana${NC}"
echo -e "\nRemember to configure Kibana by:"
echo "1. Go to Stack Management -> Index Patterns -> Create index pattern"
echo "2. Name the pattern 'node-logs-*'"
echo "3. Set Time field to '@timestamp'"
echo "4. Click Create index pattern"
echo "5. Go to Discover menu to view logs"
echo "if you're using the project for the first time, you need to link the domain to your address. Run these commands:"
echo "1. sudo nano /etc/hosts"
echo "2. 127.0.0.1 dev.projectcrawler.com"
echo "3. Save"
echo "If you want to reset the project, run the reset.sh script"
