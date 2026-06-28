#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# 02-create-sqs-queues.sh
# Creates SQS queues used by the Communication Agent retry logic.
# Runs automatically when LocalStack reaches the "ready" state.
# ---------------------------------------------------------------------------
set -euo pipefail

REGION="${AWS_DEFAULT_REGION:-us-east-1}"
ACCOUNT_ID="000000000000"  # LocalStack default account ID

echo "==> [SQS] Creating dead-letter queue: failed-communications-dlq"
DLQ_URL=$(awslocal sqs create-queue \
  --queue-name "failed-communications-dlq" \
  --attributes '{
    "MessageRetentionPeriod": "1209600"
  }' \
  --query 'QueueUrl' \
  --output text \
  2>/dev/null || awslocal sqs get-queue-url \
    --queue-name "failed-communications-dlq" \
    --query 'QueueUrl' --output text)

DLQ_ARN=$(awslocal sqs get-queue-attributes \
  --queue-url "$DLQ_URL" \
  --attribute-names QueueArn \
  --query 'Attributes.QueueArn' \
  --output text)

echo "     DLQ URL : $DLQ_URL"
echo "     DLQ ARN : $DLQ_ARN"

echo "==> [SQS] Creating main retry queue: failed-communications"
awslocal sqs create-queue \
  --queue-name "failed-communications" \
  --attributes \
    "$(printf '{
      "VisibilityTimeout": "30",
      "MessageRetentionPeriod": "86400",
      "ReceiveMessageWaitTimeSeconds": "20",
      "RedrivePolicy": "{\"deadLetterTargetArn\":\"%s\",\"maxReceiveCount\":\"3\"}"
    }' "$DLQ_ARN")" \
  2>/dev/null || echo "     (failed-communications already exists — skipping)"

echo "==> [SQS] Queues ready. Listing:"
awslocal sqs list-queues
