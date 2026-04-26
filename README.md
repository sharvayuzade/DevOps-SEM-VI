docker --version
# check docker installed or not

cd path\to\your\website
# go to project folder

docker build -t demo-website .
# build image from Dockerfile

docker run -d -p 8080:80 --name mywebsite demo-website
# run container (background, port mapping, name)

docker ps
# show running containers

docker stop mywebsite
# stop container

docker start mywebsite
# start container again

docker rm -f mywebsite
# remove container (force)

docker rmi demo-website
# remove image
