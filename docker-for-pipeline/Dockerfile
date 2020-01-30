FROM node:10-alpine
RUN apk update

LABEL maintainer="Simone Zennaro <dottorsaimon@gmail.com>"

RUN apk -Uuv add groff less python py-pip
RUN pip install awscli
RUN apk --purge -v del py-pip
RUN npm install serverless -g
RUN rm /var/cache/apk/*