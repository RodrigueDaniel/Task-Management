pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Blue-Green Backend Deploy (Production Safe)') {
            steps {
                withCredentials([
                    string(credentialsId: 'DATABASE_URL', variable: 'DATABASE_URL'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'JWT_REFRESH_SECRET', variable: 'JWT_REFRESH_SECRET')
                ]) {

                    sh '''
                    set -e

                    echo "========================================"
                    echo "Building new backend image..."
                    echo "========================================"
                    docker build -t task-backend-new ./backend


                    echo "========================================"
                    echo "Detecting active backend port..."
                    echo "========================================"

                    ACTIVE_PORT=$(grep -oP 'server localhost:\\K[0-9]+' /etc/nginx/conf.d/app.conf)

                    if [ "$ACTIVE_PORT" = "5000" ]; then
                        NEW_PORT=5001
                    else
                        NEW_PORT=5000
                    fi

                    echo "Active Port : $ACTIVE_PORT"
                    echo "New Port    : $NEW_PORT"


                    echo "========================================"
                    echo "Cleaning old GREEN container..."
                    echo "========================================"
                    docker rm -f task-backend-green 2>/dev/null || true


                    echo "========================================"
                    echo "Freeing target port if occupied..."
                    echo "========================================"
                    docker ps --filter "publish=$NEW_PORT" --format "{{.ID}}" | xargs -r docker rm -f


                    echo "========================================"
                    echo "Starting GREEN container..."
                    echo "========================================"
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


                    echo "========================================"
                    echo "Waiting for backend health..."
                    echo "========================================"

                    HEALTH_OK=false

                    for i in {1..20}
                    do
                        if curl -sf http://localhost:$NEW_PORT/api/health > /dev/null; then
                            HEALTH_OK=true
                            echo "Health check PASSED on attempt $i ✅"
                            break
                        fi
                        echo "Attempt $i failed... retrying"
                        sleep 3
                    done

                    if [ "$HEALTH_OK" = false ]; then
                        echo "Health check FAILED ❌"
                        docker rm -f task-backend-green || true
                        exit 1
                    fi


                    echo "========================================"
                    echo "Switching nginx upstream..."
                    echo "========================================"

                    sudo sed -i "s/server localhost:$ACTIVE_PORT;/server localhost:$NEW_PORT;/" /etc/nginx/conf.d/app.conf
                    sudo nginx -t
                    sudo systemctl reload nginx


                    echo "========================================"
                    echo "Validating through nginx..."
                    echo "========================================"
                    sleep 5

                    if ! curl -sf http://localhost/api/health > /dev/null; then
                        echo "Nginx validation FAILED ❌ Reverting..."

                        sudo sed -i "s/server localhost:$NEW_PORT;/server localhost:$ACTIVE_PORT;/" /etc/nginx/conf.d/app.conf
                        sudo systemctl reload nginx

                        docker rm -f task-backend-green || true
                        exit 1
                    fi


                    echo "========================================"
                    echo "Stopping old backend..."
                    echo "========================================"
                    docker stop task-backend 2>/dev/null || true
                    docker rm task-backend 2>/dev/null || true

                    docker rename task-backend-green task-backend


                    echo "========================================"
                    echo "BLUE-GREEN DEPLOYMENT SUCCESS 🚀"
                    echo "========================================"
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
