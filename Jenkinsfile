pipeline {
    agent any

    environment {
        IMAGE_NAME = 'todo-list'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        TODO_IMAGE = "todo-list:${env.BUILD_NUMBER}"
        APP_HEALTH_URL = 'http://host.docker.internal:3000/health'
        ANSIBLE_HOST_KEY_CHECKING = 'False'
        ANSIBLE_CONFIG = "${env.WORKSPACE}/ansible.cfg"
    }

    triggers {
        pollSCM('* * * * *')
    }



    options {
        timestamps()
    }


    stages {
        stage('Checkout из GitHub') {
            steps {
                checkout scm
            }
        }

        stage('Сборка Docker-образа') {
            steps {
                sh '''
                    docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" -t "${IMAGE_NAME}:latest" .
                    docker image ls "${IMAGE_NAME}"
                '''
            }
        }

        stage('Запуск контейнера') {
            steps {
                sh '''
                    docker compose down --remove-orphans || true
                    docker compose up -d --no-build
                '''
                sh '''
                    for i in $(seq 1 20); do
                        if curl -fsS "${APP_HEALTH_URL}"; then
                            echo
                            echo "Контейнер приложения отвечает на http://localhost:3000"
                            exit 0
                        fi
                        sleep 3
                    done
                    echo "Приложение не ответило на /health"
                    docker compose logs
                    exit 1
                '''
            }
        }

        stage('Отправка образа и развёртывание через Ansible') {
            steps {
                sh '''
                    docker save "${IMAGE_NAME}:${IMAGE_TAG}" -o "todo-list-${IMAGE_TAG}.tar"
                    docker compose down --remove-orphans || true
                    ansible-playbook ansible/deploy-image.yml \
                        -i "${WORKSPACE}/ansible/inventory.ini" \
                        --private-key /var/jenkins_home/.ssh/id_ed25519 \
                        -e "docker_image_name=${IMAGE_NAME}" \
                        -e "docker_image_tag=${IMAGE_TAG}" \
                        -e "image_archive=${WORKSPACE}/todo-list-${IMAGE_TAG}.tar"
                '''
            }
        }
    }

    post {
        always {
            sh 'rm -f "todo-list-${IMAGE_TAG}.tar" || true'
        }
    }
}
