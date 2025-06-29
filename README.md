# POLISH - Petrophysical Operations for Log Intelligence, Smoothing and Harmonization

A production-grade, enterprise-level petrophysical data preprocessing platform designed to transform raw LAS (Log ASCII Standard) files into pristine, analysis-ready datasets.

## 🚀 Features

- **Advanced Signal Processing**: Savitzky-Golay filtering, Hampel spike detection, wavelet denoising
- **Multi-Track Visualization**: Professional well log display with 8+ chart types
- **Dynamic Depth Control**: Real-time depth range and sampling adjustment
- **Multi-Well Analysis**: Comparative analysis across up to 4 wells simultaneously
- **Quality Control**: Comprehensive QC dashboard with statistical analysis
- **Format Conversion**: Support for CSV, Excel, JSON, ASCII, WITSML, SEG-Y
- **Monetization**: Secure payment processing with Stripe integration
- **Enterprise Security**: End-to-end encryption, secure file handling, audit trails

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Recharts & Plotly.js** for visualization
- **Lucide React** for icons
- **D3.js** for advanced charting

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** with Prisma ORM
- **Redis** for caching and job queues
- **Bull** for background job processing

### Infrastructure
- **Docker** containerization
- **NGINX** for reverse proxy
- **AWS/GCP** cloud deployment ready

## 📦 Installation

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 6+

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/traceseis/polish.git
   cd polish
   ```

2. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp .env.example .env
   cp server/.env.example server/.env
   
   # Edit the files with your configuration
   nano .env
   nano server/.env
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Manual Installation

1. **Install frontend dependencies**
   ```bash
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Set up the database**
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd server
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_MAX_FILE_SIZE=104857600
```

#### Backend (server/.env)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/polish
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_key_here
```

## 📊 Usage

### 1. Upload LAS Files
- Drag and drop LAS files (up to 100MB)
- Supported formats: LAS v1.2, v2.0, v3.0
- All processing happens locally in your browser

### 2. Configure Processing
- **Denoising**: Reduce noise while preserving geological features
- **Spike Detection**: Identify and remove data outliers
- **Physical Validation**: Check values against industry standards
- **Mnemonic Standardization**: Convert to API or CWLS standards

### 3. Visualize Results
- **Multi-Track Display**: Professional well log layout
- **Line Charts**: Time series visualization
- **Scatter Plots**: Cross-plot analysis
- **Histograms**: Data distribution analysis
- **Correlation Matrix**: Statistical relationships

### 4. Export Processed Data
- **Free Features**: All processing, visualization, and QC analysis
- **Premium Export**: Cleaned LAS files with processing certificates ($400)
- **Format Conversion**: CSV, Excel, JSON, WITSML, SEG-Y

## 🔒 Security

POLISH implements comprehensive security measures:

- **Client-Side Processing**: No file uploads during processing
- **End-to-End Encryption**: AES-256 encryption for sensitive data
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data validation
- **Audit Logging**: Complete processing audit trails

## 📈 Performance

- **File Size**: Up to 100MB LAS files
- **Processing Time**: 3-120 seconds depending on file size
- **Memory Usage**: Optimized for large datasets
- **Concurrent Users**: Supports multiple simultaneous users
- **Scalability**: Horizontal scaling ready

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server
npm test

# Run integration tests
npm run test:integration
```

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   # Frontend
   npm run build
   
   # Backend
   cd server
   npm run build
   ```

2. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Set up SSL certificates**
   ```bash
   # Configure SSL in nginx.conf
   # Add certificates to ssl/ directory
   ```

### Cloud Deployment

#### AWS
- Use AWS ECS for container orchestration
- RDS for PostgreSQL
- ElastiCache for Redis
- CloudFront for CDN

#### Google Cloud
- Use Google Cloud Run for serverless deployment
- Cloud SQL for PostgreSQL
- Memorystore for Redis
- Cloud CDN for content delivery

## 📚 Documentation

- [Technical Documentation](./docs/TECHNICAL_DOCUMENTATION.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Security Architecture](./docs/SECURITY_ARCHITECTURE.md)
- [API Reference](./docs/API_REFERENCE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@traceseis.com
- **Phone**: (713) 890-9249
- **Documentation**: https://docs.polish.com
- **Issues**: [GitHub Issues](https://github.com/traceseis/polish/issues)

## 🏢 About

POLISH is developed by **TraceSeis, Inc.** - a leading provider of petrophysical data analysis solutions for the oil and gas industry.

---

**Version**: 1.1.0  
**Last Updated**: December 2024
