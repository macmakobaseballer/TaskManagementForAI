output "ec2_public_ip" {
  description = "EC2 のパブリック IP（API 疎通確認・SSH に使用）"
  value       = module.ec2.public_ip
}

output "rds_endpoint" {
  description = "RDS のエンドポイント（SSM Parameter Store に登録する値）"
  value       = module.rds.endpoint
}

output "cloudfront_url" {
  description = "フロントエンドの URL"
  value       = "https://${module.s3_cloudfront.cloudfront_domain}"
}

output "api_health_url" {
  description = "バックエンドのヘルスチェック URL"
  value       = "http://${module.ec2.public_ip}:8080/actuator/health"
}
