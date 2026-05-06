output "public_ip" {
  description = "EC2 のパブリック IP"
  value       = aws_instance.app.public_ip
}

output "security_group_id" {
  description = "EC2 セキュリティグループ ID（RDS モジュールから参照）"
  value       = aws_security_group.ec2.id
}
