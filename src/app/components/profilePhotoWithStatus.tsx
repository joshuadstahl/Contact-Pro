import PPhoto from "./profilePhoto";
import { GetColorBgClass, GetStatusName } from './util/functions';
import { useContext } from 'react';
import { UserRepositoryContext } from './context/userRepositoryContext';
import { User } from '../classes/user';


export default function ProfilePhotoWithStatus({user } : {user: User}) {

	const userRepo = useContext(UserRepositoryContext);

	let statusColor = GetColorBgClass(user.status); //get the user's status
	let statusName = GetStatusName(user.status); //get the user's status

	return (
		<div className="relative">
			<PPhoto photo={user.photo}/>
			<div title={statusName} className={"absolute bottom-0.5 right-0.5 rounded-full " + statusColor + " w-2.5 h-2.5"}></div>
		</div>
	)
	
}