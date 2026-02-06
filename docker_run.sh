docker stop bott
docker rm bott
docker run --name bott --restart always --privileged -it -d -e TZ="Europe/Moscow" -v /root/bott:/opt/app -w /opt/app debian:latest /bin/bash -C "apt update && apt install -y ts-node npm"
docker logs -f bott
