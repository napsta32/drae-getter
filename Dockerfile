FROM mcr.microsoft.com/playwright:v1.40.1-jammy

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npx playwright install
RUN npm install

COPY ./ .
