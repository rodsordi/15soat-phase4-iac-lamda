output "api_endpoint" {
  description = "HTTP API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "authorizer_function_arn" {
  description = "Lambda Authorizer ARN"
  value       = aws_lambda_function.authorizer.arn
}

output "webhook_function_arn" {
  description = "Mercado Pago Webhook Lambda ARN"
  value       = aws_lambda_function.webhook.arn
}

output "webhook_url" {
  description = "Public endpoint for Mercado Pago Webhooks"
  value       = "${aws_apigatewayv2_api.http_api.api_endpoint}/webhooks/mercadopago"
}

output "auth_function_arn" {
  description = "Auth Lambda Function ARN"
  value       = aws_lambda_function.auth.arn
}

output "auth_login_url" {
  description = "Public endpoint for User Login and JWT token issuance"
  value       = "${aws_apigatewayv2_api.http_api.api_endpoint}/auth/login"
}

output "jwks_url" {
  description = "Public endpoint for JSON Web Key Set"
  value       = "${aws_apigatewayv2_api.http_api.api_endpoint}/.well-known/jwks.json"
}
