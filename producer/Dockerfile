# Stage 1: Build Node.js 18
FROM node:18 

# Set the working directory
WORKDIR /app

# Copy your Node.js application code into the container
COPY . .

# Build your Node.js application (if needed)
RUN npm install

CMD ["node", "producer.js"]
