FROM node:10-alpine

LABEL maintainer="xuexb <fe.xiaowu@gmail.com>"

ENV DOCKER true

# Create app directory
WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN npm install -g yarn \
  && yarn install --production \
  && yarn cache clean \
  && npm uninstall -g yarn

COPY . .

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/node.log

EXPOSE 8080
CMD [ "node", "production.js" ]