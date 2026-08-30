# -----------------------------------------------------------------
# 1. EKS CONTROL PLANE (The Cluster Master)
# -----------------------------------------------------------------

data "aws_caller_identity" "current" {}


resource "aws_eks_cluster" "this" {
  name = var.cluster_name

  access_config {
    authentication_mode = "API"
  }

  # Links to  iam.tf: resource "aws_iam_role" "eks_cluster_role"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  # Safety check: waits until the role policy attachment in iam.tf is active
  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_role_policy,
  ]
}

# -----------------------------------------------------------------
# 2. EKS MANAGED NODE GROUP (The Worker Nodes)
# -----------------------------------------------------------------
resource "aws_eks_node_group" "this" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${var.cluster_name}-worker-nodes"
  
  # Links to your iam.tf: resource "aws_iam_role" "eks_worker_role"
  node_role_arn   = aws_iam_role.eks_worker_role.arn
  subnet_ids      = var.subnet_ids

  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }

  update_config {
    max_unavailable = 1
  }

  instance_types = ["t3.medium"]

  # Safety check: waits until all 3 worker policies from iam.tf are attached
  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_role_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.ecr_pull_policy,
  ]
}

#EKS access entry:
resource "aws_eks_access_entry" "hrm_infra_user" {
  cluster_name  = aws_eks_cluster.this.name
  principal_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/hrm-infra-user"
}

resource "aws_eks_access_policy_association" "hrm_infra_user_admin" {
  cluster_name  = aws_eks_cluster.this.name
  principal_arn = aws_eks_access_entry.hrm_infra_user.principal_arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }
}
