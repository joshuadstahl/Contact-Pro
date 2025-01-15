import { useEffect } from "react";

export default function FormSub({action}: {action: () => void})  {
    useEffect(() => {
        let el = document.getElementById('formsub' + action.name) as HTMLFormElement;
        if (el) el.requestSubmit();
    })

    return (
        <form className="hidden" id={"formsub" + action.name} action={action}>
        </form>
    )
}