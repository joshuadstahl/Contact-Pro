FROM node

# RUN apt-get update
# RUN apt install npm -y

# RUN npm update
RUN npm install -y
RUN npm run build

EXPOSE 80
CMD ["npm","run","start"]