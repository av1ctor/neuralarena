import { 
    UseQueryResult, useMutation, useQuery, useQueryClient 
} from "react-query";
import { icrc1GetBalance, icrc1Transfer } from "@libs/icrc1";
import { 
    TransferArg, _SERVICE as Icr1Actor 
} from "@declarations/icp_ledger_canister/icp_ledger_canister.did";

interface Icrc1Methods {
    transfer: (req: TransferArg) => Promise<bigint>;
}

export const useIcrc1 = (
    ledger: Icr1Actor
): Icrc1Methods => {
    const queryClient = useQueryClient();

    const transferMut = useMutation(
        async (options: {req: TransferArg}) => {
            return icrc1Transfer(ledger, options.req);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['icrc1-balance']);
            }   
        }
    );

    const transfer = (
        req: TransferArg
    ): Promise<bigint> => {
        return transferMut.mutateAsync({req});
    };

    return {
        transfer,
    }
};

export const useIcrc1GetBallance = (
    ledger: Icr1Actor,
    account: Uint8Array|undefined
): UseQueryResult<bigint, Error> => {
    return useQuery<bigint, Error>(
        ['icrc1-balance', account],
        () => icrc1GetBalance(ledger, account)
    );
}; 

