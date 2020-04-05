FROM node:10

RUN mkdir -p /home/node/app/node_modules /home/node/app/public /home/node/app/uploads && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json /home/node/app
RUN npm install
COPY . /home/node/app
USER node
EXPOSE 3000
CMD [ "npm", "run", "server" ]