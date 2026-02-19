pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Blue-Green Backend Deploy (Safe)') {
            steps {
                withCredentials([
                    string(credentialsId: 'DATABASE_URL', variable: 'DATABASE_URL'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'JWT_REFRESH_SECRET', variable: 'JWT_REFRESH_SECRET')
                ]) {

                    sh '''
                    echo "=============================="
                    echo "Building backend image..."
                    echo "=============================="
                    docker build -t task-backend-new ./backend

                    echo "Detecting active backend port..."
                    ACTIVE_PORT=$(grep -oP 'server localhost:\\K[0-9]+' /etc/nginx/conf.d/app.conf)

                    if [ "$ACTIVE_PORT" = "5000" ]; then
                        NEW_PORT=5001
                    else
                        NEW_PORT=5000
                    fi

                    echo "Active: $ACTIVE_PORT"
                    echo "Deploying to: $NEW_PORT"

                    echo "Removing old GREEN if exists..."
                    docker rm -f task-backend-green 2>/dev/null || true

                    echo "Starting GREEN container..."
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

                    echo "Waiting for health..."
                    
                    for i in {1..8}; do
                        if curl -f http://localhost:$NEW_PORT/api/health; then
                            echo "Health OK ✅"
                            break
                        fi
                        echo "Retry $i..."
                        sleep 3
                    done

                    if ! curl -f http://localhost:$NEW_PORT/api/health; then
                        echo "Health FAILED ❌ Rolling back"
                        docker rm -f task-backend-green
                        exit 1
                    fi

                    echo "Switching nginx..."
                    sudo sed -i "s/server localhost:$ACTIVE_PORT;/server localhost:$NEW_PORT;/" /etc/nginx/conf.d/app.conf
                    sudo nginx -t
                    sudo systemctl reload nginx

                    echo "Validating via nginx..."
                    sleep 5

                    if ! curl -f http://localhost/api/health; then
                        echo "Switch failed ❌ Reverting"
                        sudo sed -i "s/server localhost:$NEW_PORT;/server localhost:$ACTIVE_PORT;/" /etc/nginx/conf.d/app.conf
                        sudo systemctl reload nginx
                        docker rm -f task-backend-green
                        exit 1
                    fi

                    echo "Stopping old backend..."
                    docker stop task-backend 2>/dev/null || true
                    docker rm task-backend 2>/dev/null || true

                    docker rename task-backend-green task-backend

                    echo "=================================="
                    echo "Deployment SUCCESS 🚀"
                    echo "=================================="
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
