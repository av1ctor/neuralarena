import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGameFindById } from "@hooks/games";
import { Box, Center, SegmentedControl, Space } from "@mantine/core";
import { IconBook, IconDeviceGamepad, IconGlobe, IconList, IconVideo } from "@tabler/icons-react";
import { useBrowser } from "@hooks/browser";
import { GameMatches } from "./Matches";
import { useUI } from "@hooks/ui";
import { GameLeaderboard } from "./Leaderboard";
import { GameMaps } from "./Maps";
import { GameBanner } from "./Banner";
import { GameAbout } from "./About";
import { Principal } from "@dfinity/principal";

const sections = [
    {
        value: 'matches',
        label: (
          <Center>
            <IconDeviceGamepad size="1rem" />
            <Box ml={10}>Matches</Box>
          </Center>
        ),
    },
    {
        value: 'score',
        label: (
          <Center>
            <IconList size="1rem" />
            <Box ml={10}>Leaderboard</Box>
          </Center>
        ),
    },
    {
        value: 'maps',
        label: (
          <Center>
            <IconGlobe size="1rem" />
            <Box ml={10}>Maps</Box>
          </Center>
        ),
    },
    {
        value: 'demo',
        label: (
          <Center>
            <IconVideo size="1rem" />
            <Box ml={10}>Demo</Box>
          </Center>
        ),
    },
    {
        value: 'about',
        label: (
          <Center>
            <IconBook size="1rem" />
            <Box ml={10}>About</Box>
          </Center>
        ),
    },
];

interface Props {
}

export const Game = (props: Props) => {
    const {id} = useParams();
    const {isMobile} = useBrowser();
    const {classes} = useUI();
    const [section, setSection] = useState('matches');
    
    const game = useGameFindById(id? Principal.fromText(id): undefined);

    return (
        <>
            <div>
                {game && game.data &&
                    <GameBanner
                        game={game.data} 
                        isHalf
                    />
                }
            </div>
            <Space h="xl" />
            <div>
                <SegmentedControl 
                    orientation={isMobile? "vertical": "horizontal"}
                    fullWidth
                    color="magenta"
                    data={sections}
                    value={section}
                    onChange={setSection}
                />
                
                <Space h="xl" />

                <Box className={section === 'matches'? classes.block: classes.none}>
                    <GameMatches game={game.data} />
                </Box>

                <Box className={section === 'score'? classes.block: classes.none}>
                    <GameLeaderboard
                        id={game.data?.id}
                    />
                </Box>

                <Box className={section === 'maps'? classes.block: classes.none}>
                    <GameMaps
                        game={game.data}
                    />
                </Box>

                <Box className={section === 'demo'? classes.block: classes.none}>
                    Demo
                </Box>

                <Box className={section === 'about'? classes.block: classes.none}>
                    <GameAbout
                        game={game.data}
                    />
                </Box>
            </div>
        </>
    );
};