#!/bin/bash

TO_PRINCIPAL=$1
AMOUNT=100000000000

dfx canister --identity default call icp_ledger_canister icrc1_transfer "
  (record {
    to= record {owner= principal \"$TO_PRINCIPAL\"};
    amount= $AMOUNT;
  })
"