#!/bin/bash

dfx identity use deployer
dfx canister call neuralarena_be user_create_staff "(record {kind=variant {Staff=record {role=variant {Admin};}}; name=null; nick=\"Admin\"; email=null})"

dfx identity use default
NICK="PlayerOne"
dfx canister call neuralarena_be user_create_player "(record {kind=variant {Player=record {}}; name=null; nick=\"$NICK\"; email=null})"


