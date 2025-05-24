FROM node:23-alpine

WORKDIR /root

COPY *.js package* entrypoint.sh ./
ENV DATA_DIR=/root/data
ENV PORT=1234

RUN apk add --no-cache python3 build-base && \
    apk update && \
    npm install

EXPOSE 1234
EXPOSE 4000

CMD ["./entrypoint.sh"]
