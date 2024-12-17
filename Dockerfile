# Use Node.js LTS version
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set default environment variables
# Note: You should override these when running the container
ENV PORT=8181
ENV NODE_ENV=production
# Sensitive variables like JWT_KEY and WEBHOOK_SECRET should be provided at runtime

# Expose the port
EXPOSE 8181

# Start command
CMD ["npm", "start"]