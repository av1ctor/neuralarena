#!/bin/bash

dfx canister --identity deployer call neuralarena_be user_create_staff "(
    record {
        kind=variant {
            Staff=record {
                role=variant {Admin};
            }
        }; 
        name=null; 
        nick=\"Admin\"; 
        email=null
    }
)"

NICK="PlayerOne"
dfx canister --identity default call neuralarena_be user_create_player "(
    record {
        kind=variant {
            Player=record {}
        }; 
        name=null; 
        nick=\"$NICK\"; 
        email=null
    }
)"


