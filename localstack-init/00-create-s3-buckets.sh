#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# 00-create-s3-buckets.sh
# Creates the S3 knowledge-base bucket with the required folder hierarchy.
# Runs automatically when LocalStack reaches the "ready" state.
# ---------------------------------------------------------------------------
set -euo pipefail

BUCKET="awsiq-knowledge-base"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"
ENDPOINT="${AWS_ENDPOINT_URL:-http://localhost:4566}"

echo "==> [S3] Creating bucket: $BUCKET"
awslocal s3api create-bucket \
  --bucket "$BUCKET" \
  --region "$REGION" \
  $([ "$REGION" != "us-east-1" ] && echo "--create-bucket-configuration LocationConstraint=$REGION" || true) \
  2>/dev/null || echo "     (bucket already exists — skipping)"

echo "==> [S3] Enabling versioning on $BUCKET"
awslocal s3api put-bucket-versioning \
  --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

echo "==> [S3] Enabling server-side encryption on $BUCKET"
awslocal s3api put-bucket-encryption \
  --bucket "$BUCKET" \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Create placeholder objects to represent the folder structure
FOLDERS=("IT/" "HR/" "Finance/" "Security/" "Operations/")
for folder in "${FOLDERS[@]}"; do
  echo "==> [S3] Creating folder: s3://$BUCKET/$folder"
  awslocal s3api put-object \
    --bucket "$BUCKET" \
    --key "$folder" \
    --content-length 0 \
    2>/dev/null || true
done

echo "==> [S3] Bucket $BUCKET is ready with folder structure."
awslocal s3 ls "s3://$BUCKET"
