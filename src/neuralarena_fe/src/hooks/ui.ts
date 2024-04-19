import { useCallback, useContext } from "react";
import { UIActionType, UIContext } from "@stores/ui";
import { notifications } from '@mantine/notifications';
import { createStyles, keyframes } from "@mantine/core";

const useStyles = createStyles((theme) => {
    const animOutline = keyframes({
        'from': {
            outline: '4px solid #ff00ff00',
            outlineOffset: '0rem',
        },
        'to': {
            outline: '4px solid #ff00ff8f',
            outlineOffset: '0.5rem',
        }
    });
    
    return {
        block: {
            display: 'block',
        },
        none: {
            display: 'none',
        },
        animatedOutline: {
            transition: 'outline 2s ease',
            animation: `${animOutline} 4s infinite ease`,
        },
    };
});

interface UIProps {
    isLoading: boolean;
    toggleLoading: (to: boolean) => void;
    showSuccess: (text: string) => void
    showError: (e: any) => void;
    classes: {
        block: string,
        none: string,
        animatedOutline: string,
    };
};

const showError = (e: any) => {
    if(e) {
        const text = typeof e === 'string'? 
            e
        :
            e.constructor === Array?
                e.map((s, i) => `${1+i}. ${s};`) .join('\n')
            :
                typeof e === 'object'?
                    'data' in e?
                        e.data.message
                    :
                        e.message
                :
                    '';
        
        
        notifications.show({
            title: 'Error',
            message: `Error${e.constructor === Array? 's:\n': ': '}${text}`,
            color: 'red',
            autoClose: 5000,
        });
    }
};

const showSuccess = (text: string) => {
    notifications.show({
        title: 'Success',
        message: text,
        color: 'green',
        autoClose: 2500,
    });
}

export const useUI = (): UIProps => {
    const [state, dispatch] = useContext(UIContext);

    const toggleLoading = useCallback((to: boolean) => {
        dispatch({
            type: UIActionType.TOGGLE,
            payload: to
        });
    }, []);

    const {classes} = useStyles();
    
    return {
        isLoading: state.isLoading,
        toggleLoading,
        showSuccess,
        showError,
        classes
    };
};
