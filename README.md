# Outreach Fox

**Multichannel outreach platform that helps you land in the inbox — not the spam folder.**

Outreach Fox is a powerful sales engagement tool for managing cold email and LinkedIn outreach campaigns at scale. Build automated multichannel sequences, warm up mailboxes, manage contacts, and track performance — all from a single, modern dashboard.

---

## ✨ Key Features

### 📧 Email Outreach
- **Campaign Builder** — Visual flow builder to create multi-step email sequences with up to 5 A/B variants per step
- **Mailbox Management** — Connect and manage multiple sending mailboxes with SMTP authentication support
- **Domain Management** — Manage sending domains with DNS configuration and health monitoring
- **Email Warmup** — Built-in mailbox warmup engine with customizable warmup profiles to build sender reputation
- **Spintax & Variables** — Dynamic personalization with `{{variables}}` and `{spintax|support}`

### 💼 LinkedIn Outreach
- **LinkedIn Accounts** — Connect and manage LinkedIn accounts for multichannel sequences
- **Multichannel Sequences** — Combine email and LinkedIn steps in a single campaign workflow

### 📊 Analytics & Tracking
- **Campaign Analytics** — Track opens, clicks, replies, and bounces with per-channel breakdowns (Email & LinkedIn)
- **Global Analytics** — Workspace-level analytics dashboard for cross-campaign insights
- **Spam Analytics** — Built-in spam word dictionary and deliverability analysis

### 📬 Unibox (Unified Inbox)
- **Centralized Inbox** — View and respond to all campaign replies in one place
- **Smart Categorization** — AI-powered reply categorization (interested, not interested, out of office, etc.)
- **Thread Management** — Inbox, Important, Bounced, and Untracked email views

### 👥 Contacts & Lists
- **Contact Management** — Import, organize, and manage contacts across lists
- **CSV Upload** — Bulk import contacts via CSV with field mapping
- **Suppression Lists** — Global and workspace-level suppression to prevent unwanted outreach
- **List Analytics** — Track engagement metrics per contact list

### ⚙️ Workspace & Settings
- **Multi-Workspace Support** — Organize campaigns and resources into separate workspaces
- **Team Collaboration** — Invite team members and manage client access with role-based permissions
- **Sending Schedules** — Configure timezone-aware sending windows
- **Webhooks** — Real-time event notifications for campaign activity
- **Custom Themes** — Choose from multiple color themes with light/dark mode support
- **White-Label / Branding** — Custom branding support for agencies and partners

### 💳 Billing & Subscription
- **Stripe Integration** — Subscription management and billing powered by Stripe
- **API Access** — Developer API for programmatic access

---

## 🛠 Tech Stack

| Layer           | Technology                                                        |
| --------------- | ----------------------------------------------------------------- |
| **Framework**   | [Vue 3](https://vuejs.org/) (Composition API + Options API)       |
| **UI Kit**      | [Quasar Framework v2](https://quasar.dev/) (Webpack)              |
| **State**       | [Pinia](https://pinia.vuejs.org/)                                 |
| **API (REST)**  | [Axios](https://axios-http.com/)                                  |
| **API (GQL)**   | [Apollo Client](https://www.apollographql.com/docs/react/) + GraphQL Subscriptions |
| **Rich Editor** | [Froala Editor](https://froala.com/wysiwyg-editor/)               |
| **Charts**      | [ApexCharts](https://apexcharts.com/) (via vue3-apexcharts)       |
| **Flow Builder**| [Vue Flow](https://vueflow.dev/)                                  |
| **Payments**    | [Stripe.js](https://stripe.com/docs/js)                           |
| **Analytics**   | [PostHog](https://posthog.com/)                                   |
| **Feedback**    | [Gleap](https://gleap.io/)                                        |
| **Desktop**     | [Electron](https://www.electronjs.org/) (via Quasar)              |
| **Mobile**      | [Capacitor](https://capacitorjs.com/) (via Quasar)                |

---

## 📁 Project Structure

```
src/
├── assets/              # Static assets (images, SVGs)
├── boot/                # Quasar boot files (plugins, constants, auth guard)
├── components/          # Reusable Vue components
│   ├── CampaignForm/        # Campaign creation form
│   ├── CampaignWorkflow/    # Visual sequence/flow builder
│   ├── Contacts/            # Contact management components
│   ├── Editor/              # Rich text email editor
│   ├── Unibox/              # Unified inbox components
│   ├── Warmup/              # Warmup configuration
│   ├── Webhooks/            # Webhook management
│   └── ...                  # 40+ component groups
├── composables/         # Vue composables (permissions, workspace, toast)
├── css/                 # Global SCSS styles
├── graphql/             # Apollo client setup & GraphQL schemas
├── layouts/             # App layouts (Auth, App, Header)
├── pages/               # Route-level page components
│   ├── Campaigns/           # Campaign listing & editor
│   ├── CampaignById/        # Campaign detail & analytics
│   ├── Contacts/            # Contact views
│   ├── Domains/             # Domain management
│   ├── Mailboxes/           # Mailbox management
│   ├── LinkedIn/            # LinkedIn account management
│   ├── Unibox/              # Unified inbox pages
│   └── WorkspaceSettings/   # Workspace configuration
├── router/              # Vue Router configuration
├── stores/              # Pinia stores (auth, unibox, preferences)
├── tiptap-extensions/   # Custom Tiptap editor extensions
└── utils/               # Utility functions & API helpers
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `v24.15.0` (recommended) — also supports `^20`, `^18`, or `^16`
- **npm** `>= 6.13.4` or **yarn** `>= 1.21.1`
- **Quasar CLI** installed globally:

```bash
npm install -g @quasar/cli
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd emailfox-outreach-fe

# Install dependencies
npm install
# or
yarn
```

### Environment Setup

Create a `.env` file in the project root with the following variables:

```env
DEV_MODE="true"
BE_API_URL="https://api.outreachfox.ai/api"
STRIPE_PAY_KEY="<your-stripe-publishable-key>"
GRAPHQL_ENDPOINT="gql.apiruntime.com/v1/graphql"
GLEAP_API_KEY="<your-gleap-api-key>"
EDITOR_KEY="<your-froala-editor-key>"
```

---

## 📜 Available Scripts

### Development

```bash
# Start dev server with hot-reload
quasar dev
# or
npm run dev
```

### Production Build

```bash
# Build for production (SPA)
quasar build
# or
npm run build
```

### Code Quality

```bash
# Lint files
npm run lint
# or
yarn lint

# Format files
yarn format
```

### Desktop (Electron)

```bash
# Dev mode
quasar dev -m electron

# Production build
quasar build -m electron
```

### Mobile (Capacitor)

```bash
# Dev mode (iOS/Android)
quasar dev -m capacitor -T ios
quasar dev -m capacitor -T android

# Production build
quasar build -m capacitor -T ios
quasar build -m capacitor -T android
```

---

## 🔧 Configuration

- **Quasar Config** — See [`quasar.config.js`](quasar.config.js) for build, boot plugins, and framework settings.
- **Quasar Docs** — [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js)

---

## 📄 License

Private — All rights reserved.
