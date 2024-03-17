import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGameFindById } from "@hooks/games";
import { GameCard } from "./Card";
import { Box, Center, SegmentedControl, Space } from "@mantine/core";
import { IconBook, IconDeviceGamepad, IconList, IconVideo } from "@tabler/icons-react";
import { useBrowser } from "@hooks/browser";
import { GameMatches } from "./Matches";

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
            <Box ml={10}>Score</Box>
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
    const [section, setSection] = useState('matches');
    
    const game = useGameFindById(id);

    return (
        <>
            <div>
                {game && game.data &&
                    <GameCard 
                        game={game.data} 
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

                {section === 'matches' &&
                    <GameMatches game={game.data} />
                }

                {section === 'score' &&
                    <div>Score</div>
                }

                {section === 'demo' &&
                    <div>Demo</div>
                }

                {section === 'about' &&
                    <div>About</div>
                }
            </div>
        </>
    );
};