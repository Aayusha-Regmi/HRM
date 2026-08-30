resource "aws_ecr_repository" "this" {
  name                 = "${var.project_prefix}-app"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_prefix}-app"
  }
}