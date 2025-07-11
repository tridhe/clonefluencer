# Clonefluencer 🚀 – Virtual Influencer Platform

## 📑 Slide Deck Outline

### 1. Title

- Clonefluencer – GenAI-powered virtual influencers on demand

### 2. Problem

- Influencer marketing is costly, slow, and hard to control

### 3. Solution

- AI-generated personas & content delivered in minutes

### 4. Live Demo

- [Live Demo](https://main.dqu54vqh53v5a.amplifyapp.com/)
- [Video Demo](https://youtu.be/_GXPzIEyObg)
- Persona Studio → Product Upload → Image Generation → Gallery

### 5. Key Features

- AI character builder
- Product integration
- Multi-model image generation (Bedrock)
- Community explore & gallery

### 6. Architecture

- Next.js frontend → Flask API → AWS Bedrock models
- AWS Cognito, DynamoDB, S3, CloudFront for auth, data, storage, CDN

### 7. Tech Stack

- React 15 / Next.js App Router, TypeScript, Tailwind CSS
- Python 3.11, Flask
- AWS Bedrock (Claude 3 Sonnet, Titan Text/Image, Nova Canvas, SDXL)

### 8. AWS Services Used

- Amazon Bedrock – GenAI models
- Amazon Cognito – Auth & user pools
- Amazon S3 – Image storage
- Amazon DynamoDB – Metadata
- AWS EC2 / App Runner – Backend hosting
- Amazon CloudFront – Global CDN
- AWS IAM & CloudWatch – Security & logging

### 9. Judge Credentials

- Email: `genaihackathon2025@impetus.com`
- Password: `HackathonJudge2025!`

### 10. Roadmap

- Video generation
- Brand style transfer
- Analytics dashboard

### 11. Team

- 3 devs, 1 designer, 1 ML engineer

### 12. Thank You

- Q&A

---

## 🖥️ Technical Documentation

### System Overview

1. **Frontend** (Next.js 15) serves React pages, authenticates with Cognito, and calls backend REST endpoints.
2. **Backend** (Flask) exposes REST routes for image generation, prompt optimization, storage, and health checks.
3. **AI Layer** connects to Amazon Bedrock foundation models through a unified service wrapper.
4. **Data Layer** stores images in S3 and metadata in DynamoDB.
5. **Auth** handled by Amazon Cognito with JWTs.
6. **CDN** via CloudFront for low-latency global delivery.

### High-Level Request Flow

1. User logs in → Cognito returns JWT.
2. Frontend sends generation request with JWT → Flask API validates token.
3. Flask calls Konext Service to optimise prompt → Bedrock text model (Claude 3 / Titan).
4. Optimised prompt passed to Image Generation Service → Bedrock image model (Nova Canvas / SDXL / Titan Image).
5. Generated image stored in S3; metadata saved in DynamoDB.
6. API returns image URL; frontend updates gallery in real-time.

### Key Services / Modules

- `auth_context.tsx` – React context for JWT handling
- `bedrock_service.py` – Abstraction over Bedrock text & image models
- `image_generation_service.py` – Handles model selection & conversion
- `storage_service.py` – S3 uploads & presigned URLs
- `kontext_service.py` – Prompt engineering & optimisation

### Deployment

- **CI/CD**: GitHub Actions → Docker build → AWS App Runner
- **Infra as Code**: `deploy-config.json`, `render.yaml`, `apprunner.yaml`
- **Monitoring**: CloudWatch logs & alarms

---

## 🏗️ Architecture Diagram (Text)

```
User Browser
   |
   | HTTPS
   v
CloudFront (CDN)
   |
   v
Next.js Frontend (Vercel / S3+CloudFront)
   |
   | REST (JWT)
   v
Flask API (EC2 / App Runner)
   |\
   | \__ Prompt → Bedrock Text (Claude 3 / Titan)
   |__ Image  → Bedrock Image (Nova Canvas / SDXL / Titan)
   |
   |__ S3 (Image Storage)
   |
   |__ DynamoDB (Metadata)
   |
   |__ Cognito (Auth)
```

---

## 📝 API Endpoints (excerpt)

| Method | Endpoint           | Description                          |
| ------ | ------------------ | ------------------------------------ |
| GET    | `/health`          | Service health check                 |
| POST   | `/generate/image`  | Generate image from prompt & product |
| POST   | `/generate/prompt` | Optimise prompt (Kontext)            |
| GET    | `/gallery/:userId` | Fetch user gallery                   |
| POST   | `/save/image`      | Save image metadata                  |

---

### Environment Variables

- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`
- `S3_BUCKET_NAME`, `DYNAMODB_TABLE_NAME`
- `BEDROCK_MODEL_ID_TEXT`, `BEDROCK_MODEL_ID_IMAGE`

---

**Built with ❤️ at the GenAI Hackathon 2025**
