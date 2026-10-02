# Infraestrutura Serverless Lambda & API Gateway (`15soat-phase4-iac-lamda`)

Infraestrutura Serverless provisionada como código via Terraform para autenticação perimetral no API Gateway e proxy seguro de webhooks de pagamento.

## Componentes
- **AWS HTTP API Gateway**: Ponto de entrada público de alta escalabilidade e baixa latência para os endpoints serverless.
- **Lambda Token Authorizer (`src/authorizer`)**: Função em Node.js responsável por validar a autenticidade e integridade dos tokens Bearer JWT antes de autorizar o encaminhamento da requisição aos microsserviços privados.
- **Proxy de Webhook do Mercado Pago (`src/webhook`)**: Receptor serverless desacoplado para notificações assíncronas de pagamento do gateway externo, garantindo ingestão resiliente com absorção de picos de tráfego sem expor o cluster Kubernetes.
- **Observabilidade com Amazon CloudWatch**: Políticas automáticas de retenção de logs estruturados e métricas de execução das funções serverless.

## Validação Sintática e de Conformidade
```bash
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```
