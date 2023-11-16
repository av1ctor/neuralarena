#!/bin/bash

MATCH_ID=$1

dfx canister call main match_start "(\"$MATCH_ID\")"
dfx canister call main match_run "(\"$MATCH_ID\")"


