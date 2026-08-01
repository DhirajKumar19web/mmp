project/
│
├── package.json                 # Project metadata & scripts
├── package-lock.json            # Dependency lock file
│
├── tsconfig.json                # Development TypeScript config
├── tsconfig.build.json          # Production build config
│
├── eslint.config.js             # ESLint configuration
├── prettier.config.js           # Prettier configuration
├── .prettierrc                  # Prettier rules (optional)
├── .editorconfig                # Editor consistency
│
├── .gitignore                   # Git ignored files
├── .gitattributes               # Git file settings
│
├── .env                         # Local environment variables
├── .env.example                 # Example environment variables
├── .env.development             # Development environment
├── .env.production              # Production environment
├── .env.test                    # Test environment
│
├── jest.config.ts               # Jest configuration
│
├── swagger.yaml                 # API documentation
│
├── ecosystem.config.js          # PM2 configuration (optional)
│
├── README.md                    # Project documentation
├── CHANGELOG.md                 # Version history (optional)
├── LICENSE                      # License (optional)
│
├── .vscode/
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
│
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI
│
├── .husky/                      # Git hooks (if using Husky)
│
├── lint-staged.config.js        # Lint staged files
└── commitlint.config.js         # Commit message validation