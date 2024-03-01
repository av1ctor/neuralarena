#!/bin/bash

MATCH_ID=$1

dfx canister call neuralarena_be match_join "(\"$MATCH_ID\")"


