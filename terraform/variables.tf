variable "aws_region" {
    type = string
    default = "us-east-1"
}

variable "project_prefix" {
    type = string
    default = "hrm-infra"
}

variable "vpc_cidr" {
    type = string
    default = "10.0.0.0/16"   
}

variable "cluster_name" {
    type = string
    default = "hrm-infra-eks-cluster"
}

variable "kubernetes_version" {
    type = string
    default = "1.31"
}