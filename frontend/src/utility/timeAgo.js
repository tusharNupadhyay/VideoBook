
export default function timeAgo(dateString){
const now = new Date();
const past = new Date(dateString);

//subtracting 2 date objects will give the milliseconds between them
const seconds = Math.floor((now-past)/1000);
if(seconds < 60) return `${seconds} second${seconds!==1?"s":""} ago`;

const mins = Math.floor(seconds/60);
if(mins < 60) return `${mins} minute${mins!==1?"s":""} ago`;

const hrs = Math.floor(mins/60);
if(hrs < 24) return `${hrs} hour${hrs!==1?"s":""} ago`;

const days = Math.floor(hrs/24);
if(days < 30) return `${days} day${days!==1?"s":""} ago`;

const months = Math.floor(days/30);
if(months < 12) return `${months} month${months!==1?"s":""} ago`;

const years = Math.floor(days/365);
return `${years} year${years!==1?"s":""} ago`;
}