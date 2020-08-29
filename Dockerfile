FROM ubuntu:bionic

# 1. Install node14
RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs

# 2. Install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt update && apt install yarn -y --no-install-recommends

ADD app/ ./app
ADD package.json ./
ADD tsconfig.json /
ADD yarn.lock ./
ADD .env ./

RUN yarn install --frozen-lockfile

ENTRYPOINT [ "yarn", "run", "start" ]
