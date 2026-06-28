# LocalStack Init Scripts

Shell scripts placed in this directory are automatically executed by LocalStack **once**
after all emulated services are healthy (the `ready.d` hook).

## Execution Order

Scripts run in **alphabetical order**, so prefix filenames with a two-digit number to
control sequencing:

```
00-create-s3-buckets.sh
01-create-dynamodb-tables.sh
02-create-sqs-queues.sh
```

## Environment

LocalStack sets the following variables for every script:

| Variable | Value |
|----------|-------|
| `AWS_ACCESS_KEY_ID` | `test` |
| `AWS_SECRET_ACCESS_KEY` | `test` |
| `AWS_DEFAULT_REGION` | `us-east-1` |
| `AWS_ENDPOINT_URL` | `http://localhost:4566` |

## Adding a New Script

1. Create a `.sh` file here (must be executable: `chmod +x your-script.sh`)
2. Use `awslocal` (pre-installed in the container) or `aws --endpoint-url $AWS_ENDPOINT_URL`
3. Restart LocalStack (`docker compose restart localstack`) to re-run all scripts,
   or use `docker compose up --force-recreate localstack` for a clean run.

## Dataset

The `./dataset` folder from the project root is mounted read-only at `/opt/dataset`
inside the container, making all 11 knowledge-base documents available for seeding.
