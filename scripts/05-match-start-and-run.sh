#!/bin/bash

MATCH_ID=$1

dfx canister call neuralarena_be match_start "(\"$MATCH_ID\")"
dfx canister call neuralarena_be match_run "(\"$MATCH_ID\")"


