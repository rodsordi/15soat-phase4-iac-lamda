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

variable "use_existing_lab_role" {
  type        = bool
  description = "Whether to use existing AWS Academy LabRole instead of creating IAM roles"
  default     = true
}

variable "lab_role_name" {
  type        = string
  description = "Name of the existing IAM role for AWS Academy Learner Lab"
  default     = "LabRole"
}
