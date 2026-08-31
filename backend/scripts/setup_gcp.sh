#!/bin/bash
# Setup Script for GCP Services (Gmail API, Pub/Sub, Cloud Run, Firestore)

PROJECT_ID=${1:-"glossy-agent-prod"}
TOPIC_NAME="gmail-updates"
SUBSCRIPTION_NAME="gmail-push-sub"
CLOUD_RUN_SERVICE="glossy-backend"
REGION="us-central1"

echo "=== Initializing GCP Setup for Project Glossy ($PROJECT_ID) ==="

gcloud config set project $PROJECT_ID

# 1. Enable APIs
echo "Enabling GCP APIs..."
gcloud services enable \
    gmail.googleapis.com \
    pubsub.googleapis.com \
    run.googleapis.com \
    firestore.googleapis.com \
    aiplatform.googleapis.com

# 2. Create Pub/Sub Topic
echo "Creating Pub/Sub Topic..."
gcloud pubsub topics create $TOPIC_NAME || true

# 3. Grant Gmail permission to publish to Pub/Sub topic
echo "Granting Pub/Sub publisher permissions to Gmail service account..."
gcloud pubsub topics add-iam-policy-binding $TOPIC_NAME \
    --member="serviceAccount:gmail-api-push@system.gserviceaccount.com" \
    --role="roles/pubsub.publisher"

# 4. Deploy Backend to Cloud Run
echo "Deploying Cloud Run service..."
gcloud run deploy $CLOUD_RUN_SERVICE \
    --source . \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID,PUBSUB_TOPIC=projects/$PROJECT_ID/topics/$TOPIC_NAME,ALLOW_AUTO_SEND=true"

# 5. Get Cloud Run Webhook URL
CLOUD_RUN_URL=$(gcloud run services describe $CLOUD_RUN_SERVICE --region $REGION --format 'value(status.url)')
WEBHOOK_ENDPOINT="$CLOUD_RUN_URL/webhook/gmail-pubsub"

# 6. Create Pub/Sub Push Subscription
echo "Creating Pub/Sub Push Subscription to $WEBHOOK_ENDPOINT..."
gcloud pubsub subscriptions create $SUBSCRIPTION_NAME \
    --topic=$TOPIC_NAME \
    --push-endpoint=$WEBHOOK_ENDPOINT || true

echo "=== GCP Setup Completed Successfully ==="
echo "Cloud Run Service URL: $CLOUD_RUN_URL"
echo "Gmail Pub/Sub Push Endpoint: $WEBHOOK_ENDPOINT"
