variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-east-2"
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

variable "use_existing_lab_role" {
  type        = bool
  description = "Whether to use existing AWS Academy LabRole instead of creating IAM roles"
  default     = false
}

variable "lab_role_name" {
  type        = string
  description = "Name of the existing IAM role for AWS Academy Learner Lab"
  default     = "LabRole"
}

variable "jwt_private_key" {
  type        = string
  description = "RSA Private Key PEM for signing JWT tokens"
  default     = ""
  sensitive   = true
}

variable "jwt_public_key" {
  type        = string
  description = "RSA Public Key PEM for JWKS verification"
  default     = ""
}
