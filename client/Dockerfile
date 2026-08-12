#Stage1: Build the react app
FROM node:22-alpine AS builder

#Create client-build directory
WORKDIR /client

#Copy package json files
COPY *.json ./

#clear installs all modules
RUN npm ci

#Copy and build rest of the files
COPY . .
RUN npm run build

#Stage 2: Serve the build application using nginx proxy

FROM nginx:1.31.3-alpine

#Copy default config file to serve static files
COPY /nginx/default.conf  /etc/nginx/conf.d/default.conf

#Copy build files
COPY --from=builder /client/dist /usr/share/nginx/html

EXPOSE 8000





