pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "jnaneshppalan/task-backend-prisma"
        DOCKER_TAG = "latest"
        CONTAINER_NAME = "task-container"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    sh "docker build -t $DOCKER_IMAGE:$DOCKER_TAG ."
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $DOCKER_IMAGE:$DOCKER_TAG
                    """
                }
            }
        }

        stage('Deploy Container') {
            steps {
                sh """
                docker stop $CONTAINER_NAME || true
                docker rm $CONTAINER_NAME || true

                docker run -d \
                  --name $CONTAINER_NAME \
                  --restart unless-stopped \
                  -p 5000:5000 \
                  -e DATABASE_URL='${DATABASE_URL}' \
                  -e JWT_SECRET='${JWT_SECRET}' \
                  -e JWT_EXPIRES_IN=1d \
                  -e NODE_ENV=production \
                  -e PORT=5000 \
                  $DOCKER_IMAGE:$DOCKER_TAG
                """
            }
        }
    }
}
