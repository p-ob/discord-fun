FROM ubuntu:bionic

WORKDIR /usr/src/app

# 1. Install node14
RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs

# 2. Install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt update && apt install yarn -y --no-install-recommends

COPY package.json ./
COPY tsconfig.json /
COPY yarn.lock ./
COPY .env ./
COPY app/ ./app/

RUN yarn install --frozen-lockfile

CMD [ "yarn", "run", "start" ]
