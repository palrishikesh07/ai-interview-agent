pipeline{
    agent any
    stages{
        stage('checkout'){
            steps{
                checkout scm
            }
        }

        stage('Install Dependencies'){
            steps{
                sh 'npm ci'
            }
        }

        stage('Unit tests'){
            steps{
                sh 'npm test -- --runInBand'
            }
        }

        stage('Lint'){
            steps{
                sh 'npm run lint'
            }
        }

        stage('Build'){
            steps{
                sh 'npm run build'
            }
        }
    }

    post{
        sucess{
            echo 'AI Interview Agent CI Pipeline successfull'
        }

        failure{
            echo 'Pipeline failed'
        }
    }
}