module "vpc" {
    source = "./modules/vpc"
    project_prefix = var.project_prefix
    vpc_cidr = var.vpc_cidr
}