output "cluster_name" {
  value       = aws_eks_cluster.this.name
  description = "The name of the EKS cluster."
}

output "cluster_endpoint" {
  value       = aws_eks_cluster.this.endpoint
  description = "The endpoint URL for your Kubernetes API server."
}

output "cluster_certificate_authority_data" {
  value       = aws_eks_cluster.this.certificate_authority[0].data
  description = "The base64 encoded certificate data required to communicate with your cluster."
}

output "cluster_security_group_id" {
  value       = aws_eks_cluster.this.vpc_config[0].cluster_security_group_id
  description = "The security group automatically created by AWS for control-plane-to-data-plane communication."
}

output "kubeconfig_update_command" {
  value       = "aws eks update-kubeconfig --region  ${var.aws_region} --name ${aws_eks_cluster.this.name}"
  description = "The exact AWS CLI command you need to run locally to configure your kubeconfig file."
}
