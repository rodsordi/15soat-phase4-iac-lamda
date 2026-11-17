# Plano de Implementação: Migração da Infraestrutura Serverless Lambda para us-east-2 (iac-lamda)

> **Decisão do Usuário**: Opção 1 - Migração para us-east-2 & Criação de IAM Role Nativa com use_existing_lab_role = false
> **Status**: Aprovado para Execução

---

## 1. Contexto & Diagnóstico

O repositório `15soat-phase4-iac-lamda` gerencia a camada de integração serverless da oficina mecânica (Tech Challenge Fase 4), compreendendo:
- **`fiap-authorizer-prd`**: Função Lambda de autorização de requisição (Request Authorizer) para validação de tokens JWT.
- **`fiap-mercadopago-webhook-prd`**: Função Lambda para ingestão e processamento de webhooks de notificação de pagamento do MercadoPago.
- **Amazon API Gateway HTTP API v2**: Exposição pública do endpoint `POST /webhooks/mercadopago` com CORS e autorizador integrado.

Com a migração do projeto para a nova conta AWS Free Tier na região `us-east-2`, o backend S3 (`fiap-phase4-terraform-state/iac-lamda/terraform.tfstate`), os recursos de infraestrutura e o pipeline de CI/CD devem ser alinhados à mesma região. Além disso, a dependência legada do AWS Academy (`LabRole`) deve ser desativada (`use_existing_lab_role = false`), permitindo ao Terraform criar a IAM Role nativa `fiap-workshop-lambda-exec-prd` com a política `AWSLambdaBasicExecutionRole`.

---

## 2. Ações de Implementação

### 2.1 Alinhamento de Região e IAM Role no Terraform
- Em `providers.tf`:
  - Atualizar o `backend "s3"`: `region = "us-east-2"`.
- Em `variables.tf`:
  - Atualizar o default de `aws_region` para `"us-east-2"`.
  - Atualizar o default de `use_existing_lab_role` de `true` para `false`.
- Em `.github/workflows/terraform.yml`:
  - Atualizar o fallback de `AWS_REGION` de `'us-east-1'` para `'us-east-2'`.
- Em `terraform.tfvars.example`:
  - Atualizar `aws_region = "us-east-2"`.
  - Adicionar `use_existing_lab_role = false`.

### 2.2 Formatação e Validação
- Executar `terraform fmt -recursive`.
- Executar `terraform init` e `terraform validate`.
- Executar teste de `terraform plan` local.
- Submeter as alterações à auditoria do subagente `Code Reviewer Sentinel`.

### 2.3 Solicitação de Permissão para Commit & Push
- Apresentar o resultado e solicitar permissão explícita ao usuário para commit, push e abertura/merge do PR (conforme Diretriz Global #1).
