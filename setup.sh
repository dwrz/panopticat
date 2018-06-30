#!/bin/sh

IP=`curl ifconfig.co`

export PANOPTICAT_CAMERA_FLIP=false
export PANOPTICAT_ENV=GLOBAL
export PANOPTICAT_GLOBAL_PORT=8555
export PANOPTICAT_INTERVAL="00 */30 * * * *"
export PANOPTICAT_LOCAL_PORT=3000
export PANOPTICAT_SECRET=
export PANOTPICAT_GLOBAL_IP=$IP