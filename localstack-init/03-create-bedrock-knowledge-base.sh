#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# 03-create-bedrock-knowledge-base.sh
# Creates a Bedrock Knowledge Base over the awsiq-knowledge-base S3 bucket
# (created in 00-create-s3-buckets.sh) and triggers an ingestion sync.
#
# REQUIRES LocalStack Pro with a valid LOCALSTACK_AUTH_TOKEN — Bedrock Agents /
# Knowledge Bases (and the OpenSearch Serverless vector store behind them) are
# not part of the free LocalStack edition. If this script fails, the backend's
# Knowledge Agent automatically falls back to a local keyword-matched answer
# set (see backend/agents/knowledge_agent.py) so the rest of the demo still
# works without a KB.
# ---------------------------------------------------------------------------
set -uo pipefail

BUCKET="awsiq-knowledge-base"
KB_NAME="awsiq-knowledge-base"
ROLE_ARN="arn:aws:iam::000000000000:role/BedrockKBRole"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

echo "==> [Bedrock] Creating IAM role for the Knowledge Base (LocalStack accepts any well-formed role)"
awslocal iam create-role \
  --role-name BedrockKBRole \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"bedrock.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
  2>/dev/null || echo "     (role already exists — skipping)"

echo "==> [Bedrock] Creating Knowledge Base '$KB_NAME'"
KB_ID=$(awslocal bedrock-agent create-knowledge-base \
  --name "$KB_NAME" \
  --role-arn "$ROLE_ARN" \
  --knowledge-base-configuration '{
    "type": "VECTOR",
    "vectorKnowledgeBaseConfiguration": {
      "embeddingModelArn": "arn:aws:bedrock:'"$REGION"'::foundation-model/amazon.titan-embed-text-v1"
    }
  }' \
  --storage-configuration '{
    "type": "OPENSEARCH_SERVERLESS",
    "opensearchServerlessConfiguration": {
      "collectionArn": "arn:aws:aoss:'"$REGION"':000000000000:collection/awsiq",
      "vectorIndexName": "awsiq-index",
      "fieldMapping": {"vectorField": "embedding", "textField": "text", "metadataField": "metadata"}
    }
  }' \
  --query 'knowledgeBase.knowledgeBaseId' --output text 2>/dev/null)

if [ -z "$KB_ID" ] || [ "$KB_ID" = "None" ]; then
  echo "     (Bedrock Knowledge Base creation failed — likely missing LocalStack Pro / Bedrock Agent support."
  echo "      The backend's Knowledge Agent will use its local fallback answers instead. See backend/.env.example.)"
  exit 0
fi

echo "==> [Bedrock] Knowledge Base created: $KB_ID"

echo "==> [Bedrock] Creating S3 data source pointing at s3://$BUCKET/"
DS_ID=$(awslocal bedrock-agent create-data-source \
  --knowledge-base-id "$KB_ID" \
  --name "awsiq-s3-source" \
  --data-source-configuration '{
    "type": "S3",
    "s3Configuration": {"bucketArn": "arn:aws:s3:::'"$BUCKET"'"}
  }' \
  --query 'dataSource.dataSourceId' --output text 2>/dev/null)

if [ -n "$DS_ID" ] && [ "$DS_ID" != "None" ]; then
  echo "==> [Bedrock] Starting ingestion sync for data source $DS_ID"
  awslocal bedrock-agent start-ingestion-job --knowledge-base-id "$KB_ID" --data-source-id "$DS_ID" 2>/dev/null || true
fi

echo "==> [Bedrock] Set this in your backend/.env so the Knowledge Agent uses it:"
echo "     BEDROCK_KNOWLEDGE_BASE_ID=$KB_ID"
