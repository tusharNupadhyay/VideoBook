

export default function formatDuration(seconds){
//truncate it to integer
const totalSeconds = Math.floor(Number(seconds));

const hrs = Math.floor(totalSeconds/3600);
const mins = Math.floor((totalSeconds%3600)/60);
const secs = Math.floor(totalSeconds % 60);

//ensure 2 digit formatting
const paddedSecs = secs.toString().padStart(2,"0");
const paddedMins = mins.toString().padStart(2,"0");

return hrs>0 ? `${hrs}:${paddedMins}:${paddedSecs}`: `${paddedMins}:${paddedSecs}`;
}