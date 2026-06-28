import os

from dotenv import load_dotenv

load_dotenv()

# Point this at LocalStack's gateway. Leave unset to hit real AWS instead.
AWS_ENDPOINT_URL = os.getenv("AWS_ENDPOINT_URL", "http://localhost:4566")
AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "test")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "test")

# Set once `awslocal bedrock-agent create-knowledge-base` (or the AWS console) gives you an ID.
BEDROCK_KNOWLEDGE_BASE_ID = os.getenv("BEDROCK_KNOWLEDGE_BASE_ID", "")
BEDROCK_MODEL_ARN = os.getenv(
    "BEDROCK_MODEL_ARN",
    f"arn:aws:bedrock:{AWS_REGION}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
)
