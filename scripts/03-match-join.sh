#!/bin/bash

MATCH_ID=$1

dfx canister call main match_join "(\"$MATCH_ID\")"


