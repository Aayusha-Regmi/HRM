variable "project_prefix" {
    type = string
    description = "Project name prefix passed from root."
}

variable "vpc_cidr" {
    type = string
    description = "VPC cidr range passed from root."
}

variable "cluster_name" {
  type = string
}