pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Deploy Full Stack (Production)') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([
                    string(credentialsId: 'DATABASE_URL', variable: 'DATABASE_URL'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET')
                ]) {

                    sh '''
                    echo "Stopping existing containers..."
                    docker compose -f docker-compose.prod.yml down || true

                    echo "Building and starting containers..."
                    docker compose -f docker-compose.prod.yml up -d --build

                    echo "Deployment completed."
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Full stack deployed successfully 🚀"
        }
        failure {
            echo "Deployment failed ❌"
        }
    }
}
