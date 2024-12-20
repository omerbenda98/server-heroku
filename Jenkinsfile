pipeline {
    agent any
    options {
        skipDefaultCheckout(true)
    }
    tools {
        nodejs 'nodejs'
    }
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        GITHUB_CREDENTIALS = credentials('github-credentials')
        DOCKER_IMAGE = 'omerbenda98/puppy-adoption-backend'
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/omerbenda98/server-heroku.git',
                    branch: 'main',
                    credentialsId: 'github-credentials'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        stage('Build and Push Docker Image') {
            steps {
                script {
                    sh """
                        echo \$DOCKERHUB_CREDENTIALS_PSW | docker login -u \$DOCKERHUB_CREDENTIALS_USR --password-stdin
                        docker build -t ${DOCKER_IMAGE}:v1.\${BUILD_NUMBER} .
                        docker push ${DOCKER_IMAGE}:v1.\${BUILD_NUMBER}
                    """
                }
            }
            post {
                always {
                    sh 'docker logout'
                }
            }
        }
        stage('Update K8s Manifests') {
            steps {
                sh """
                    set -e  # Exit on any error
                    rm -rf k8s-repo || true
                    git config --global user.email "jenkins@jenkins.com"
                    git config --global user.name "Jenkins"
                    git clone https://\$GITHUB_CREDENTIALS_USR:\$GITHUB_CREDENTIALS_PSW@github.com/omerbenda98/puppy-adoption-k8s.git k8s-repo
                    cd k8s-repo
                    if [ ! -f development/backend/deployment.yaml ] || [ ! -f production/backend/deployment.yaml ]; then
                        echo "Deployment files not found!"
                        exit 1
                    fi
                    
                    sed -i "s|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:v1.\${BUILD_NUMBER}|" development/backend/deployment.yaml
                    sed -i "s|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:v1.\${BUILD_NUMBER}|" production/backend/deployment.yaml
                    
                    if git diff --quiet; then
                        echo "No changes to commit"
                    else
                        git add development/backend/deployment.yaml production/backend/deployment.yaml
                        git commit -m "Update backend deployment image to v1.\${BUILD_NUMBER}"
                        git push
                    fi
                """
            }
        }
    }
}