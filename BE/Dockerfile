
# Use Node.js base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend source code into container
COPY . .

# Run the app from the correct entry file
CMD ["node", "src/index.js"]
