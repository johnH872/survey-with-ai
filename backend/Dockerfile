# Build stage
FROM node:22-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Copy environment file
COPY .env ./

ENV NODE_ENV=production

# Expose port 3001
EXPOSE 3001

# Start the app with migrations
CMD ["sh", "-c", "npm run migration:run && npm run start:prod"] 