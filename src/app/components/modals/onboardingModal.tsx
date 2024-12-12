import { useState, ChangeEvent, useContext } from "react";
import { User } from "@/app/classes/user";
import FullScreenModal from "./fullScreenModal";
import Button from "../buttons/button";
import { userRepository } from "@/app/app/page";
import { randomUsername } from "../../functions/functions";



export default function OnboardingModal({currUser, userRepo, setUserRepo, pageLoaded, onboardingComplete, setOnboardingComplete} : {currUser: string, userRepo:userRepository, setUserRepo: Function, pageLoaded: boolean, onboardingComplete: boolean, setOnboardingComplete: Function}) {
    
    const [newUsername, setNewUsername] = useState(randomUsername()); //keeps track of the new username's value
    const [errorDisplayed, setErrorDisplayed] = useState(false); //handles if the error text on the text box is displayed or not
    const [buttonSubmitting, setButtonSubmitting] = useState(false); //handles the submit button's state
    const [onErrorText, setOnErrorText] = useState("Username already taken"); //stores the text for the error message.
   
    

    //sets the username to a new random username
    function newRandomUsername() {
        setNewUsername(randomUsername());
    }

    //performs submitting the username for submission to the database.
    async function chooseUsername() {
        try {
            setButtonSubmitting(true); //set the button to be submitting
            let body = {username: newUsername}; //body for the api request.
            let res = await fetch("/api/profile/username", {method: "PUT", body: JSON.stringify(body)}); //submit new username

            if (res.ok) {

                //success in updating the username in the database,
                //now update the interface.
                let copy = {...userRepo};
                copy[currUser].username = newUsername;
                setUserRepo(copy); //update the repository
                setOnboardingComplete(true); //close the modal
            }
            else {
                setOnErrorText("Username already taken"); //set the error text
                setErrorDisplayed(true); //display the error text
                setButtonSubmitting(false); //set the button to not be submitting
            }
            
        }
        catch {
            setOnErrorText("Network error occurred");
            setErrorDisplayed(true); //error occurred, display the error text.
            setButtonSubmitting(false); //set the button to not be submitting
        }
        
    }

    //closes the modal, not selecting a username
    function chooseUsernameLater() {
        setOnboardingComplete(true);
    }

    //fires whenever the text in the username box is changed.
    function newUsernameChanged(event: ChangeEvent<HTMLInputElement>) {
        setErrorDisplayed(false);
        setNewUsername(event.target.value ?? "");
    }

    return (
        <FullScreenModal shown={pageLoaded && !onboardingComplete} delayShow={300}>
            <div className="flex flex-col wrap-none items-center grow">
                <div className="border border-cadet_gray-300 rounded-my px-28 py-10 bg-white">
                    <h1 className="font-medium text-3xl text-center text-persian_green leading-none">Welcome aboard,</h1>
                    <h2 className={"text-3xl text-center font-bold text-persian_green mb-14"}>{pageLoaded && userRepo[currUser].name}!</h2>
                    <div className="flex flex-col wrap-none items-center mb-14">
                        <h2 className="text-center text-2xl text-moss_green-500">Let&apos;s choose a username.</h2>
                        <p className="text-center text-sm text-charcoal">This is what you&apos;ll be known by in Contact Pro</p>
                    </div>
                    <div className="flex flex-col wrap-none items-center">
                        
                        <div className="flex flex-row wrap-none items-center">

                            <div className="relative ">
                                <label className="absolute w-full " htmlFor="newUsername">
                                    <div className="flex flex-row wrap-none w-full items-center">
                                        <p className="text-light text-charcoal">Username</p>
                                        {errorDisplayed && <div className="flex flex-col wrap-none grow">
                                            <p className="self-end text-sm text-coral-800">{onErrorText}</p>
                                        </div>}
                                    </div>
                                </label>
                                <input onChange={newUsernameChanged} value={newUsername} id={"newUsername"} className="text-sm outline-none p-2.5 border border-solid border-cadet_gray-300 rounded-my mt-5 w-64" type="text" placeholder={"New username here"} />
                            </div>
                            <div className="mr-2.5">
                            </div>
                            <Button className="mt-5" text="Random Username" colorStyling="Light" color="Grayscale" size="Small" onClick={newRandomUsername} outline={true}/>
                        </div>
                        <div className="mt-2.5">
                            <p className="text-sm text-cadet_gray-600 text-center">Username can be changed later in account settings</p>
                        </div>

                        <div className="flex flex-row wrap-none items-center mt-14">
                            <Button className="w-32" text="Later" colorStyling="Heavy" color="Grayscale" size="Small" onClick={chooseUsernameLater}/>
                            <div className="mr-8">
                            </div>
                            <Button className="w-32" text="Choose" colorStyling="Heavy" color="Primary" size="Small" onClick={chooseUsername} submissionButton={true} submissionText="Choosing..." buttonSubmissionState={buttonSubmitting}/>
                        </div>
                    </div>
                </div>
            </div>
        </FullScreenModal>
    )
}