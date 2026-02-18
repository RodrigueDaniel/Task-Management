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
                    echo "=============================="
                    echo "Building new backend image..."
                    echo "=============================="
                    docker build -t task-backend-new ./backend


                    echo "=============================="
                    echo "Detecting active backend port"
                    echo "=============================="

                    ACTIVE_PORT=$(grep -oP 'server localhost:\\K[0-9]+' /etc/nginx/conf.d/app.conf)

                    if [ "$ACTIVE_PORT" = "5000" ]; then
                        NEW_PORT=5001
                    else
                        NEW_PORT=5000
                    fi

                    echo "Active port: $ACTIVE_PORT"
                    echo "New port: $NEW_PORT"


                    echo "=============================="
                    echo "Cleaning old GREEN container"
                    echo "=============================="
                    docker rm -f task-backend-green 2>/dev/null || true


                    echo "=============================="
                    echo "Starting GREEN on port $NEW_PORT"
                    echo "=============================="

                    docker run -d --name task-backend-green \
                      -p $NEW_PORT:5000 \
                      -e DATABASE_URL="$DATABASE_URL" \
                      -e JWT_SECRET="$JWT_SECRET" \
                      -e JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
                      -e ACCESS_TOKEN_EXPIRES=30m \
                      -e REFRESH_TOKEN_EXPIRES=7d \
                      -e CLIENT_URL=http://135.116.17.230 \
                      -e NODE_ENV=production \
                      task-backend-new


                    echo "=============================="
                    echo "Waiting for health check..."
                    echo "=============================="
                    sleep 8


                    if curl -f http://localhost:$NEW_PORT/api/health; then

                        echo "Health check PASSED ✅"
                        echo "Switching nginx upstream..."

                        sudo sed -i "s/server localhost:$ACTIVE_PORT;/server localhost:$NEW_PORT;/" /etc/nginx/conf.d/app.conf
                        sudo nginx -t
                        sudo systemctl reload nginx


                        echo "Stopping old backend..."
                        docker stop task-backend 2>/dev/null || true
                        docker rm task-backend 2>/dev/null || true

                        docker rename task-backend-green task-backend

                        echo "==================================="
                        echo "Blue-Green Deployment SUCCESS 🚀"
                        echo "==================================="

                    else
                        echo "Health check FAILED ❌"
                        echo "Rolling back..."

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
