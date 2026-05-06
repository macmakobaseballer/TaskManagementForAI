terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
}

module "ec2" {
  source            = "./modules/ec2"
  project_name      = var.project_name
  vpc_id            = module.vpc.vpc_id
  public_subnet_id  = module.vpc.public_subnet_a_id
  key_name          = var.key_name
  allowed_ssh_cidr  = var.allowed_ssh_cidr
}

module "rds" {
  source              = "./modules/rds"
  project_name        = var.project_name
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.public_subnet_ids
  ec2_security_group  = module.ec2.security_group_id
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
}

module "s3_cloudfront" {
  source       = "./modules/s3_cloudfront"
  project_name = var.project_name
  ec2_endpoint = "http://${module.ec2.public_ip}:8080"
}
