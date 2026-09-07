#------------------------------------------
#IAM configuration for the control plane
#--------------------------------------------
data "aws_iam_policy_document" "eks_cluster_assume_role"{
    statement {
       effect = "Allow"
       actions= ["sts:AssumeRole"]

       principals {
        type = "Service"
        identifiers= ["eks.amazonaws.com"]
       }
    }
}

# Create the IAM role for EKS cluster

resource "aws_iam_role" "eks_cluster_role"{
    name = "hrm-infra-eks-cluster-role"
    assume_role_policy= data.aws_iam_policy_document.eks_cluster_assume_role.json
}

# attach aws eks cluster policy to this eks_cluster_role
resource "aws_iam_role_policy_attachment" "eks_cluster_role_policy"{
    role= aws_iam_role.eks_cluster_role.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

#-------------------------------------------------------
# IAM configuration for worker nodes 
#=============================-----

data "aws_iam_policy_document" "eks_worker_assume_role"{
    statement {
        effect = "Allow"
        actions = ["sts:AssumeRole"]
    
        principals {
            type = "Service"
            identifiers = ["ec2.amazonaws.com"]
        }
}
}

# create the IAM role for worker nodes
resource "aws_iam_role" "eks_worker_role"{
    name= "hrm-infra-eks-worker-role"
    assume_role_policy= data.aws_iam_policy_document.eks_worker_assume_role.json
}

#attach aws eks worker policy to worker role
resource "aws_iam_role_policy_attachment" "eks_worker_role_policy" {
    role= aws_iam_role.eks_worker_role.name
    policy_arn= "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

#=======attach the policy to allow VPC 
resource "aws_iam_role_policy_attachment" "eks_cni_policy"{
    role= aws_iam_role.eks_worker_role.name
    policy_arn= "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

#=========attach policy to allow image pull from ecr
resource "aws_iam_role_policy_attachment" "ecr_pull_policy"{
    role= aws_iam_role.eks_worker_role.name
    policy_arn= "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# #--------------Only if i were to use EBS for storage (currently using local emptyDir -saving cost)-----------------------------------------
# # OIDC Provider — required for IRSA (EBS CSI driver, 
# # Load Balancer Controller, etc. to assume roles)
# #-------------------------------------------------------

# data "tls_certificate" "eks_oidc_cert" {
#   url = aws_eks_cluster.this.identity[0].oidc[0].issuer
# }

# resource "aws_iam_openid_connect_provider" "eks_oidc" {
#   client_id_list  = ["sts.amazonaws.com"]
#   thumbprint_list = [data.tls_certificate.eks_oidc_cert.certificates[0].sha1_fingerprint]
#   url             = aws_eks_cluster.this.identity[0].oidc[0].issuer
# }

# #-------------------------------------------------------
# # IAM configuration for EBS CSI Driver (IRSA)
# #-------------------------------------------------------

# data "aws_iam_policy_document" "ebs_csi_assume_role" {
#   statement {
#     effect  = "Allow"
#     actions = ["sts:AssumeRoleWithWebIdentity"]

#     principals {
#       type        = "Federated"
#       identifiers = [aws_iam_openid_connect_provider.eks_oidc.arn]
#     }

#     condition {
#       test     = "StringEquals"
#       variable = "${replace(aws_iam_openid_connect_provider.eks_oidc.url, "https://", "")}:sub"
#       values   = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
#     }
#   }
# }

# resource "aws_iam_role" "ebs_csi_role" {
#   name               = "hrm-infra-ebs-csi-role"
#   assume_role_policy = data.aws_iam_policy_document.ebs_csi_assume_role.json
# }

# resource "aws_iam_role_policy_attachment" "ebs_csi_policy" {
#   role       = aws_iam_role.ebs_csi_role.name
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
# }