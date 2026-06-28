# Implementation Plan: AWS-IQ Multi-Agent IT Onboarding System

## Overview

This implementation plan details the steps required to build the AWS-IQ system, a comprehensive multi-agent IT onboarding platform that leverages Amazon Bedrock Multi-Agent Collaboration. The system employs Python Lambda functions, DynamoDB for data storage, Amazon Bedrock for AI agents, and a web dashboard for user interaction. For local development, LocalStack (Pro or community edition) is used to emulate AWS services. The implementation follows a phased approach starting with local environment setup and infrastructure, followed by agent implementation, orchestration, dashboard development, and integration.

## Tasks

- [ ] 0. Set up local development environment with LocalStack
  - [x] 0.1 Create Docker Compose configuration for LocalStack
    - Create `docker-compose.yml` at project root with LocalStack service definition
    - Configure LocalStack to emulate: S3, DynamoDB, Lambda, API Gateway, SQS, SES, Bedrock (mock)
    - Set `LOCALSTACK_AUTH_TOKEN` environment variable for Pro features (or use community edition)
    - Map port 4566 for LocalStack gateway
    - Mount `./dataset` folder into the container for seeding access
    - Add a `localstack-init/` directory for auto-startup scripts
    - _Requirements: 8.1, 8.2_

  - [-] 0.2 Create LocalStack initialization and bootstrap script
    - Create `scripts/localstack_init.sh` that waits for LocalStack health endpoint to be ready
    - Auto-create S3 bucket `awsiq-knowledge-base` with folder structure (IT/, HR/, Finance/, Security/, Operations/)
    - Auto-create all DynamoDB tables (Employees, OrgChart, Tasks, Incidents, OnboardingProgress, FAQ, CommunicationLog) with correct key schemas and GSIs
    - Auto-create SQS queues (failed-communications, failed-communications-dlq)
    - Set environment variable `AWS_ENDPOINT_URL=http://localhost:4566` for all local AWS SDK calls
    - _Requirements: 8.1, 9.1, 9.2, 9.3, 9.4_

  - [~] 0.3 Create dataset upload script for local S3 seeding
    - Create `scripts/seed_s3_dataset.py` that uploads all 11 dataset files from `./dataset/` to local S3
    - Upload each file to its designated S3 folder with correct metadata tags (category, clearance_level, role):
      - `dataset/Employee-Onboarding-Checklist.md` → `HR/Employee-Onboarding-Checklist.md` | category=HR, clearance_level=Internal, role=All
      - `dataset/IT-Security-Policy-v2.3.md` → `Security/IT-Security-Policy-v2.3.md` | category=Security, clearance_level=Internal, role=All
      - `dataset/Data-Classification-Guidelines.md` → `Security/Data-Classification-Guidelines.md` | category=Security, clearance_level=Internal, role=All
      - `dataset/Travel-Expense-SOP.md` → `HR/Travel-Expense-SOP.md` | category=HR, clearance_level=Internal, role=All
      - `dataset/Cloud-Migration-Strategy-2026.md` → `Operations/Cloud-Migration-Strategy-2026.md` | category=Operations, clearance_level=Confidential, role=Engineering,Management
      - `dataset/QBR-Q1-2026-Summary.md` → `Finance/QBR-Q1-2026-Summary.md` | category=Finance, clearance_level=Confidential, role=Management
      - `dataset/budget-review-2026-05-28.md` → `Finance/budget-review-2026-05-28.md` | category=Finance, clearance_level=Confidential, role=Management,Finance
      - `dataset/incident-postmortem-2026-06-09.md` → `Operations/incident-postmortem-2026-06-09.md` | category=Operations, clearance_level=Internal, role=Engineering
      - `dataset/weekly-standup-2026-06-02.md` → `Operations/weekly-standup-2026-06-02.md` | category=Operations, clearance_level=Internal, role=Engineering
      - `dataset/cross-team-planning-2026-06-05.md` → `Operations/cross-team-planning-2026-06-05.md` | category=Operations, clearance_level=Internal, role=Engineering,Product
      - `dataset/workflow-messages.csv` → `Operations/workflow-messages.csv` | category=Operations, clearance_level=Internal, role=Engineering,Product
    - Print upload confirmation with S3 key and metadata for each file
    - _Requirements: 4.1, 4.2, 9.5_

  - [~] 0.4 Create local embedding simulation script
    - Create `scripts/trigger_local_embedding.py` that simulates the Bedrock Knowledge Base sync locally
    - Iterate over all uploaded S3 objects, chunk each document into 512-token segments
    - For each chunk, call a local embedding mock endpoint (or LocalStack Bedrock mock) using model `amazon.titan-embed-text-v2:0` with 1024 dimensions
    - Store chunk vectors alongside metadata (category, clearance_level, role, source_file, chunk_index) in a local OpenSearch mock or JSON file for unit testing
    - Log total chunks created and average embedding latency
    - _Requirements: 4.1, 4.2, 9.5, 9.7_

  - [~] 0.5 Add local development helper scripts and README
    - Create `scripts/start_local.sh` that: starts Docker Compose, waits for LocalStack, runs `seed_s3_dataset.py`, runs `trigger_local_embedding.py`
    - Create `scripts/reset_local.sh` that tears down Docker Compose and clears local state
    - Update project `README.md` with local development quickstart instructions
    - Add `.env.local` template with required LocalStack environment variables (`AWS_ENDPOINT_URL`, `AWS_ACCESS_KEY_ID=test`, `AWS_SECRET_ACCESS_KEY=test`, `AWS_DEFAULT_REGION=us-east-1`)
    - _Requirements: 8.1, 8.2_

- [ ] 1. Set up AWS infrastructure and project foundation
  - [-] 1.1 Create project structure and Python virtual environment
    - Initialize Python project with directory structure for Lambda functions
    - Create `src/`, `tests/`, `infrastructure/`, `dashboard/`, `scripts/`, and `localstack-init/` directories
    - Set up Python 3.12 virtual environment
    - Create `requirements.txt` with boto3, pytest, moto, and other dependencies
    - Create `docker-compose.yml` referencing the LocalStack service (see Task 0.1)
    - Initialize Git repository with `.gitignore` for Python projects and `.env.local`
    - _Requirements: 8.1, 8.2_

  - [~] 1.2 Implement DynamoDB table definitions using AWS CDK
    - Create CDK stack for Employees table with GSIs (ManagerIndex, DepartmentIndex, LocationIndex)
    - Create CDK stack for OrgChart table with GSIs (ParentIndex, LevelIndex)
    - Create CDK stack for Tasks table with GSIs (StatusIndex, TypeIndex)
    - Create CDK stack for Incidents table with GSIs (EmployeeIndex, StatusIndex)
    - Create CDK stack for OnboardingProgress table
    - Create CDK stack for FAQ table with GSI (PopularityIndex)
    - Create CDK stack for CommunicationLog table with GSI (StatusIndex)
    - Enable point-in-time recovery and encryption for all tables
    - Deploy DynamoDB tables to development environment
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6, 10.4_

  - [~] 1.3 Set up S3 document store and Bedrock Knowledge Base
    - Create S3 bucket `awsiq-knowledge-base` with folder structure (HR/, Security/, Finance/, Operations/)
    - Enable S3 versioning and encryption
    - Upload the 11 real dataset files from `./dataset/` to their designated S3 folders with metadata tags:
      - `HR/Employee-Onboarding-Checklist.md` — category=HR, clearance_level=Internal, role=All
      - `Security/IT-Security-Policy-v2.3.md` — category=Security, clearance_level=Internal, role=All
      - `Security/Data-Classification-Guidelines.md` — category=Security, clearance_level=Internal, role=All
      - `HR/Travel-Expense-SOP.md` — category=HR, clearance_level=Internal, role=All
      - `Operations/Cloud-Migration-Strategy-2026.md` — category=Operations, clearance_level=Confidential, role=Engineering,Management
      - `Finance/QBR-Q1-2026-Summary.md` — category=Finance, clearance_level=Confidential, role=Management
      - `Finance/budget-review-2026-05-28.md` — category=Finance, clearance_level=Confidential, role=Management,Finance
      - `Operations/incident-postmortem-2026-06-09.md` — category=Operations, clearance_level=Internal, role=Engineering
      - `Operations/weekly-standup-2026-06-02.md` — category=Operations, clearance_level=Internal, role=Engineering
      - `Operations/cross-team-planning-2026-06-05.md` — category=Operations, clearance_level=Internal, role=Engineering,Product
      - `Operations/workflow-messages.csv` — category=Operations, clearance_level=Internal, role=Engineering,Product
    - Create Bedrock Knowledge Base with S3 data source pointing to `awsiq-knowledge-base`
    - Configure embedding model `amazon.titan-embed-text-v2:0` with 1024 dimensions and 512-token chunk size
    - Set up OpenSearch Serverless vector store
    - Configure metadata field mappings: category, clearance_level, role
    - Trigger initial knowledge base sync and verify all 11 documents are indexed
    - Verify embedding quality by testing semantic similarity searches across each S3 folder
    - _Requirements: 4.1, 4.2, 9.5, 9.7, 10.5_

  - [~] 1.4 Create Lambda function infrastructure and IAM roles
    - Create IAM role for Orchestration Lambda with Bedrock and DynamoDB permissions
    - Create IAM role for Profile Lambda with DynamoDB Employees and OrgChart read permissions
    - Create IAM role for Setup Lambda with DynamoDB OnboardingProgress write permissions and Lambda invoke permissions
    - Create IAM role for Knowledge Lambda with Bedrock Knowledge Base query permissions
    - Create IAM role for Communication Lambda with SES send permissions and DynamoDB CommunicationLog write permissions
    - Create IAM role for Task Lambda with DynamoDB Tasks and Incidents read/write permissions
    - Create Lambda function definitions in CDK with Python 3.12 runtime
    - Configure Lambda memory, timeout, and concurrency settings
    - _Requirements: 8.1, 8.3, 10.3_

  - [~] 1.5 Set up API Gateway REST API with authentication
    - Create API Gateway REST API definition
    - Configure CORS for web dashboard domain
    - Implement Lambda authorizer for JWT token validation
    - Create API Gateway endpoints for all routes (profile, onboarding, knowledge, tasks, incidents, faq, health)
    - Configure request/response transformations with standard envelope format
    - Enable API Gateway access logs to CloudWatch
    - Configure rate limiting (1000 requests per minute per user)
    - Deploy API to development stage
    - _Requirements: 8.2, 8.5, 10.1, 10.2_

- [ ] 2. Implement core Lambda function utilities and shared components
  - [~] 2.1 Create shared utilities module for Lambda functions
    - Implement API Gateway event parser (`parse_api_gateway_event`)
    - Implement request validation utility (`validate_request`)
    - Implement standard response formatters (`format_success_response`, `format_error_response`)
    - Create custom exception classes (ValidationError, ResourceNotFoundError, UnauthorizedError, etc.)
    - Implement structured logging utility with JSON format
    - Create DynamoDB helper functions for common operations
    - Implement retry decorator with exponential backoff and jitter
    - _Requirements: 8.1, 8.8_

  - [ ]* 2.2 Write unit tests for shared utilities
    - Test API Gateway event parsing with various input formats
    - Test request validation with valid and invalid inputs
    - Test response formatters with different status codes
    - Test custom exception handling
    - Test retry decorator with transient and permanent errors
    - _Requirements: 8.1, 8.8_

- [ ] 3. Implement Profile Agent and Lambda function
  - [~] 3.1 Create Profile Lambda function with data access layer
    - Implement `get_employee_profile` function to fetch profile from DynamoDB
    - Implement `get_organizational_chart` function to recursively build org hierarchy
    - Implement `get_team_contacts` function to retrieve contact info for team members
    - Implement `update_profile` function to update employee profile data
    - Create Lambda handler with API Gateway integration
    - Implement error handling for ProfileNotFoundError and OrgChartIncompleteError
    - Add CloudWatch logging for all operations
    - _Requirements: 2.1, 2.2, 2.3, 2.7_

  - [ ]* 3.2 Write unit tests for Profile Lambda
    - Test `get_employee_profile` with valid employee ID
    - Test `get_employee_profile` with non-existent employee ID
    - Test `get_organizational_chart` with multi-level hierarchy
    - Test `get_team_contacts` retrieval
    - Test `update_profile` with valid updates
    - Mock DynamoDB operations using moto
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 3.3 Write integration tests for Profile Lambda
    - Test GetItem operation on Employees table
    - Test Query on ManagerIndex GSI
    - Test Query on DepartmentIndex GSI
    - Verify response time meets sub-second latency requirement
    - _Requirements: 2.1, 9.8_

- [ ] 4. Implement Setup Agent and provisioning Lambda functions
  - [~] 4.1 Create Setup orchestration Lambda function
    - Implement `initiate_onboarding` function to start provisioning workflow
    - Implement `get_provisioning_status` function to check overall progress
    - Create OnboardingJob record in OnboardingProgress table
    - Implement async invocation of provisioning step Lambdas
    - Track and aggregate progress from all provisioning steps
    - Handle provisioning timeout (30-minute SLA)
    - _Requirements: 3.1, 3.7, 3.8_

  - [~] 4.2 Implement VPN provisioning Lambda function
    - Create simulated VPN provisioning logic
    - Update OnboardingProgress table with 10% completion
    - Implement retry logic for transient failures
    - Add CloudWatch logging
    - _Requirements: 3.1, 3.7_

  - [~] 4.3 Implement email provisioning Lambda function
    - Create simulated email account creation logic
    - Update OnboardingProgress table with 30% completion
    - Implement retry logic for transient failures
    - Add CloudWatch logging
    - _Requirements: 3.2, 3.7_

  - [~] 4.4 Implement SharePoint provisioning Lambda function
    - Create simulated SharePoint access setup logic
    - Update OnboardingProgress table with 50% completion
    - Implement retry logic for transient failures
    - Add CloudWatch logging
    - _Requirements: 3.3, 3.7_

  - [~] 4.5 Implement Workday provisioning Lambda function
    - Create simulated Workday system access logic
    - Update OnboardingProgress table with 70% completion
    - Implement retry logic for transient failures
    - Add CloudWatch logging
    - _Requirements: 3.4, 3.7_

  - [~] 4.6 Implement software installation Lambda function
    - Create simulated software installation logic
    - Update OnboardingProgress table with 100% completion
    - Implement retry logic for transient failures
    - Add CloudWatch logging
    - _Requirements: 3.5, 3.7_

  - [ ]* 4.7 Write unit tests for Setup Lambdas
    - Test initiate_onboarding creates correct job record
    - Test each provisioning step updates progress correctly
    - Test timeout handling after 30 minutes
    - Test retry logic for provisioning failures
    - Mock DynamoDB and Lambda invocations
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.8_

  - [ ]* 4.8 Write integration tests for Setup workflow
    - Test complete provisioning workflow end-to-end
    - Test progress updates in OnboardingProgress table
    - Test async Lambda invocations
    - Verify 30-minute completion SLA
    - _Requirements: 3.6, 3.7, 3.8_

- [~] 5. Checkpoint - Verify profile and setup functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Knowledge Agent and Lambda function
  - [~] 6.1 Create Knowledge Lambda function with Bedrock integration
    - Implement `query_knowledge_base` function with employee context
    - Implement `detect_intent` function to classify question intent and determine categories
    - Implement `apply_filters` function to apply role, location, category, and security filters
    - Implement `retrieve_documents` function using Bedrock Retrieve API
    - Implement `generate_answer` function with source citations
    - Create Lambda handler with API Gateway integration
    - Handle QueryTimeoutError (5-second SLA) and InsufficientClearanceError
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.8_

  - [~] 6.2 Implement metadata filtering logic for Knowledge Base queries
    - Build filter expression for category tags (HR, Security, Finance, Operations)
    - Build filter expression for role-based filtering (Engineering, Management, Finance, Product, All)
    - Build filter expression for location-based filtering
    - Build filter expression for security clearance filtering (Internal, Confidential)
    - Combine filters using Bedrock filter syntax (equals, in, andAll)
    - _Requirements: 4.2, 4.4, 4.5, 10.6_

  - [ ]* 6.3 Write unit tests for Knowledge Lambda
    - Test `query_knowledge_base` with valid question and employee context
    - Test `detect_intent` classifies question correctly
    - Test `apply_filters` builds correct filter expressions for different roles
    - Test `apply_filters` builds correct filter expressions for different locations
    - Test `apply_filters` builds correct filter expressions for security clearance
    - Test `generate_answer` includes source citations
    - Test timeout handling for queries exceeding 5 seconds
    - Mock Bedrock API calls
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.8_

  - [ ]* 6.4 Write integration tests for Knowledge Lambda
    - Test Bedrock Knowledge Base query against all 11 indexed documents
    - Test metadata filtering: category=HR returns HR/ documents only
    - Test role-based filtering: role=Management blocks Engineering-only docs
    - Test clearance filtering: Internal user cannot access Confidential documents
    - Test multi-category queries (e.g., question spanning HR and Security topics)
    - Verify 5-second response time SLA
    - _Requirements: 4.4, 4.5, 4.7, 4.8_

- [ ] 7. Implement Communication Agent and Lambda function
  - [~] 7.1 Create Communication Lambda function with SES and external API integration
    - Implement `send_welcome_email` function using Amazon SES
    - Implement `notify_manager` function to send manager notification
    - Implement `post_to_teams` function using Microsoft Graph API
    - Implement `create_calendar_event` function using Microsoft Graph API
    - Implement `send_milestone_update` function for progress notifications
    - Implement retry logic with exponential backoff (3 attempts, 2s, 4s, 8s)
    - Create Lambda handler with API Gateway integration
    - Log all communications to CommunicationLog table
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

  - [~] 7.2 Implement SQS retry queue for failed communications
    - Create SQS queue for failed communications with visibility timeout
    - Implement `retry_failed_communication` function to process retry queue
    - Configure DLQ for communications failing after 3 retries
    - Set up EventBridge rule to trigger retry Lambda
    - _Requirements: 5.7_

  - [ ]* 7.3 Write unit tests for Communication Lambda
    - Test `send_welcome_email` with valid employee data
    - Test `notify_manager` with valid manager and employee IDs
    - Test `post_to_teams` with valid channel and message
    - Test `create_calendar_event` with valid event data
    - Test retry logic with exponential backoff
    - Test communication logging to DynamoDB
    - Mock SES and Microsoft Graph API calls
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

  - [ ]* 7.4 Write integration tests for Communication Lambda
    - Test SES email delivery with test addresses
    - Test communication log writes to DynamoDB
    - Test SQS queue for retry processing
    - Test DLQ for permanently failed communications
    - Verify 2-minute delivery time requirement
    - _Requirements: 5.6, 5.7, 10.8_

- [ ] 8. Implement Daily Task Agent and Lambda function
  - [~] 8.1 Create Task Lambda function with DynamoDB access
    - Implement `get_daily_incidents` function to query Incidents table by date
    - Implement `get_assigned_tasks` function to query Tasks table by employee ID
    - Implement `get_training_assignments` function to retrieve training data
    - Implement `update_task_status` function to update task completion in DynamoDB
    - Implement `notify_new_incident` function to send incident notification
    - Create Lambda handler with API Gateway integration
    - Handle TaskNotFoundError and UpdateConflictError with optimistic locking
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 6.7_

  - [~] 8.2 Implement DynamoDB Streams trigger for real-time incident notifications
    - Create DynamoDB Stream on Incidents table
    - Create Lambda function to process stream records
    - Implement notification logic triggered by new incident inserts
    - Ensure 1-minute notification delivery SLA with retry fallback
    - Use EventBridge for notification delivery
    - _Requirements: 6.4, 6.5_

  - [ ]* 8.3 Write unit tests for Task Lambda
    - Test `get_daily_incidents` with current date
    - Test `get_assigned_tasks` with valid employee ID
    - Test `get_training_assignments` retrieval
    - Test `update_task_status` with valid and invalid task IDs
    - Test `notify_new_incident` with incident data
    - Test concurrent update conflict handling
    - Mock DynamoDB operations
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 6.7_

  - [ ]* 8.4 Write integration tests for Task Lambda
    - Test query on Incidents table by date partition key
    - Test query on Tasks table by employee ID
    - Test update operations with conditional expressions
    - Test DynamoDB Streams trigger for incident notifications
    - Verify 1-minute notification SLA
    - _Requirements: 6.4, 6.5, 6.7_

- [~] 9. Checkpoint - Verify all specialized agents are functional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement Orchestrator Agent using Amazon Bedrock Multi-Agent Collaboration
  - [~] 10.1 Create Orchestrator Lambda function with Bedrock integration
    - Implement `route_request` function to analyze request and determine required agents
    - Implement `delegate_tasks` function to send tasks to specialized agents asynchronously
    - Implement `aggregate_responses` function to combine multiple agent responses
    - Implement `update_state` function to update overall onboarding progress
    - Implement `handle_agent_failure` function with fallback and retry logic
    - Create agent request and response message structures
    - Integrate with Amazon Bedrock Multi-Agent Collaboration API
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [~] 10.2 Implement agent communication protocol
    - Define request message format (requestId, timestamp, agentType, action, parameters, context)
    - Define response message format (requestId, timestamp, agentType, status, data, errors, metadata)
    - Implement message serialization and deserialization
    - Implement message routing logic to correct agent Lambda functions
    - _Requirements: 1.2, 1.3_

  - [~] 10.3 Configure Bedrock foundation models and agent definitions for specialized agents
    - Configure LLM foundation models for Bedrock agents using the confirmed model IDs:
      - Orchestrator Agent: `anthropic.claude-3-5-sonnet-20241022-v2:0` for complex multi-agent coordination
      - Knowledge Agent: `anthropic.claude-3-5-sonnet-20241022-v2:0` for intelligent Q&A and reasoning
      - Profile Agent: `anthropic.claude-3-haiku-20240307-v1:0` for fast profile queries
      - Setup Agent: `anthropic.claude-3-sonnet-20240229-v1:0` for complex provisioning orchestration
      - Communication Agent: `anthropic.claude-3-haiku-20240307-v1:0` for fast message generation
      - Daily Task Agent: `anthropic.claude-3-haiku-20240307-v1:0` for efficient task management
    - Create Bedrock agent configuration for Profile Agent:
      - Define agent instruction: "You are a profile management assistant that retrieves and displays employee information and organizational charts."
      - Configure action group for employee profile operations
      - Link to Profile Lambda function
    - Create Bedrock agent configuration for Setup Agent:
      - Define agent instruction: "You are an IT provisioning coordinator that orchestrates system setup workflows including VPN, email, SharePoint, Workday, and software installation."
      - Configure action group for provisioning operations
      - Link to Setup Lambda function
    - Create Bedrock agent configuration for Knowledge Agent:
      - Define agent instruction: "You are an intelligent knowledge base assistant that answers employee questions using company documents. Apply role-based and location-based filtering, and always provide source citations."
      - Configure action group for knowledge base queries
      - Link to Knowledge Lambda function
      - Enable Bedrock Knowledge Base integration with `amazon.titan-embed-text-v2:0` (1024 dimensions)
    - Create Bedrock agent configuration for Communication Agent:
      - Define agent instruction: "You are a communication coordinator that sends emails, Teams messages, and calendar invites. Ensure professional tone and timely delivery."
      - Configure action group for communication operations
      - Link to Communication Lambda function
    - Create Bedrock agent configuration for Daily Task Agent:
      - Define agent instruction: "You are a task management assistant that tracks daily incidents, tasks, and training assignments. Provide clear summaries and update statuses accurately."
      - Configure action group for task operations
      - Link to Task Lambda function
    - Test each agent's LLM responses for quality and appropriateness
    - _Requirements: 1.1, 1.5_

  - [~] 10.4 Test and tune LLM agent responses and system prompts
    - Create test scenarios for each agent type
    - Evaluate LLM response quality (accuracy, relevance, tone, latency, citation quality)
    - Tune agent system prompts based on test results
    - Test multi-agent coordination through Orchestrator
    - Document optimal prompt configurations and LLM model parameters
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 10.5 Write unit tests for Orchestrator Lambda
    - Test `route_request` correctly identifies required agents for various request types
    - Test `delegate_tasks` sends tasks to correct agents
    - Test `aggregate_responses` combines multiple agent responses correctly
    - Test `handle_agent_failure` implements retry and fallback logic
    - Test partial success scenarios (some agents succeed, others fail)
    - Mock Bedrock Multi-Agent API calls
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 10.6 Write integration tests for multi-agent orchestration
    - Test orchestrator delegates to multiple agents in single request
    - Test complete onboarding workflow (profile + setup + communication)
    - Test knowledge query workflow (profile + knowledge)
    - Test agent failure scenarios with graceful degradation
    - Test state persistence in DynamoDB
    - Verify end-to-end agent communication
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 11. Implement web dashboard frontend
  - [~] 11.1 Create HTML structure for dashboard components
    - Create `index.html` with semantic HTML5 structure
    - Implement profile card section with employee photo, name, title, department
    - Implement setup progress bar section with step-by-step breakdown
    - Implement organizational chart section with interactive visualization container
    - Implement daily tasks panel with incidents, tasks, and training tabs
    - Implement AI chat interface section with input and message display
    - Implement FAQ section with category filters and expandable answers
    - Add accessibility attributes (ARIA labels, roles, semantic elements)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.8_

  - [~] 11.2 Implement CSS styling with responsive design
    - Create `styles.css` with CSS Grid and Flexbox layouts
    - Implement responsive breakpoints (Desktop: 1200px+, Tablet: 768px-1199px, Mobile: 320px-767px)
    - Style all dashboard components
    - Implement smooth animations and transitions (60 FPS target)
    - _Requirements: 7.8_

  - [~] 11.3 Implement JavaScript for API integration and interactivity
    - Create `app.js` with ES6+ module structure
    - Implement authentication token management with localStorage
    - Implement Fetch API wrapper for backend API calls
    - Implement all dashboard component data fetching and display
    - Implement error handling and user-friendly error messages
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [~] 11.4 Implement WebSocket connection for real-time updates
    - Establish WebSocket connection on page load
    - Implement WebSocket message handler for progress updates
    - Update progress bar and tasks panel in real-time
    - Implement WebSocket reconnection logic (< 2 seconds)
    - _Requirements: 3.6, 6.4, 7.2_

  - [ ]* 11.5 Write end-to-end tests for dashboard
    - Test page load within 3 seconds
    - Test all major dashboard interactions
    - Test responsive design on different screen sizes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.8, 7.9_

- [~] 12. Checkpoint - Verify dashboard integration with backend
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement FAQ data seeding and management
  - [~] 13.1 Create FAQ data seeding script
    - Create Python script to populate FAQ table with sample questions
    - Add FAQs for "IT Setup", "HR Policies", "Benefits", "Workspace", and "Getting Started" categories
    - Execute seeding script to populate DynamoDB FAQ table
    - _Requirements: 11.1, 11.2, 11.3_

  - [~] 13.2 Create FAQ Lambda endpoint handler
    - Implement `get_faq_list` function to query FAQ table by category
    - Implement view count increment with atomic counter
    - Create Lambda handler for `/api/v1/faq` endpoint
    - Support category filtering via query parameters
    - _Requirements: 11.1, 11.2, 11.4, 11.8_

  - [ ]* 13.3 Write unit tests for FAQ Lambda
    - Test `get_faq_list` retrieves FAQs by category
    - Test view count increment on FAQ access
    - Test filtering by category
    - Mock DynamoDB operations
    - _Requirements: 11.1, 11.2, 11.4_

- [ ] 14. Implement observability and monitoring
  - [~] 14.1 Create CloudWatch dashboards
    - Create dashboard for Lambda, API Gateway, DynamoDB, SES metrics
    - Create dashboard for custom business metrics
    - _Requirements: 8.8_

  - [~] 14.2 Set up CloudWatch alarms
    - Create alarms for Lambda error rate, API Gateway 5xx rate, provisioning timeout, Knowledge query latency, DynamoDB throttling, SES bounce rate, DLQ depth
    - Configure SNS topics for alarm notifications
    - _Requirements: 8.8_

  - [~] 14.3 Enable AWS X-Ray tracing
    - Enable X-Ray on all Lambda functions and API Gateway
    - Implement X-Ray custom subsegments for key operations
    - _Requirements: 8.8_

  - [~] 14.4 Configure structured logging for all Lambda functions
    - Implement structured JSON logging with contextual information
    - Configure CloudWatch Logs retention and Insights queries
    - _Requirements: 8.8, 10.7_

- [ ] 15. Implement security hardening
  - [~] 15.1 Configure authentication and authorization
    - Integrate API Gateway with AWS Cognito or corporate SAML IdP
    - Implement Lambda authorizer for JWT token validation
    - Configure token expiration and refresh token rotation
    - Implement role-based access control checks in Lambda functions
    - _Requirements: 10.1_

  - [~] 15.2 Enable encryption at rest and in transit
    - Verify DynamoDB encryption at rest using AWS KMS
    - Verify S3 bucket encryption (SSE-S3 or SSE-KMS)
    - Enforce HTTPS (TLS 1.3) on API Gateway
    - Configure SES to use TLS for email delivery
    - Store secrets in AWS Secrets Manager
    - _Requirements: 10.2, 10.4, 10.8_

  - [~] 15.3 Implement security filtering for Knowledge Base
    - Add security clearance validation in Knowledge Lambda
    - Filter documents based on employee clearance level (Public, Internal, Confidential, Restricted)
    - Ensure employee clearance level exceeds document clearance level for access
    - Test access denial for insufficient clearance
    - _Requirements: 10.5, 10.6_

  - [~] 15.4 Enable audit logging
    - Enable AWS CloudTrail for all API calls
    - Enable API Gateway access logs to S3
    - Enable Lambda execution logs to CloudWatch
    - Log all access attempts to sensitive data
    - Configure 7-year retention for audit logs
    - _Requirements: 10.7_

  - [ ]* 15.5 Write security tests
    - Test unauthenticated access is denied (401)
    - Test unauthorized access to other employee data (403)
    - Test data encryption at rest for DynamoDB and S3
    - Test security clearance filtering in Knowledge Base
    - Test JWT token validation
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 16. Seed real dataset and populate development data
  - [~] 16.1 Create employee test data seeding script
    - Create Python script to populate Employees table with test data representing TechVenture Sdn Bhd personas
    - Create test employees with various roles (Engineering, Management, Finance, Product, HR)
    - Create test employees with various locations (Kuala Lumpur, remote)
    - Create test employees with various security clearances (Internal, Confidential) matching the dataset clearance scheme
    - Populate employee hierarchy for organizational chart (CEO, VP Engineering, Engineering Leads, Developers)
    - Execute seeding script to populate development DynamoDB tables
    - _Requirements: 9.1, 9.2_

  - [~] 16.2 Create org chart test data seeding script
    - Create Python script to populate OrgChart table with hierarchy relationships
    - Create multi-level organizational hierarchy reflecting TechVenture structure (CEO → VP → Lead → IC)
    - Populate parent-child relationships and hierarchy levels
    - Execute seeding script to populate development DynamoDB tables
    - _Requirements: 9.2_

  - [~] 16.3 Create tasks and incidents seeding script from real dataset
    - Create Python script to populate Tasks table with onboarding tasks derived from `Employee-Onboarding-Checklist.md`
    - Create Python script to populate Incidents table with sample incidents derived from `incident-postmortem-2026-06-09.md` (INC-2026-0089 and follow-up remediation items)
    - Create incidents with severity levels matching postmortem data (Critical, High, Medium)
    - Reference `workflow-messages.csv` to seed representative workflow tasks across cloud-migration, mobile-app, and reporting-module projects
    - Execute seeding script to populate development DynamoDB tables
    - _Requirements: 9.3_

  - [~] 16.4 Verify dataset is correctly indexed in Knowledge Base
    - Run `scripts/seed_s3_dataset.py` against development S3 to upload all 11 files
    - Trigger Bedrock Knowledge Base sync and wait for completion
    - Verify all 11 documents appear in the knowledge base index
    - Run 5 representative Q&A queries to validate retrieval quality:
      - "What is the password rotation policy?" (→ IT-Security-Policy-v2.3.md)
      - "What is the daily meal allowance for travel?" (→ Travel-Expense-SOP.md)
      - "What phase is the cloud migration in?" (→ Cloud-Migration-Strategy-2026.md)
      - "What was Q1 2026 revenue?" (→ QBR-Q1-2026-Summary.md)
      - "What are the onboarding steps for a new engineer?" (→ Employee-Onboarding-Checklist.md)
    - Verify role/clearance filtering blocks Confidential docs for Internal-only users
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.5_

- [ ] 17. Deploy and verify complete system integration
  - [~] 17.1 Deploy infrastructure to staging environment
    - Deploy CDK stack to staging AWS account
    - Verify all DynamoDB tables are created
    - Verify S3 bucket and Bedrock Knowledge Base are configured with all 11 dataset files
    - Verify all Lambda functions are deployed
    - Verify API Gateway is deployed and accessible
    - _Requirements: 8.1, 8.2, 8.3, 8.6_

  - [~] 17.2 Execute data seeding in staging
    - Run employee data seeding script against staging DynamoDB
    - Run org chart data seeding script against staging DynamoDB
    - Run tasks and incidents seeding script against staging DynamoDB
    - Run FAQ seeding script against staging DynamoDB
    - Run `scripts/seed_s3_dataset.py` to upload all 11 dataset files to staging S3 with metadata
    - Trigger Bedrock Knowledge Base sync and verify all documents are indexed
    - _Requirements: 4.1, 4.2, 9.5_

  - [~] 17.3 Execute end-to-end integration tests in staging
    - Test complete onboarding workflow (profile retrieval → setup provisioning → communication)
    - Test knowledge query with metadata filtering against real dataset documents
    - Test real-time updates via WebSocket
    - Test task management workflow
    - Test FAQ retrieval
    - Test multi-agent orchestration
    - Verify all performance SLAs are met
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.8, 4.8, 5.6, 7.9_

  - [ ]* 17.4 Execute performance and load testing
    - Run load tests with 100 concurrent users
    - Test API Gateway throughput (profile: 500 req/s, knowledge: 100 req/s)
    - Test Lambda concurrency and scaling behavior
    - Test DynamoDB on-demand capacity scaling
    - Verify p95 latency targets are met
    - _Requirements: 8.6, 9.8_

- [ ] 18. Final checkpoint and production readiness
  - [~] 18.1 Complete documentation
    - Create API documentation with request/response examples
    - Create deployment runbooks including LocalStack local development setup
    - Create troubleshooting guides for common issues
    - Document monitoring and alerting strategy
    - Create disaster recovery procedures
    - _Requirements: 8.8_

  - [~] 18.2 Conduct security review
    - Review IAM roles for least privilege
    - Review encryption configuration
    - Review audit logging configuration
    - Review authentication and authorization implementation
    - Address any security findings
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [~] 18.3 Production deployment
    - Deploy CDK stack to production AWS account
    - Execute production data seeding (FAQ, all 11 dataset documents with metadata)
    - Configure production monitoring and alerts
    - Verify health check endpoint responds
    - Conduct smoke tests in production
    - _Requirements: 8.7_

  - [~] 18.4 Final verification
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability and validation
- Checkpoints ensure incremental validation at key milestones
- **Local development**: Use `docker-compose up` to start LocalStack, then run `scripts/start_local.sh` to seed all data automatically
- **Real dataset**: All 11 files in `./dataset/` are the canonical knowledge base documents — no synthetic document generation is needed
- **Embedding model**: `amazon.titan-embed-text-v2:0` with 1024 dimensions and 512-token chunk size; metadata (category, clearance_level, role) is stored alongside each chunk vector in OpenSearch Serverless
- **Model IDs confirmed**: Orchestrator + Knowledge Agent use `anthropic.claude-3-5-sonnet-20241022-v2:0`; Profile, Communication, Daily Task Agents use `anthropic.claude-3-haiku-20240307-v1:0`; Setup Agent uses `anthropic.claude-3-sonnet-20240229-v1:0`
- Unit tests and integration tests validate component functionality
- End-to-end tests validate complete user workflows
- Security tests validate authentication, authorization, and data protection
- Performance tests validate scalability and latency requirements
- The system is primarily infrastructure orchestration and integration, so property-based testing is not applicable
- Python 3.12 is used for all Lambda functions
- AWS CDK is used for infrastructure as code
- Amazon Bedrock Multi-Agent Collaboration is used for agent orchestration
- Real-time updates are delivered via WebSocket API
- All AWS managed services (DynamoDB, S3, Lambda, API Gateway, SQS, SES, Bedrock) are used to minimize operational overhead

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["0.1"] },
    { "id": 1, "tasks": ["0.2", "1.1"] },
    { "id": 2, "tasks": ["0.3", "1.2"] },
    { "id": 3, "tasks": ["0.4", "0.5", "1.3"] },
    { "id": 4, "tasks": ["1.4", "1.5", "2.1"] },
    { "id": 5, "tasks": ["2.2", "3.1", "13.1"] },
    { "id": 6, "tasks": ["3.2", "3.3", "4.1", "13.2"] },
    { "id": 7, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6", "13.3"] },
    { "id": 8, "tasks": ["4.7", "4.8", "6.1"] },
    { "id": 9, "tasks": ["6.2", "7.1"] },
    { "id": 10, "tasks": ["6.3", "6.4", "7.2", "8.1"] },
    { "id": 11, "tasks": ["7.3", "7.4", "8.2"] },
    { "id": 12, "tasks": ["8.3", "8.4", "10.1"] },
    { "id": 13, "tasks": ["10.2", "10.3"] },
    { "id": 14, "tasks": ["10.4"] },
    { "id": 15, "tasks": ["10.5", "10.6", "11.1"] },
    { "id": 16, "tasks": ["11.2"] },
    { "id": 17, "tasks": ["11.3"] },
    { "id": 18, "tasks": ["11.4", "11.5"] },
    { "id": 19, "tasks": ["14.1", "14.2", "14.3", "14.4"] },
    { "id": 20, "tasks": ["15.1", "15.2", "15.3", "15.4"] },
    { "id": 21, "tasks": ["15.5", "16.1", "16.2", "16.3"] },
    { "id": 22, "tasks": ["16.4"] },
    { "id": 23, "tasks": ["17.1"] },
    { "id": 24, "tasks": ["17.2"] },
    { "id": 25, "tasks": ["17.3", "17.4"] },
    { "id": 26, "tasks": ["18.1", "18.2"] },
    { "id": 27, "tasks": ["18.3"] }
  ]
}
```
