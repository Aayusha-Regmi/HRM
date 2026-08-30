variable "cluster_name" {
  type        = string
  description = "The unique name of the EKS cluster"
  default     = "production-eks"
}

variable "aws_region"{
  type = string
  description= "Passed from root"
}

variable "kubernetes_version" {
  type        = string
  description = "The desired Kubernetes version for the EKS cluster control plane"
  default     = "1.31" # Standard supported version
}

variable "subnet_ids" {
  type        = list(string)
  description = "A list of subnet IDs where the EKS cluster and node group will deploy. AWS requires subnets in at least two different availability zones."
  
  validation {
    condition     = length(var.subnet_ids) >= 2
    error_message = "EKS requires at least two subnet IDs in different availability zones to ensure high availability."
  }
}
