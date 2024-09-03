import Image from "next/image";
import { GoogleLogin as gl2 } from "./util/serverFunctions";

export default function GoogleAuthButton({signup = false}: {signup?: boolean}) {
    return (
    <form
      action={async () => {
        await gl2();
      }}
    >
        <button type="submit">
            <Image src={signup ? "/static/sign-up-with-google.svg" : "/static/sign-in-with-google.svg"} alt={signup ? "sign up with google" : "sign in with google"} width={175} height={40}/>
        </button>
      
    </form>
    );
}