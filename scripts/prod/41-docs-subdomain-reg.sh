#!/bin/bash

CUSTOM_DOMAIN=docs.neuralarena.ai

curl -sLv -X POST \
    -H 'Content-Type: application/json' \
    https://icp0.io/registrations \
    --data @- <<EOF
{
    "name": "$CUSTOM_DOMAIN"
}
EOF
