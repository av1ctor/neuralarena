#!/bin/bash

dfx canister --identity deployer --network ic call neuralarena_be user_create_staff "(
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
