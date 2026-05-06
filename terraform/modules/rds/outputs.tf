output "endpoint" {
  description = "RDS エンドポイント（SSM Parameter Store に登録する値）"
  value       = aws_db_instance.main.endpoint
}

output "address" {
  description = "RDS ホスト名（ポートなし）"
  value       = aws_db_instance.main.address
}
