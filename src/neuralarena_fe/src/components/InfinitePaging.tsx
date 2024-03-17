import { useUI } from "@hooks/ui";
import { Button, Center } from "@mantine/core";
import React, { ReactElement, useCallback } from "react"
import { UseInfiniteQueryResult } from "react-query"

interface Props<T> {
    query: UseInfiniteQueryResult<T, Error>;
    children: ReactElement | ReactElement[] | undefined;
}

export const InfinitePaging = <T extends any>(
    props: Props<T>
) => {
    const {toggleLoading} = useUI();

    const {query} = props;

    const handleNextPage = useCallback(() => {
        toggleLoading(true);
        query.fetchNextPage();
        toggleLoading(false);
    }, [query]);


    return (
        <>
            {props.children}
            <Center mt="lg">
                <Button
                    disabled={!query.hasNextPage || query.isFetchingNextPage}
                    onClick={handleNextPage}
                >
                    More
                </Button>
            </Center>
        </>
    )
}