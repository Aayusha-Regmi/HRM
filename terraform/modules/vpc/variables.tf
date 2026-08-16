variable "project_prefix" {
    type = string
    description = "Project name prefix passed from root."
}

variable "vpc_cidr" {
    type = string
    default = "VPC cidr range passed from root."
}