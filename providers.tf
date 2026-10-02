terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  backend "s3" {
    bucket         = "fiap-phase4-terraform-state"
    key            = "iac-lamda/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "fiap-phase4-tf-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "FIAP-TechChallenge-Phase4"
      ManagedBy   = "Terraform"
      Environment = var.environment
    }
  }
}
