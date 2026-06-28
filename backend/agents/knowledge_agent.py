"""Knowledge Agent — RAG over the company knowledge base (design.md §Knowledge Agent).

Primary path: Amazon Bedrock Knowledge Bases RetrieveAndGenerate, which does the
full RAG loop — embed the question, retrieve matching chunks from the vector
store built over dataset/*.md (the same files seeded into the
awsiq-knowledge-base S3 bucket), and generate a grounded answer with citations.

Fallback path: if BEDROCK_KNOWLEDGE_BASE_ID isn't set, or the call fails (KB not
synced yet, LocalStack Pro not running Bedrock Agent, etc.), this degrades to a
keyword match against a small hand-picked extract of the same real documents
(kb_fallback.json) so the demo never just breaks.
"""

import logging

import boto3
from botocore.exceptions import ClientError

from .. import config, store

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client(
            "bedrock-agent-runtime",
            region_name=config.AWS_REGION,
            endpoint_url=config.AWS_ENDPOINT_URL or None,
            aws_access_key_id=config.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
        )
    return _client


def _query_bedrock(question: str) -> dict | None:
    if not config.BEDROCK_KNOWLEDGE_BASE_ID:
        return None
    try:
        response = _get_client().retrieve_and_generate(
            input={"text": question},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": config.BEDROCK_KNOWLEDGE_BASE_ID,
                    "modelArn": config.BEDROCK_MODEL_ARN,
                },
            },
        )
        citations = []
        for citation in response.get("citations", []):
            for ref in citation.get("retrievedReferences", []):
                uri = ref.get("location", {}).get("s3Location", {}).get("uri", "")
                citations.append({"title": uri.rsplit("/", 1)[-1] or uri, "category": "Knowledge Base"})
        return {
            "answer": response["output"]["text"],
            "citations": citations or [{"title": "Bedrock Knowledge Base", "category": "RAG"}],
            "mode": "bedrock",
        }
    except ClientError as e:
        logger.warning("Bedrock KB query failed, falling back to local extract: %s", e)
        return None
    except Exception as e:  # endpoint unreachable, KB not synced, etc.
        logger.warning("Bedrock KB unavailable, falling back to local extract: %s", e)
        return None


def _query_fallback(question: str) -> dict:
    q = question.lower()
    entries = store.load("kb_fallback.json")
    hit = next((e for e in entries if any(kw in q for kw in e["keywords"])), None)
    if hit is None:
        return {
            "answer": "I couldn't find a confident answer in the knowledge base for that — try rephrasing, or check the FAQ section.",
            "citations": [],
            "mode": "fallback",
        }
    return {
        "answer": hit["answer"],
        "citations": [{"title": hit["source"], "category": hit["category"]}],
        "mode": "fallback",
    }


def query(question: str) -> dict:
    return _query_bedrock(question) or _query_fallback(question)


def get_faq(category: str | None = None) -> list:
    faqs = store.load("faq.json")
    if category and category.lower() != "all":
        faqs = [f for f in faqs if f["category"].lower() == category.lower()]
    return faqs
