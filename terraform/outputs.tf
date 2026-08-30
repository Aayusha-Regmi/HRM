# =============================================================
# ROOT outputs.tf
# =============================================================

# -----------------------------
# VPC
# -----------------------------
output "vpc_id" {
  description = "ID of the VPC."
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets."
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets."
  value       = module.vpc.private_subnet_ids
}

# -----------------------------
# ECR
# -----------------------------
output "ecr_repository_url" {
  description = "URL of the ECR repository (used for docker push/pull)."
  value       = module.ecr.repository_url
}

output "ecr_repository_name" {
  description = "Name of the ECR repository."
  value       = module.ecr.repository_name
}

# -----------------------------
# EKS
# -----------------------------
output "cluster_name" {
  description = "Name of the EKS cluster."
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint URL for the Kubernetes API server."
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster."
  value       = module.eks.cluster_certificate_authority_data
}

output "cluster_security_group_id" {
  description = "Security group ID for control-plane-to-data-plane communication."
  value       = module.eks.cluster_security_group_id
}

output "kubeconfig_update_command" {
  description = "Run this locally to configure kubectl for the cluster."
  value       = module.eks.kubeconfig_update_command
}