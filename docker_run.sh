docker stop bott
docker rm bott
docker run -it --name bott --restart always --privileged -e TZ="Europe/Moscow" -v /root/bott:/opt/app -w /opt/app bott:latest /bin/bash #-c "npm install -D && npm run dev"
#docker logs -f bott
