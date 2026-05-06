#!/bin/bash
# ローカルから EC2 へ Spring Boot JAR をデプロイするスクリプト
# 使い方: ./scripts/deploy.sh <EC2_PUBLIC_IP>
# 例:     ./scripts/deploy.sh 54.249.xxx.xxx

set -e

EC2_IP="${1:?使い方: $0 <EC2_PUBLIC_IP>}"
KEY_PATH="${KEY_PATH:-$HOME/.ssh/taskmanagement-key.pem}"
SSH_USER="ec2-user"
APP_DIR="/opt/taskmanagement"
JAR_NAME="task-management-0.0.1-SNAPSHOT.jar"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== [1/4] JAR ビルド ==="
cd "$REPO_ROOT/backend"
./gradlew build -x test

echo "=== [2/4] EC2 へ JAR を転送 ==="
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_IP" \
  "sudo mkdir -p $APP_DIR && sudo chown $SSH_USER:$SSH_USER $APP_DIR"

scp -i "$KEY_PATH" \
  "$REPO_ROOT/backend/build/libs/$JAR_NAME" \
  "$SSH_USER@$EC2_IP:$APP_DIR/$JAR_NAME"

echo "=== [3/4] startup.sh を転送 ==="
scp -i "$KEY_PATH" \
  "$REPO_ROOT/scripts/startup.sh" \
  "$SSH_USER@$EC2_IP:/tmp/startup.sh"

ssh -i "$KEY_PATH" "$SSH_USER@$EC2_IP" \
  "sudo mv /tmp/startup.sh $APP_DIR/startup.sh && sudo chmod +x $APP_DIR/startup.sh"

echo "=== [4/4] アプリ再起動 ==="
ssh -i "$KEY_PATH" "$SSH_USER@$EC2_IP" \
  "sudo systemctl restart taskmanagement || sudo $APP_DIR/startup.sh &"

echo ""
echo "デプロイ完了！"
echo "ログ確認: ssh -i $KEY_PATH $SSH_USER@$EC2_IP 'tail -f /var/log/taskmanagement/app.log'"
echo "疎通確認: curl http://$EC2_IP:8080/actuator/health"
