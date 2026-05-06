variable "aws_region" {
  description = "デプロイ先の AWS リージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "プロジェクト名（リソース名のプレフィックスに使用）"
  type        = string
  default     = "taskmanagement"
}

variable "vpc_cidr" {
  description = "VPC の CIDR ブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "key_name" {
  description = "EC2 に SSH 接続するためのキーペア名（AWS 上で事前に作成する）"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "SSH を許可する IP アドレス（自分のグローバル IP を設定）"
  type        = string
}

variable "db_name" {
  description = "RDS データベース名"
  type        = string
  default     = "taskmanagement"
}

variable "db_username" {
  description = "RDS マスターユーザー名"
  type        = string
  default     = "taskmanager"
}

variable "db_password" {
  description = "RDS マスターパスワード（terraform.tfvars に記載、git 管理外）"
  type        = string
  sensitive   = true
}
