variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "prd"
}

variable "api_name" {
  type        = string
  description = "API Gateway name"
  default     = "fiap-workshop-serverless-api"
}
