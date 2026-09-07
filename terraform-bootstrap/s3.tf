resource "aws_s3_bucket" "tfstate" {
  bucket = "hrm-infra-tfstate-bucket"
    tags = {
        Name        = "hrm-infra-state-bucket"
        Project     = "HRM-Application"
    }
}

# allow versioning to track whenever infra setup is updated as saved on tfstate 
resource "aws_s3_bucket_versioning" "versioning_bucket" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}