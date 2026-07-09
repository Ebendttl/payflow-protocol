# 🚀 PayFlow Protocol Deployment Guide

This guide details how to configure and deploy the PayFlow Protocol monorepo to production, splitting the stack between **Vercel** (for the serverless frontend) and **Render** (for the persistent event indexer backend).

---

## 📦 Part 1: Deploying the Next.js Frontend on Vercel

Vercel provides native support for Next.js and `pnpm` workspaces. Follow these steps to link your repository and deploy.

### 1. Create a New Project on Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your `payflow-protocol` Git repository.

### 2. Configure Monorepo Project Settings

On the project configuration screen, set the following parameters:

- **Framework Preset**: `Next.js`
- **Root Directory**: Click _Edit_ and select **`apps/web`**.
- **Build & Development Settings**:
  - Toggle _Override_ for **Build Command**: Set to **`pnpm --filter @payflow/sdk build && next build`** (This builds the shared SDK package before compiling the Next.js app).
  - Toggle _Override_ for **Output Directory**: Set to `.next` (default).
  - Toggle _Override_ for **Install Command**: Set to `pnpm install` (Vercel automatically detects the lockfile at the workspace root and installs all workspace dependencies).

### 3. Add Environment Variables

Add the following key-value pairs under **Environment Variables**:

| Key                                        | Actual Value                                               | Description                           |
| ------------------------------------------ | ---------------------------------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_NETWORK`                      | `testnet`                                                  | Target Stellar network environment    |
| `NEXT_PUBLIC_HORIZON_RPC_URL`              | `https://soroban-rpc.testnet.stellar.gateway.fm`           | Target Soroban RPC provider url       |
| `NEXT_PUBLIC_STREAM_FACTORY_CONTRACT_ID`   | `CARYVEW3UGDWVTF6DXG2PJ4AMGLTXS377HGMJQI7QWVSXWSZIUO4XHZZ` | Deployed stream factory contract ID   |
| `NEXT_PUBLIC_MILESTONE_ESCROW_CONTRACT_ID` | `CATLNHGZPOCUVKZQXAXMJO46Z5A44XN3TBOGU7JTRIN6R4CO7SHGUWBZ` | Deployed milestone escrow contract ID |
| `NEXT_PUBLIC_STREAM_VAULT_CONTRACT_ID`     | `CDAFGGCUE4VQPXY5SIZ3SENQK4VXAOQMW5L6NWPRX2JTO5IERRPKPQ2D` | Deployed stream vault contract ID     |
| `NEXT_PUBLIC_INDEXER_URL`                  | `https://payflow-indexer.onrender.com`                     | Live URL of your Render backend       |

### 4. Deploy

Click **Deploy**. Vercel will resolve the `pnpm-lock.yaml` at the root, build the shared package graph, build the Next.js assets, and serve the dashboard.

---

## 🗄️ Part 2: Deploying the Hono Event Indexer on Render

The event indexer is a persistent backend daemon that polls Horizon and serves a REST API. Render is the ideal platform to run this continuously.

### 1. Provision a PostgreSQL Database on Render

Because the SQLite database is reset on serverless deployments, you should configure a PostgreSQL instance:

1. From your [Render Dashboard](https://dashboard.render.com), click **New** > **PostgreSQL**.
2. Name the database (e.g., `payflow-db`).
3. Select your region and tier (the Free tier is sufficient for testing).
4. Click **Create Database** and copy the **Internal Database URL** or **External Database URL**.

### 2. Create a Web Service for the Indexer

1. Click **New** > **Web Service**.
2. Select your `payflow-protocol` Git repository.
3. Configure the following project parameters:
   - **Name**: `payflow-indexer`
   - **Environment / Runtime**: `Node`
   - **Region**: Select the same region as your database.
   - **Branch**: `main`
   - **Root Directory**: Leave blank (keep at repository root `./` so the monorepo package graph resolves).
   - **Build Command**: `pnpm install && pnpm --filter @payflow/indexer build`
   - **Start Command**: `node packages/indexer/dist/index.js`

### 3. Configure Backend Environment Variables

Under the **Environment** tab, click **Add Environment Variable** and enter:

| Key            | Value                                                                                                                                                                        | Description                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `NODE_ENV`     | `production`                                                                                                                                                                 | Production environment tag                                |
| `DATABASE_URL` | `postgresql://codesync:DkRVtlH6koICtyBOuP390yfpqA900W66@dpg-d8grq6v7f7vs73f4scu0-a.oregon-postgres.render.com/codesync_jhrk`                                                 | Connection string to your active Render Postgres instance |
| `HORIZON_URL`  | `https://horizon-testnet.stellar.org`                                                                                                                                        | Horizon node url for event polling                        |
| `CONTRACT_IDS` | `CARYVEW3UGDWVTF6DXG2PJ4AMGLTXS377HGMJQI7QWVSXWSZIUO4XHZZ,CATLNHGZPOCUVKZQXAXMJO46Z5A44XN3TBOGU7JTRIN6R4CO7SHGUWBZ,CDAFGGCUE4VQPXY5SIZ3SENQK4VXAOQMW5L6NWPRX2JTO5IERRPKPQ2D` | Comma-separated list of on-chain contract IDs to index    |
| `PORT`         | `3001`                                                                                                                                                                       | Server port (automatically assigned by Render)            |

### 4. Deploy & Connect

Click **Create Web Service**. Render will install the monorepo packages, build the indexer using `tsup`, start the polling listener, and expose the REST endpoints. Use the generated `https://...onrender.com` URL to update your Vercel `NEXT_PUBLIC_INDEXER_API_URL` configuration.
