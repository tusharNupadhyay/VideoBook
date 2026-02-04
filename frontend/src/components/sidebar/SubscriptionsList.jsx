import SubscribedChannels from "./SubscribedChannels"
import { useAppSelector} from '../../app/hooks';

export default function SubscriptionsList({isOpen}){

    const { myProfile, myProfileLoading } = useAppSelector((state) => state.user);
    if (myProfileLoading ) {
    return <p className="px-4 text-xs text-gray-400">{isOpen && "Loading..."}</p>;
  }
  if (!myProfile?.subscribedChannels?.length ) {
    return (<p className="px-4 text-xs text-gray-500 italic">{isOpen && "No subscriptions"}</p>);
  }
    return (
    <div className="flex flex-col gap-1 w-full flex-1 items-center p-2">
      {isOpen && <p className=" mb-2 text-sm font-semibold text-gray-300">Subscriptions</p>}
      
      {myProfile?.subscribedChannels.map((channel) => (
        <SubscribedChannels 
          key={channel?._id} 
          channel={channel} 
          sidebarOpen={isOpen} 
        />
      ))}
    </div>
  );
}