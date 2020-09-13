FROM node:lts-alpine
EXPOSE 4000


# Create app directory

# Copy package.json and package-lock.json using a wildcard
COPY package*.json ./
# Install app dependencies
RUN npm install
# Bundle app source
COPY . ./

CMD ["npm", "start"]