import React, {createContext, useReducer} from 'react';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';

export interface FontState {
    fonts: Map<string, Font>;
};

export enum FontActionType {
    SET_FONTS,
};

interface Action {
    type: FontActionType;
    payload: any;
};

const initialState: FontState = {
    fonts: new Map(),
};

export const FontsContext = createContext<[FontState, (action: Action) => void]>(
    [initialState, (action: Action) => {}]);

const reducer = (state: FontState, action: Action): FontState => {
    switch(action.type) {
        case FontActionType.SET_FONTS:
            return {
                fonts: action.payload
            };

        default:
            return state;
    }
};

interface Props {
    fonts: Map<string, Font>;
    children: any;
};

export const FontsContextProvider = (props: Props) => {
    const [state, dispatch] = useReducer(
        reducer,
        {
            ...initialState, 
            fonts: props.fonts
        }
    );

	return (
		<FontsContext.Provider 
			value={[state, dispatch]}>
			{props.children}
		</FontsContext.Provider>
	);
}
