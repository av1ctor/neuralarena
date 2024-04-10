#!/bin/bash

 CYCLES_WALLET_CANISTER_ID=tgrk2-tyaaa-aaaan-qajoa-cai
 AMOUNT=$1
 
 dfx ledger top-up --ic --identity deployer --amount $AMOUNT $CYCLES_WALLET_CANISTER_ID