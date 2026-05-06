#!/bin/bash
# EC2 上で Spring Boot を起動するスクリプト
# SSM Parameter Store から DB 接続情報を取得して環境変数に設定する

set -e

APP_DIR="/opt/taskmanagement"
JAR_NAME="task-management-0.0.1-SNAPSHOT.jar"
LOG_FILE="/var/log/taskmanagement/app.log"
REGION="ap-northeast-1"

mkdir -p /var/log/taskmanagement

echo "[startup] SSM から接続情報を取得中..."
DB_URL=$(aws ssm get-parameter \
  --name "/taskmanagement/db-url" \
  --region "$REGION" \
  --query Parameter.Value \
  --output text)

DB_USERNAME=$(aws ssm get-parameter \
  --name "/taskmanagement/db-username" \
  --region "$REGION" \
  --query Parameter.Value \
  --output text)

DB_PASSWORD=$(aws ssm get-parameter \
  --name "/taskmanagement/db-password" \
  --region "$REGION" \
  --with-decryption \
  --query Parameter.Value \
  --output text)

export DB_URL
export DB_USERNAME
export DB_PASSWORD
export SPRING_PROFILES_ACTIVE=prod

echo "[startup] Spring Boot 起動中..."
exec java -jar "$APP_DIR/$JAR_NAME" >> "$LOG_FILE" 2>&1
