import {StoicIdentity} from "ic-stoic-identity";
import { ICProvider } from "@interfaces/icprovider";
import { Result } from "@interfaces/result";
import { Principal } from "@dfinity/principal";
import { buildAgentJsOptions, createActor } from "@libs/icp";
import { IDL } from "@dfinity/candid";

const transferErrorToText = (
    err: any /* TransferError */
): string => {

    if('TxTooOld' in err) {
        return 'Transaction too old';
    }
    else if('BadFee' in err) {
        return `Bad fee: expected ${err.BadFee.expected_fee.e8s.toString()}`;
    }
    else if('TxDuplicate' in err) {
        return `Transaction duplicated at block ${err.TxDuplicate.duplicate_of}`;
    }
    else if('TxCreatedInFuture' in err) {
        return 'Bad date';
    }
    else if('InsufficientFunds' in err) {
        return `Insufficient funds: ${err.InsufficientFunds.balance.e8s.toString()}`
    }

    return 'Unknown';
};

class StoicProvider implements ICProvider {
    identity?: StoicIdentity;
    
    public async initialize(
    ): Promise<boolean> {
        return true;
    }

    public async connect(
        options?: any
    ): Promise<Result<any, string>> {
        try {
            this.identity = await StoicIdentity.load();
        }
        catch(e: any) {
            return {Err: e.toString()};
        }

        return {Ok: null}
    } 

    public async isAuthenticated(
    ): Promise<boolean> {
        return !!this.identity;
    }

    public async createActor(
        id: string,
        idl: IDL.InterfaceFactory
    ): Promise<any> {
        return createActor(
            id, 
            idl, 
            {
                agentOptions: buildAgentJsOptions(this.identity)
            }
        );
    }

    public getPrincipal(
    ): Principal | undefined {
        return this.identity?.getPrincipal();
    }

    public async login(
    ): Promise<Result<any, string>> {
        try {
            this.identity = await StoicIdentity.connect();
            if(!this.identity) {
                return {Err: 'Login failed, no identity return'};
            }
        }
        catch(e: any) {
            return {Err: e.toString()};
        }

        return {Ok: null};
    }

    public async transferICP(
        to: Array<number>,
        amount: bigint,
        memo: bigint,
    ): Promise<Result<bigint, string>> {
        return {Err: 'Ledger undefined'};
    }

    public async logout(
    ): Promise<void> {
        StoicIdentity.disconnect();
    }
};


export default StoicProvider;