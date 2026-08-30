# =============================================================
# ROOT main.tf — wires together modules/vpc, modules/ecr, modules/eks
# =============================================================

# -----------------------------
# VPC Module
# -----------------------------
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr       = var.vpc_cidr
  project_prefix = var.project_prefix
  cluster_name   = var.cluster_name
}

# -----------------------------
# ECR Module
# -----------------------------
module "ecr" {
  source = "./modules/ecr"

  project_prefix = var.project_prefix
}

# -----------------------------
# EKS Module
# -----------------------------
module "eks" {
  source = "./modules/eks"

  aws_region = var.aws_region
  cluster_name       = var.cluster_name
  kubernetes_version = var.kubernetes_version

  # EKS control plane + node group both take this list in your eks/main.tf,
  # so combine public + private subnets from the vpc module output
  subnet_ids = concat(
    module.vpc.public_subnet_ids,
    module.vpc.private_subnet_ids
  )

  depends_on = [module.vpc]
}