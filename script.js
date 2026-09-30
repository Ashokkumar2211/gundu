/*
  No photo renaming is required.
  Put any JPG/JPEG/PNG/WEBP/GIF files into /photos.

  This works automatically after the site is deployed on GitHub Pages.
  The browser reads the public /photos folder through GitHub's API.
*/

const TARGET = new Date("2026-10-15T23:59:59+05:30");
const PHOTO_START = new Date("2026-09-30T00:00:00+05:30");

const $ = id => document.getElementById(id);
const photo = $("dailyPhoto");

function pad(n){ return String(Math.max(0,n)).padStart(2,"0"); }

function countdown(){
  const diff = TARGET - new Date();
  if(diff <= 0){
    $("days").textContent=$("hours").textContent=$("minutes").textContent=$("seconds").textContent="00";
    $("final").classList.remove("hidden");
    return;
  }
  const s=Math.floor(diff/1000);
  $("days").textContent=pad(Math.floor(s/86400));
  $("hours").textContent=pad(Math.floor((s%86400)/3600));
  $("minutes").textContent=pad(Math.floor((s%3600)/60));
  $("seconds").textContent=pad(s%60);
}

function repoInfo(){
  const host=location.hostname;
  if(!host.endsWith(".github.io")) return null;

  const owner=host.split(".")[0];
  const parts=location.pathname.split("/").filter(Boolean);
  const repo=parts[0] || `${owner}.github.io`;
  return {owner,repo};
}

function dayNumber(){
  const now=new Date();
  const localToday=new Date(now.toLocaleString("en-US",{timeZone:"Asia/Kolkata"}));
  localToday.setHours(0,0,0,0);
  return Math.max(0,Math.floor((localToday-PHOTO_START)/86400000));
}

const captions=[
  "Another day. Another memory.",
  "If only time could slow down.",
  "Keep this moment somewhere in your heart.",
  "Some memories become everything.",
  "One more day. One more memory.",
  "Time keeps moving, even when we don't.",
  "Remember this feeling.",
  "Not every moment gets a second chance."
];

async function loadPhotos(){
  const repo=repoInfo();

  if(!repo){
    $("errorBox").textContent="Open this website through GitHub Pages to load the photos automatically. You don't need to rename them.";
    $("errorBox").classList.remove("hidden");
    $("photoMessage").textContent="Upload the site to GitHub Pages — your photos will appear automatically.";
    return;
  }

  const url=`https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/contents/photos`;

  try{
    const r=await fetch(url,{headers:{"Accept":"application/vnd.github+json"}});
    if(!r.ok) throw new Error("GitHub API error");
    const files=await r.json();

    const images=files
      .filter(f=>f.type==="file" && /\.(jpe?g|png|webp|gif)$/i.test(f.name))
      .sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));

    if(!images.length) throw new Error("No images found");

    // One deterministic photo per calendar day.
    // If you have more photos than days, the first days use the first photos.
    const index=dayNumber()%images.length;
    const selected=images[index];

    photo.onload=()=>photo.classList.add("show");
    photo.src=selected.download_url;
    photo.alt=`Memory ${index+1}`;
    $("photoCounter").textContent=`MEMORY ${String(index+1).padStart(2,"0")} / ${String(images.length).padStart(2,"0")}`;
    $("photoMessage").textContent=captions[index%captions.length];
  }catch(e){
    $("errorBox").textContent="I couldn't read the photos folder. Make sure the GitHub repository is public and the photos are inside /photos.";
    $("errorBox").classList.remove("hidden");
    console.error(e);
  }
}

$("today").textContent=new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric"}).format(new Date());
countdown();
setInterval(countdown,1000);
loadPhotos();
