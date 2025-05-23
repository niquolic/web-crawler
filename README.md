# Projet Crawler

## Prérequis
- Docker
- Minikube
- kubectl

## Installation et déploiement

1. Se placer dans le projet crawler-front et exécuter la commande :
   ```bash
   docker build -t projectcrawler-frontend:1.0.0 .
   ```

2. Se placer dans le projet crawler-api et exécuter la commande :
   ```bash
   docker build -t projectcrawler-api:1.0.0 .
   ```

3. Se placer dans le projet crawler et exécuter la commande :
   ```bash
   docker build -t projectcrawler-crawler:1.0.0 .
   ```

4. Se placer dans le dossier manifests

5. Démarrer Minikube :
   ```bash
   minikube start --driver=docker --profile=projectcrawler
   minikube profile projectcrawler
   ```

6. Charger les images Docker dans Minikube :
   ```bash
   # Activer le daemon Docker de Minikube
   eval $(minikube docker-env)

   # Reconstruire les images dans le contexte de Minikube
   cd ../crawler-front
   docker build -t projectcrawler-frontend:1.0.0 .
   cd ../crawler-api
   docker build -t projectcrawler-api:1.0.0 .
   cd ../crawler
   docker build -t projectcrawler-crawler:1.0.0 .

   # Désactiver le daemon Docker de Minikube
   eval $(minikube docker-env -u)
   ```

7. Créer le namespace :
   ```bash
   kubectl apply -f namespaces/namespace-dev.yml
   ```

8. Créer le volume partagé :
   ```bash
   kubectl apply -f storage/websites-pvc.yml -n dev
   ```

9. Déployer MongoDB (base de données) :
   ```bash
   kubectl apply -f storage/mongodb-pvc.yml -n dev
   kubectl apply -f deployments/mongodb/deployment-dev.yml -n dev
   kubectl apply -f services/mongodb-service.yml -n dev
   ```
   > MongoDB sera accessible pour les autres services du cluster à l'adresse : `mongodb://mongodb:27017/crawler`

10. Déployer les autres services :
    ```bash
    kubectl apply -f deployments/front/deployment-dev.yml -n dev
    kubectl apply -f deployments/api/deployment-dev.yml -n dev
    kubectl apply -f deployments/rabbitmq/deployment-dev.yml -n dev
    kubectl apply -f services/rabbitmq-service.yml -n dev
    kubectl apply -f deployments/crawler/deployment-dev.yml -n dev
    ```

11. Configurer l'Ingress :
    ```bash
    minikube addons enable ingress
    kubectl apply -f services/api-nodeport.yml -n dev
    kubectl apply -f services/crawler-nodeport.yml -n dev
    kubectl apply -f services/front-nodeport.yml -n dev
    kubectl apply -f services/app-ingress.yml -n dev
    ```

12. Configurer le fichier hosts :
    ```bash
    sudo nano /etc/hosts
    ```
    Ajouter la ligne :
    ```
    127.0.0.1 dev.projectcrawler.com
    ```

13. Démarrer le tunnel Minikube :
    ```bash
    minikube tunnel
    ```

14. Accéder à l'application :
    Ouvrir votre navigateur et aller sur `http://dev.projectcrawler.com`