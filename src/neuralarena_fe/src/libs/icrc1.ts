import { 
    Account, TransferArg, _SERVICE as Icrc1Actor 
} from "@declarations/icp_ledger_canister/icp_ledger_canister.did";
import { Principal } from "@dfinity/principal";
import { 
    accountIdentifierFromBytes, 
    principalToAccountDefaultId, 
    principalToAccountId,
    principalToSubAccount
} from "./icp";

export const TRANSFER_FEE: bigint = 10_000n;

export const icrc1GetDefaultAccount = (
    owner: Principal|undefined
): Account => {
    return {
        owner: owner ?? Principal.anonymous(),
        subaccount: [principalToAccountDefaultId(owner)]
    };
}

export const icrc1GetAccount = (
    owner: Principal|undefined,
    subaccount: Uint8Array|Principal,
): Account => {
    const sub = Array.isArray(subaccount)? 
        subaccount:
        principalToSubAccount(subaccount as Principal);
    
    return {
        owner: owner ?? Principal.anonymous(),
        subaccount: [sub]
    };
}

export const icrc1GetDefaultAccountId = (
    principal: Principal|undefined
): string => {
    const subAccount = principalToAccountDefaultId(principal);
    
    return accountIdentifierFromBytes(subAccount);
}

export const icrc1GetAccountId = (
    principal: Principal|undefined,
    subaccount: Uint8Array|undefined
): string => {
    const account = principalToAccountId(principal, subaccount);
    
    return accountIdentifierFromBytes(account);
}

export const icrc1GetBalance = async (
    ledger: Icrc1Actor,
    account: Uint8Array|undefined
): Promise<bigint> => {
    if(!account) {
        return 0n;
    }
    const res = await ledger.account_balance({
        account
    });
    return res.e8s;
};

export const icrc1Transfer = async (
    ledger: Icrc1Actor,
    req: TransferArg
): Promise<bigint> => {
    const res = await ledger.icrc1_transfer({
        ...req,
        created_at_time: [BigInt(Date.now()) * 1_000_000n],
    });

    if('Err' in res) {
        throw new Error(errorToText(res.Err));
    }
    
    return res.Ok;
};

const errorToText = (
    err: any
): string => {

    if('TooOld' in err) {
        return 'Transaction too old';
    }
    else if('CreatedInFuture' in err) {
        return 'Bad date';
    }
    else if('BadFee' in err) {
        return `Bad fee: expected ${err.BadFee.expected_fee.toString()}`;
    }
    else if('Duplicate' in err) {
        return `Transaction duplicated at block ${err.Duplicate.duplicate_of.toString()}`;
    }
    else if('InsufficientFunds' in err) {
        return `Insufficient funds: ${err.InsufficientFunds.balance.toString()}`
    }
    else if('InsufficientAllowance' in err) {
        return `Insufficient allowance: ${err.InsufficientAllowance.allowance.toString()}`
    }
    else if('Expired' in err) {
        return `Expired: ${err.Expired.ledger_time.toString()}`
    }
    else if('TemporarilyUnavailable' in err) {
        return 'Temporarily unavailable';
    }
    else if('AllowanceChanged' in err) {
        return `Allowance changed: ${err.AllowanceChanged.current_allowance.toString()}`;
    }
    else if('GenericError' in err) {
        return `Generic error: ${err.GenericError.message}`;
    }

    return 'Unknown';
};
