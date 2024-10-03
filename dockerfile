FROM node

# RUN apt-get update
# RUN apt install npm -y

RUN mkdir /usr/contactPro
WORKDIR /usr/contactPro

RUN apt-get update && apt install git

#COPY package.json .
#COPY package-lock.json* .

RUN git clone https://github.com/joshuadstahl/Contact-Pro.git /usr/contactPro
COPY .env.local .
# RUN npm update
RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm","run","start"]