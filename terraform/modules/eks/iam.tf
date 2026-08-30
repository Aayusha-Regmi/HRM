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