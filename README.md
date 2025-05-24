# Projet Crawler

## Prérequis
- Docker
- Minikube
- kubectl

## Installation et déploiement

Il y à deux façons de lancer le projet :
## 1: Script
1. Ouvrir un terminal à la racine du projet
2. Exécuter ces commandes :
   ```bash
   chmod +x start.sh
   chmod +x reset.sh
   ```
3. Exécuter le script de démarrage avec cette commande : 
   ```bash
   ./start.sh
   ```
4. Si c'est la première utilisation, configurer le fichier hosts :
   ```bash
   sudo nano /etc/hosts
   ```
   Ajouter la ligne :
   ```
   127.0.0.1 dev.projectcrawler.com
   ```
5. Démarrer le tunnel Minikube (entrer le mot de passe si nécessaire) :
   ```bash
   minikube tunnel
   ```
6. Pour voir les logs de l'application, se rendre sur `https://dev.projectcrawler.com/kibana`
    Puis aller dans Stack Management -> Index Patterns -> Create index pattern
    Nommer le pattern 'node-logs-*'
    Mettre le Time field sur '@timestamp' puis cliquer sur Create index pattern
    Aller sur le menu Discover et les logs apparaîtront
Le script peut prendre du temps à s'exécuter, notamment la commande pour activer le module ingress, et certaines commandes peuvent tomber en erreur.
Pour supprimer le projet après utilisation, lancer le script de reset :
   ```bash
   ./reset.sh
   ```

## 2: Faire les commandes manuellement
1. Ouvrir un terminal à la racine du projet et exécuter ces commandes pour créer les images Docker (Docker doit être ouvert) :
   ```bash
   cd crawler-front
   docker build -t projectcrawler-frontend:1.0.0 .
   cd ../crawler-api
   docker build -t projectcrawler-api:1.0.0 .
   cd ../crawler
   docker build -t projectcrawler-crawler:1.0.0 .
   ```

2. Démarrer Minikube :
   ```bash
   minikube start --driver=docker --profile=projectcrawler
   minikube profile projectcrawler
   ```

3. Charger les images Docker dans Minikube :
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

4. Créer le namespace :
   ```bash
   cd ../manifests
   kubectl apply -f namespaces/namespace-dev.yml
   ```

5. Créer le volume partagé :
   ```bash
   kubectl apply -f storage/websites-pvc.yml -n dev
   ```

6. Déployer MongoDB (base de données) :
   ```bash
   kubectl apply -f storage/mongodb-pvc.yml -n dev
   kubectl apply -f deployments/mongodb/deployment-dev.yml -n dev
   kubectl apply -f services/mongodb-service.yml -n dev
   ```

7. Déployer ElasticSearch et Kibana : 
   ```bash
   kubectl apply -f deployments/elasticsearch/deployment-dev.yml -n dev
   kubectl apply -f services/elasticsearch-nodeport.yml -n dev
   kubectl apply -f deployments/kibana/deployment-dev.yml -n dev
   kubectl apply -f services/kibana-service.yml -n dev
   ```

8. Déployer les autres services :
    ```bash
    kubectl apply -f deployments/front/deployment-dev.yml -n dev
    kubectl apply -f deployments/api/deployment-dev.yml -n dev
    kubectl apply -f deployments/rabbitmq/deployment-dev.yml -n dev
    kubectl apply -f services/rabbitmq-service.yml -n dev
    kubectl apply -f deployments/crawler/deployment-dev.yml -n dev
    ```

9. Configurer l'Ingress :
    ```bash
    minikube addons enable ingress
    kubectl apply -f services/api-nodeport.yml -n dev
    kubectl apply -f services/crawler-nodeport.yml -n dev
    kubectl apply -f services/front-nodeport.yml -n dev
    kubectl apply -f services/app-ingress.yml -n dev
    kubectl apply -f services/kibana-ingress.yml -n dev
    ```

10. Configurer le fichier hosts :
    ```bash
    sudo nano /etc/hosts
    ```
    Ajouter la ligne :
    ```
    127.0.0.1 dev.projectcrawler.com
    ```

11. Démarrer le tunnel Minikube (entrer le mot de passe si nécessaire) :
    ```bash
    minikube tunnel
    ```

12. Accéder à l'application :
    Ouvrir votre navigateur et aller sur `http://dev.projectcrawler.com`

13. Pour voir les logs de l'application, se rendre sur `https://dev.projectcrawler.com/kibana`
    Puis aller dans Stack Management -> Index Patterns -> Create index pattern
    Nommer le pattern 'node-logs-*'
    Mettre le Time field sur '@timestamp' puis cliquer sur Create index pattern
    Aller sur le menu Discover et les logs apparaîtront