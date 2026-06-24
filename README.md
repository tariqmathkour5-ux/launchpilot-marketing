# LaunchPilot AI - AI Tools Discovery Platform

A comprehensive platform for discovering, comparing, and managing artificial intelligence tools and services. Built with Next.js, React, Express, tRPC, PostgreSQL/MySQL, and Tailwind CSS.

## Features

- **Comprehensive AI Tools Database**: Curated collection of verified AI tools with detailed information
- **Smart Categorization**: Browse tools by category with filtering and search capabilities
- **Content Management**: Blog posts and articles about AI trends and tool guides
- **Data Import/Export**: CSV and JSON import/export for bulk operations
- **Contact Management**: Integrated contact form for user inquiries
- **Responsive Design**: Mobile-first design with full responsive support
- **Type-Safe API**: End-to-end type safety with tRPC and TypeScript

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui components
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **Validation**: Zod schemas
- **Testing**: Vitest

## Project Structure

```
launchpilot-ai/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Main app router
│   └── index.html
├── server/                # Backend Express server
│   ├── routers.ts         # tRPC router definitions
│   ├── db.ts              # Database query helpers
│   ├── import-export.ts   # Data import/export logic
│   └── _core/             # Core server infrastructure
├── drizzle/               # Database schema and migrations
│   ├── schema.ts          # Drizzle ORM schema definitions
│   └── migrations/        # SQL migration files
├── shared/                # Shared types and constants
└── package.json
```

## Database Schema

### Users Table
- `id`: Primary key
- `openId`: Manus OAuth identifier (unique)
- `name`: User name
- `email`: User email
- `role`: 'user' | 'admin'
- `timestamps`: createdAt, updatedAt, lastSignedIn

### Categories Table
- `id`: Primary key
- `name`: Category name (unique)
- `slug`: URL-friendly slug (unique)
- `description`: Category description
- `icon`: Icon identifier
- `color`: Hex color code
- `displayOrder`: Sort order
- `isActive`: Active status

### Tools Table
- `id`: Primary key
- `name`: Tool name
- `slug`: URL-friendly slug (unique)
- `description`: Short description
- `longDescription`: Detailed description
- `website`: Tool website URL
- `logo`: Logo URL
- `categoryId`: Foreign key to categories
- `pricingModel`: 'free' | 'freemium' | 'paid' | 'enterprise' | 'open_source'
- `tags`: JSON array of tags
- `isVerified`: Verification status
- `rating`: Decimal rating (0-5)
- `reviewCount`: Number of reviews
- `monthlyUsers`: Estimated monthly users
- `features`: JSON array of features
- `integrations`: JSON array of integrations
- `apiAvailable`: API availability
- `freeTrialDays`: Free trial duration
- `timestamps`: createdAt, updatedAt

### Blog Posts Table
- `id`: Primary key
- `title`: Post title
- `slug`: URL-friendly slug (unique)
- `excerpt`: Short excerpt
- `content`: Full content
- `featuredImage`: Featured image URL
- `authorId`: Author user ID
- `tags`: JSON array of tags
- `status`: 'draft' | 'published' | 'archived'
- `publishedAt`: Publication timestamp
- `viewCount`: View counter
- `timestamps`: createdAt, updatedAt

### Contact Messages Table
- `id`: Primary key
- `name`: Sender name
- `email`: Sender email
- `subject`: Message subject
- `message`: Message content
- `status`: 'new' | 'read' | 'replied' | 'archived'
- `isSpam`: Spam flag
- `timestamps`: createdAt, updatedAt

## API Routes

### Categories
- `GET /trpc/categories.list` - List all active categories
- `GET /trpc/categories.bySlug` - Get category by slug

### Tools
- `GET /trpc/tools.list` - List verified tools (with optional limit)
- `GET /trpc/tools.byCategory` - Get tools by category ID
- `GET /trpc/tools.bySlug` - Get tool by slug
- `POST /trpc/tools.create` - Create new tool (protected)

### Blog
- `GET /trpc/blog.list` - List published blog posts (with optional limit)
- `GET /trpc/blog.bySlug` - Get blog post by slug

### Contact
- `POST /trpc/contact.submit` - Submit contact form
- `GET /trpc/contact.list` - List contact messages (protected)

### Import/Export
- `POST /trpc/importExport.importToolsCSV` - Import tools from CSV (protected)
- `POST /trpc/importExport.importToolsJSON` - Import tools from JSON (protected)
- `GET /trpc/importExport.exportToolsCSV` - Export tools as CSV (protected)
- `GET /trpc/importExport.exportCategoriesCSV` - Export categories as CSV (protected)
- `GET /trpc/importExport.exportBlogPostsCSV` - Export blog posts as CSV (protected)
- `GET /trpc/importExport.exportAllJSON` - Export all data as JSON (protected)

## Pages

- **Home** (`/`) - Landing page with hero section and feature overview
- **Categories** (`/categories`) - Browse AI tool categories
- **Database** (`/database`) - Comprehensive tools database with filtering
- **Blog** (`/blog`) - Articles and guides about AI tools
- **About** (`/about`) - Company information and mission
- **Contact** (`/contact`) - Contact form and information

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL/TiDB database

### Installation

1. Clone the repository
```bash
git clone https://github.com/tariqmathkour5-ux/launchpilot-ai.git
cd launchpilot-ai
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
# Copy .env.example to .env and configure
cp .env.example .env
```

4. Run database migrations
```bash
pnpm db:push
```

5. Start development server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
pnpm start
```

### Code Quality
```bash
pnpm format
pnpm check
```

## Data Import/Export

### Import Tools from CSV
```bash
# CSV format: name,slug,description,website,categoryId,pricingModel,tags,features,integrations
curl -X POST http://localhost:3000/api/trpc/importExport.importToolsCSV \
  -H "Content-Type: application/json" \
  -d '{"csvData":"name,slug,...\nTool1,tool-1,..."}'
```

### Export Tools as CSV
```bash
curl http://localhost:3000/api/trpc/importExport.exportToolsCSV
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch
2. Make your changes
3. Write tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please:
- Open an issue on GitHub
- Contact us at contact@launchpilot.ai
- Visit our website at https://launchpilot.ai

## Roadmap

- [ ] Advanced search and filtering
- [ ] User ratings and reviews
- [ ] Tool comparison feature
- [ ] Newsletter subscription
- [ ] Social sharing
- [ ] API access for third-party integrations
- [ ] Mobile app
- [ ] Multi-language support

---

**LaunchPilot AI** - Empowering discovery in the AI tools ecosystem
