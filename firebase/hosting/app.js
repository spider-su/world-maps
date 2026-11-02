/* The invitation token stays in this browser; no analytics, geocoder or server call. */
const texts={
 en:{title:'A world to discover.',intro:'Learn countries, explore the globe and play offline.',inviteTitle:'You’re invited!',inviteBody:'Open World Maps to review your friend’s invitation. You choose whether to accept.',open:'Open in World Maps',install:'New here? Download the app, then return to this page to open your invitation.',download:'Download for Android',preparing:'Preparing download…',unavailable:'Download is not available yet. Please try again later.',details:'Download details',preview:'Android preview · APK · Not a store release',ios:'iPhone download is not available yet.',privacy:'No account needed to learn. Friends are optional.',invalid:'This invitation is invalid. Ask your friend for a new link.'},
 pl:{title:'Świat do odkrycia.',intro:'Poznawaj państwa, odkrywaj globus i graj offline.',inviteTitle:'Masz zaproszenie!',inviteBody:'Otwórz World Maps, aby zobaczyć zaproszenie znajomego. Ty decydujesz, czy je przyjąć.',open:'Otwórz w World Maps',install:'Pierwszy raz? Pobierz aplikację, a potem wróć tutaj, aby otworzyć zaproszenie.',download:'Pobierz na Androida',preparing:'Przygotowywanie pobierania…',unavailable:'Pobieranie nie jest jeszcze dostępne. Spróbuj później.',details:'Szczegóły pobierania',preview:'Wersja testowa na Androida · APK · Poza sklepem',ios:'Wersja na iPhone’a nie jest jeszcze dostępna.',privacy:'Nauka nie wymaga konta. Znajomi są opcjonalni.',invalid:'Nieprawidłowe zaproszenie. Poproś znajomego o nowy link.'},
 ru:{title:'Целый мир открытий.',intro:'Изучайте страны, исследуйте глобус и играйте без интернета.',inviteTitle:'Вас пригласили!',inviteBody:'Откройте World Maps, чтобы просмотреть приглашение друга. Вы сами решаете, принимать ли его.',open:'Открыть в World Maps',install:'Впервые здесь? Скачайте приложение и вернитесь сюда, чтобы открыть приглашение.',download:'Скачать для Android',preparing:'Подготовка загрузки…',unavailable:'Загрузка пока недоступна. Попробуйте позже.',details:'Сведения о загрузке',preview:'Тестовая версия для Android · APK · Вне магазина',ios:'Версия для iPhone пока недоступна.',privacy:'Для обучения аккаунт не нужен. Друзья необязательны.',invalid:'Недействительное приглашение. Попросите друга прислать новую ссылку.'}
};
const lang=navigator.language.slice(0,2),c=texts[lang]||texts.en;document.documentElement.lang=texts[lang]?lang:'en';
for(const[id,value]of Object.entries({'title':c.title,'intro':c.intro,'invite-title':c.inviteTitle,'invite-body':c.inviteBody,'open':c.open,'install-hint':c.install,'download':c.preparing,'details-title':c.details,'preview':c.preview,'ios':c.ios,'privacy':c.privacy}))document.getElementById(id).textContent=value;
const url=new URL(location.href),tokens=url.searchParams.getAll('invite'),token=tokens[0];
if(url.pathname==='/friend'){
 document.getElementById('invitation').hidden=false;
 const valid=tokens.length===1&&/^[A-Za-z0-9_-]{32,128}$/.test(token||'')&&[...url.searchParams.keys()].every(k=>k==='invite')&&!url.hash;
 if(valid){
  const deepLink=`worldmaps://friend?invite=${encodeURIComponent(token)}`;
  document.getElementById('open').href=/Android/i.test(navigator.userAgent)?`intent://friend?invite=${encodeURIComponent(token)}#Intent;scheme=worldmaps;package=com.spidersu.worldmaps;S.browser_fallback_url=${encodeURIComponent(url.href)};end`:deepLink;
 }else{document.getElementById('invite-body').textContent=c.invalid;document.getElementById('open').hidden=true;}
}
async function download(){
 const button=document.getElementById('download');
 try{
  const [apk,meta]=await Promise.all([fetch('/downloads/world-maps-preview.apk',{method:'HEAD'}),fetch('/downloads/preview-metadata.json')]);
  if(!apk.ok||!meta.ok)throw Error('not ready');
  const data=await meta.json();if(!/^[a-f0-9]{40}$/.test(data.sourceCommit)||!/^[a-f0-9]{64}$/.test(data.sha256))throw Error('invalid metadata');
  button.href='/downloads/world-maps-preview.apk';button.removeAttribute('aria-disabled');button.textContent=c.download;
  document.getElementById('version').textContent=`${data.sourceCommit.slice(0,7)} · SHA-256: ${data.sha256}`;document.getElementById('version').style.overflowWrap='anywhere';
 }catch{button.textContent=c.unavailable;}
}
void download();
