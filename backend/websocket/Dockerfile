FROM node:23-alpine

WORKDIR /root

COPY server.js package* ./
ENV DATA_DIR=/root/data
ENV PORT=1234

RUN apk add --no-cache python3 && \
    apk update && \
    npm install

EXPOSE 1234

CMD ["node", "server.js"]
