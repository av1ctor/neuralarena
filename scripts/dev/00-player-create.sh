#!/bin/bash

NICK="PlayerOne"

dfx canister call neuralarena_be user_create_player "(record {kind=variant {Player=record {}}; name=null; nick=\"$NICK\"; email=null})"


