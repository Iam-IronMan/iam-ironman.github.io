/* The page content is kept in content.js for straightforward editing. */
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const linkHTML = (label, url) => url ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${label}<span class="external-arrow" aria-hidden="true">↗</span></a>` : '';
const researchList = document.getElementById('research-list');
researchList.innerHTML = homepageContent.research.map(item => {
  const destination = item.project || item.paper;
  const title = escapeHTML(item.title);
  const authors = item.authors.map(author => author === 'Jiahang Liu' ? `<strong>${escapeHTML(author)}</strong>` : escapeHTML(author)).join(', ');
  const visual = `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.alt)}" loading="lazy" width="660" height="420">`;
  const media = item.video
    ? `<figure class="research-media"><div class="research-visual has-video"><video class="research-video" src="${escapeHTML(item.video)}" poster="${escapeHTML(item.videoPoster || item.image)}" aria-label="${escapeHTML(item.videoAlt || item.alt)}" muted loop playsinline controls preload="none" width="660" height="420"><a href="${escapeHTML(item.video)}">Watch the ${escapeHTML(item.shortName)} demo</a></video></div>${item.videoCaption ? `<figcaption>${escapeHTML(item.videoCaption)}</figcaption>` : ''}</figure>`
    : destination ? `<a class="research-visual" href="${escapeHTML(destination)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(item.shortName)} project">${visual}</a>` : `<div class="research-visual">${visual}</div>`;
  return `<article class="research-item">
    ${media}
    <div class="research-text"><div class="research-meta"><span class="venue-label">${escapeHTML(item.venue)}</span><span class="meta-separator"></span><span>${escapeHTML(item.displayName || item.area)}</span></div>
    <h3>${destination ? `<a href="${escapeHTML(destination)}" target="_blank" rel="noopener noreferrer">${title}</a>` : title}</h3>
    <p class="authors">${authors}${item.teamCredit ? ` <span>·</span> <strong>${escapeHTML(item.teamCredit)}</strong>` : ''}</p>
    <p class="research-description">${escapeHTML(item.description)}</p>
    ${item.contribution ? `<p class="contribution"><b>My focus:</b> ${escapeHTML(item.contribution)}</p>` : ''}
    <div class="research-links">${linkHTML('Paper',item.paper)}${linkHTML(escapeHTML(item.projectLabel || 'Project'),item.project)}${linkHTML('Code',item.code)}${linkHTML('Video',item.video)}</div></div>
    </article>`;
}).join('');
if(homepageContent.thesisImage){document.getElementById('thesis-image').src=homepageContent.thesisImage;document.getElementById('thesis-figure').hidden=false;}
const sections = [...document.querySelectorAll('main > section[id]')];
const navigation = [...document.querySelectorAll('.sidebar nav a')];
const setActive = id => navigation.forEach(link => {const active=link.hash===`#${id}`;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible[0])setActive(visible[0].target.id);},{rootMargin:'-5% 0px -64% 0px',threshold:0});sections.forEach(section=>observer.observe(section));}
navigation.forEach(link=>link.addEventListener('click',()=>setActive(link.hash.slice(1))));

// Short demos play only while visible. Native controls remain available when
// autoplay is blocked, reduced motion is preferred, or a visitor pauses a clip.
const demoVideos = [...document.querySelectorAll('.research-video')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const videoStates = new Map(demoVideos.map(video => [video, {visible:false, userPaused:false, automaticPause:false}]));
const pauseDemo = video => {
  if(!video.paused){videoStates.get(video).automaticPause=true;video.pause();}
};
const syncDemo = video => {
  const state=videoStates.get(video);
  if(!state.visible || document.hidden){pauseDemo(video);return;}
  if(state.userPaused || reducedMotion.matches || navigator.connection?.saveData)return;
  video.play().then(()=>{
    if(!videoStates.get(video).visible || document.hidden)pauseDemo(video);
  }).catch(()=>{/* A visible poster and native play control are the fallback. */});
};
demoVideos.forEach(video=>{
  video.muted=true;
  video.addEventListener('play',()=>{videoStates.get(video).userPaused=false;});
  video.addEventListener('pause',()=>{
    const state=videoStates.get(video);
    if(state.automaticPause){state.automaticPause=false;return;}
    if(state.visible && !document.hidden)state.userPaused=true;
  });
});
if('IntersectionObserver' in window){
  const mediaObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      videoStates.get(entry.target).visible=entry.isIntersecting && entry.intersectionRatio>=.2;
      syncDemo(entry.target);
    });
  },{threshold:[0,.2]});
  demoVideos.forEach(video=>mediaObserver.observe(video));
}
document.addEventListener('visibilitychange',()=>demoVideos.forEach(syncDemo));
reducedMotion.addEventListener('change',()=>demoVideos.forEach(video=>{
  if(reducedMotion.matches)pauseDemo(video);else syncDemo(video);
}));
