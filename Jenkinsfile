pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Blue-Green Backend Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'DATABASE_URL', variable: 'DATABASE_URL'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'JWT_REFRESH_SECRET', variable: 'JWT_REFRESH_SECRET')
                ]) {

                    sh '''
                    echo "Building new backend image..."
                    docker build -t task-backend-new ./backend

                    echo "Starting GREEN backend on port 5001..."
                    docker run -d --name task-backend-green \
                      -p 5001:5000 \
                      -e DATABASE_URL="$DATABASE_URL" \
                      -e JWT_SECRET="$JWT_SECRET" \
                      -e JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
                      -e ACCESS_TOKEN_EXPIRES=30m \
                      -e REFRESH_TOKEN_EXPIRES=7d \
                      -e CLIENT_URL=http://135.116.17.230 \
                      -e NODE_ENV=production \
                      task-backend-new

                    echo "Waiting for GREEN to become healthy..."
                    sleep 8

                    if curl -f http://localhost:5001/api/health; then
                        echo "Health check passed. Switching traffic..."

                        sudo sed -i 's/server localhost:5000;/server localhost:5001;/' /etc/nginx/conf.d/app.conf
                        sudo nginx -t
                        sudo systemctl reload nginx

                        echo "Stopping old BLUE backend..."
                        docker stop task-backend || true
                        docker rm task-backend || true

                        docker rename task-backend-green task-backend

                        echo "Blue-Green deployment successful!"
                    else
                        echo "Health check failed. Rolling back..."
                        docker stop task-backend-green || true
                        docker rm task-backend-green || true
                        exit 1
                    fi
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Backend Blue-Green deployed successfully 🚀"
        }
        failure {
            echo "Deployment failed. Rolled back safely ❌"
        }
    }
}
