import { useEffect, useState } from "react";

export default function useDelayedClassToggler([on, off] : string[], state: boolean, delayOn:number = 200, delayOff:number = 500) {

    const [shouldRender, setShouldRender] = useState(false);
    const [currentClass, setCurrentClass] = useState(state ? on : off);
    
    useEffect(() => {
        let timeoutId: number;
        let timeoutId2: number;
        if (state && !shouldRender) {
            setShouldRender(true);
            setCurrentClass(off);
            timeoutId2 = window.setTimeout(
                () => setCurrentClass(on), 
                delayOn
            );
        }
        else if(!state && shouldRender) {
            setCurrentClass(off);
            timeoutId = window.setTimeout(
                () => setShouldRender(false), 
                delayOff
            );
        }
        return () => {
            clearTimeout(timeoutId)
        };
    }, [state, delayOn, delayOff, shouldRender, on, off]);

    return [shouldRender, currentClass];
}