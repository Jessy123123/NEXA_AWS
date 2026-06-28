#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# 01-create-dynamodb-tables.sh
# Creates all DynamoDB tables needed by the AWS-IQ system.
# Runs automatically when LocalStack reaches the "ready" state.
# ---------------------------------------------------------------------------
set -euo pipefail

echo "==> [DynamoDB] Creating Employees table"
awslocal dynamodb create-table \
  --table-name Employees \
  --attribute-definitions \
    AttributeName=employeeId,AttributeType=S \
    AttributeName=managerId,AttributeType=S \
    AttributeName=department,AttributeType=S \
    AttributeName=siteLocation,AttributeType=S \
  --key-schema \
    AttributeName=employeeId,KeyType=HASH \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "ManagerIndex",
        "KeySchema": [
          {"AttributeName":"managerId","KeyType":"HASH"},
          {"AttributeName":"employeeId","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      },
      {
        "IndexName": "DepartmentIndex",
        "KeySchema": [
          {"AttributeName":"department","KeyType":"HASH"},
          {"AttributeName":"employeeId","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      },
      {
        "IndexName": "LocationIndex",
        "KeySchema": [
          {"AttributeName":"siteLocation","KeyType":"HASH"},
          {"AttributeName":"department","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      }
    ]' \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "     (Employees already exists — skipping)"

echo "==> [DynamoDB] Creating OrgChart table"
awslocal dynamodb create-table \
  --table-name OrgChart \
  --attribute-definitions \
    AttributeName=nodeId,AttributeType=S \
    AttributeName=parentNodeId,AttributeType=S \
    AttributeName=level,AttributeType=N \
  --key-schema \
    AttributeName=nodeId,KeyType=HASH \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "ParentIndex",
        "KeySchema": [
          {"AttributeName":"parentNodeId","KeyType":"HASH"},
          {"AttributeName":"level","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      },
      {
        "IndexName": "LevelIndex",
        "KeySchema": [
          {"AttributeName":"level","KeyType":"HASH"},
          {"AttributeName":"nodeId","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      }
    ]' \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "     (OrgChart already exists — skipping)"

echo "==> [DynamoDB] Creating Tasks table"
awslocal dynamodb create-table \
  --table-name Tasks \
  --attribute-definitions \
    AttributeName=employeeId,AttributeType=S \
    AttributeName=taskId,AttributeType=S \
    AttributeName=taskType,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=employeeId,KeyType=HASH \
    AttributeName=taskId,KeyType=RANGE \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "TypeIndex",
        "KeySchema": [
          {"AttributeName":"taskType","KeyType":"HASH"},
          {"AttributeName":"createdAt","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      }
    ]' \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "     (Tasks already exists — skipping)"

echo "==> [DynamoDB] Creating Incidents table"
awslocal dynamodb create-table \
  --table-name Incidents \
  --attribute-definitions \
    AttributeName=date,AttributeType=S \
    AttributeName=incidentId,AttributeType=S \
    AttributeName=employeeId,AttributeType=S \
    AttributeName=status,AttributeType=S \
  --key-schema \
    AttributeName=date,KeyType=HASH \
    AttributeName=incidentId,KeyType=RANGE \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "EmployeeIndex",
        "KeySchema": [
          {"AttributeName":"employeeId","KeyType":"HASH"},
          {"AttributeName":"date","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      },
      {
        "IndexName": "StatusIndex",
        "KeySchema": [
          {"AttributeName":"status","KeyType":"HASH"},
          {"AttributeName":"date","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      }
    ]' \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "     (Incidents already exists — skipping)"

echo "==> [DynamoDB] Creating OnboardingProgress table"
awslocal dynamodb create-table \
  --table-name OnboardingProgress \
  --attribute-definitions \
    AttributeName=jobId,AttributeType=S \
    AttributeName=employeeId,AttributeType=S \
  --key-schema \
    AttributeName=jobId,KeyType=HASH \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "EmployeeJobIndex",
        "KeySchema": [
          {"AttributeName":"employeeId","KeyType":"HASH"},
          {"AttributeName":"jobId","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      }
    ]' \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "     (OnboardingProgress already exists — skipping)"

echo "==> [DynamoDB] Creating FAQ table"
awslocal dynamodb create-table \
  --table-name FAQ \
  --attribute-definitions \
    AttributeName=faqId,AttributeType=S \
    AttributeName=category,AttributeType=S \
    AttributeName=viewCount,AttributeType=N \
  --key-schema \
    AttributeName=faqId,KeyType=HASH \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "PopularityIndex",
        "KeySchema": [
          {"AttributeName":"category","KeyType":"HASH"},
          {"AttributeName":"viewCount","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      }
    ]' \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "     (FAQ already exists — skipping)"

echo "==> [DynamoDB] Creating CommunicationLog table"
awslocal dynamodb create-table \
  --table-name CommunicationLog \
  --attribute-definitions \
    AttributeName=communicationId,AttributeType=S \
    AttributeName=status,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=communicationId,KeyType=HASH \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "StatusIndex",
        "KeySchema": [
          {"AttributeName":"status","KeyType":"HASH"},
          {"AttributeName":"createdAt","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      }
    ]' \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "     (CommunicationLog already exists — skipping)"

echo "==> [DynamoDB] All tables created. Listing:"
awslocal dynamodb list-tables
