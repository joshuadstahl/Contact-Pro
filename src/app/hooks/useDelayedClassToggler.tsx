import { useEffect, useState } from "react";

export default function useDelayedClassToggler([on, off] : string[], state: boolean, delay:number) {

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
                delay
            );
        }
        else if(!state && shouldRender) {
            setCurrentClass(off);
            timeoutId = window.setTimeout(
                () => setShouldRender(false), 
                delay
            );
        }
        return () => {
            clearTimeout(timeoutId)
        };
    }, [state, delay, shouldRender, on, off]);

    return [shouldRender, currentClass];
}