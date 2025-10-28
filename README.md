# SX Tools

A modern Next.js application for data processing and management with powerful productivity tools.

## Features

- **Dark Mode**: Built-in dark theme with toggle support
- **Responsive Layout**: Sidebar navigation with navbar and footer
- **Tab System**: Browser-like tabs for seamless multi-tasking
  - Open multiple tools simultaneously
  - Switch between tabs without losing data
  - Close individual tabs
  - State preservation when switching tabs
- **Domain Listing**: Extract and organize domains from your data lists
  - Multiple input methods: Paste, File Import, Drag & Drop
  - Support for text files (.txt) only
  - Parse URLs with credentials
  - Remove duplicates automatically
  - Group by domain/subdomain
  - Display count for each domain
  - Copy URLs by domain group
  - Visual feedback for drag & drop
- **Easy Copy**: Quick access and copy utilities for credentials
  - Flexible format support: `url:user:pass` or `user:pass:url`
  - Multiple delimiter support: `:` (colon) or `|` (pipe)
  - Smart URL detection (domains, IPs, ports, paths)
  - Email detection as username (supports `user@email.com`)
  - One-click copy for username:password, username only, or password only
  - Clickable links that open in new tabs with full paths
  - Plain text password display for easy viewing
  - Import from text files or drag & drop
  - Global parser utility for consistent data processing

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sxtools
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Tab System

- Click any menu item in the sidebar to open it in a new tab
- Click on tabs to switch between them
- Your work is automatically preserved when switching tabs
- Click the X button on a tab to close it
- The Home tab opens automatically when the app starts

### Domain Listing

1. Click "Domain Listing" from the sidebar (opens in a new tab)
2. Add your data list using one of these methods:
   - **Paste**: Directly paste your list in the textarea
   - **Import File**: Click "Import File" button and select a .txt file
   - **Drag & Drop**: Drag a .txt file directly onto the textarea
3. Click "Process" to extract and organize domains
4. View organized domains with counts in cards
5. Click "Copy URLs" on any card to copy all URLs for that domain
6. Switch to other tabs and come back - your data stays intact!

**Supported Import Formats:**
- Text files only (.txt)
- Each line should contain: `URL:username:password`
- Lines starting with `@` are also supported

### Easy Copy

1. Click "Easy Copy" from the sidebar (opens in a new tab)
2. Add your data list (paste, import, or drag & drop)
3. Click "Process" to parse credentials
4. For each entry, you can:
   - **Click the URL** to open it in a new tab
   - **Copy User:Pass** - Copy both username and password
   - **Copy User** - Copy username only
   - **Copy Pass** - Copy password only
5. View masked password preview for security

**Supported Formats:**
- `url:user:pass` - Standard format
- `user:pass:url` - Reversed format
- `url|user|pass` - Pipe delimiter
- `user|pass|url` - Pipe delimiter reversed
- URLs with/without protocol, ports, and paths
- IP addresses with/without ports
- Email addresses as username (e.g., `user@email.com`)

**URL Format Examples:**
- `https://domain.com:user:pass`
- `https://domain.com/login/:user@email.com:password`
- `http://domain.com:8080:admin:secret`
- `192.168.1.1:user:pass`
- `domain.com:9000/path:user:pass`
- `user@email.com:pass123:https://domain.com/login`
- `https://domain.com|username@gmail.com|password` (pipe delimiter)
- `admin|secret123|http://10.0.0.1` (pipe delimiter)

### Sample Input Format

```
# Standard format with email as username
@https://www.thestar.com/users/login/:aussieiloveau@gmail.com:Aussie@2022
https://sso.thestar.com.my/:marianeez@gmail.com:Khalif2205*
https://id.thestar.co.uk/id:c.horton22@hotmail.com:Andrea2009

# Standard format with regular username
https://app.pdamkotasmg.co.id/portalpegawai/:690820406:jwhhtc
https://app.pdamkotasmg.co.id/portalpegawai/:6908219023:q1w2e3r4t5
http://pdamkotasmg.co.id:merdeka-pdam:s4y4t1d4kt4hu
https://gateway.pdamkotasmg.co.id:6908214008:6908214008

# Reversed format (user:pass:url)
aussieiloveau@gmail.com:Aussie@2022:https://www.thestar.com/users/login/
user123:pass456:http://example.com
admin@company.com:SecretPass123:https://admin.company.com:8080/dashboard
```

## Project Structure

```
sxtools/
├── app/                      # Next.js app directory
│   ├── domain-listing/      # Domain listing page
│   ├── easy-copy/           # Easy copy page (coming soon)
│   ├── list-format/         # List format page (coming soon)
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── app-sidebar.tsx      # Sidebar navigation
│   ├── app-content.tsx      # Main content wrapper
│   ├── navbar.tsx           # Top navigation bar
│   ├── footer.tsx           # Footer component
│   ├── tab-bar.tsx          # Tab bar component
│   ├── tab-content.tsx      # Tab content renderer
│   ├── theme-provider.tsx   # Theme provider
│   └── theme-toggle.tsx     # Theme toggle button
├── contexts/                # React contexts
│   └── tab-context.tsx      # Tab state management
├── lib/                     # Utility functions
└── hooks/                   # Custom hooks
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Roadmap

- [x] Easy Copy utility
- [ ] List Format utility
- [ ] Export to various formats
- [ ] Batch processing
- [ ] History/saved lists
- [ ] Password strength indicator
- [ ] Bulk copy all credentials

## License

MIT

## Author

Created with ❤️ for productivity and data management
