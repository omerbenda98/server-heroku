pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        GITHUB_CREDENTIALS = credentials('github-credentials')
        DOCKER_IMAGE = 'omerbenda98/puppy-adoption-backend'
        GIT_REPO = 'https://github.com/omerbenda98/server-heroku.git'
        GIT_PATH = '/usr/bin/git'
        BRANCH_NAME = 'staging'  // Matching frontend setup with staging branch
    }
    
    tools {
        nodejs 'nodejs'
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Thorough cleanup and clone
                sh """
                    rm -rf .[!.]* ..?* * || true
                    git clone -b ${BRANCH_NAME} ${GIT_REPO} .
                """
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo "Installing Node.js dependencies..."
                sh 'npm ci'
            }
        }
        
        stage('Run Tests') {
            steps {
                echo "Running tests..."
                sh 'npm test -- --watchAll=false'  // Non-interactive mode for CI
            }
        }
        
        stage('Build and Push Docker Image') {
            steps {
                echo "Building and pushing Docker image..."
                sh """
                    echo \$DOCKERHUB_CREDENTIALS_PSW | docker login -u \$DOCKERHUB_CREDENTIALS_USR --password-stdin
                    docker build \
                        --memory=2g \
                        --memory-swap=2g \
                        --cpu-period=100000 \
                        --cpu-quota=25000 \
                        -t ${DOCKER_IMAGE}:v1.\${BUILD_NUMBER} .
                    docker push ${DOCKER_IMAGE}:v1.\${BUILD_NUMBER}
                """
            }
            post {
                always {
                    sh 'docker logout'
                }
            }
        }
        
        stage('Update K8s Manifests') {
            steps {
                script {
                    def targetPath = 'staging'
                    def targetNamespace = 'staging'
                    
                    echo "Updating K8s manifests for ${targetNamespace} environment..."
                    
                    sh """
                        rm -rf k8s-repo || true
                        
                        # Initialize new Git repo for k8s
                        ${GIT_PATH} init k8s-repo
                        cd k8s-repo
                        ${GIT_PATH} config --local user.email "jenkins@jenkins.com"
                        ${GIT_PATH} config --local user.name "Jenkins"
                        
                        # Clone k8s repo
                        ${GIT_PATH} remote add origin https://\$GITHUB_CREDENTIALS_USR:\$GITHUB_CREDENTIALS_PSW@github.com/omerbenda98/puppy-adoption-k8s.git
                        ${GIT_PATH} fetch origin main
                        ${GIT_PATH} checkout -b main origin/main
                        
                        echo "Updating deployment.yaml..."
                        sed -i "s|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:v1.\${BUILD_NUMBER}|" ${targetPath}/backend/deployment.yaml
                        
                        if ${GIT_PATH} diff --quiet; then
                            echo "No changes to commit"
                        else
                            echo "Committing and pushing changes..."
                            ${GIT_PATH} add ${targetPath}/backend/deployment.yaml
                            ${GIT_PATH} commit -m "Update backend image to v1.\${BUILD_NUMBER} in ${targetNamespace}"
                            ${GIT_PATH} push origin main
                        fi
                    """
                }
            }
        }
    }
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed! Check the logs above for details.'
        }
        always {
            cleanWs()
        }
    }
}