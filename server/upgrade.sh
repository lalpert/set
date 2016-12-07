#!/bin/bash
git pull
sudo docker rm -f set-ws
IMG=`docker build --no-cache -t set . | tail -n 1 | awk 'NF>1{print $NF}'`
echo "IMG: $IMG"
sudo docker run --publish 443:8080 --name set-ws -d $IMG
