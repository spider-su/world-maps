// Build the actual FriendsPanel against an isolated, delayed fake social backend.
// Never used by the app or production builds. Requires existing rolldown dependency.
import { build } from 'rolldown';
import { mkdirSync, writeFileSync } from 'node:fs';
const output='artifacts/profile-sharing-fixture';mkdirSync(output,{recursive:true});
const modules={
 LanguageContext:`export const useLanguage=()=>({language:window.__lang||'en'});`,
 ProgressContext:`import {initialProgress} from '${process.cwd()}/src/features/geography/progress';export const useProgress=()=>({progress:initialProgress});`,
 socialPreferences:`export const loadSocialPreferences=async()=>({enabled:true,nickname:'Atlas'});export const saveSocialPreferences=async()=>{};`,
 firebaseClient:`export const firebaseClient=async()=>({auth:{}});export const signInSocial=async()=>{};export const createSocialAccount=async()=>{};export const signOutSocial=async()=>{};`,
 auth:`export function onAuthStateChanged(auth,callback){const id=setTimeout(()=>callback({uid:'fixture-user'}),250);return()=>clearTimeout(id);}`,
 firebaseFriends:`const pause=()=>new Promise(r=>setTimeout(r,600));export const createInvitation=async()=>{window.__calls.create++;await pause();return 'https://world-map-1.web.app/friend?invite='+ 'a'.repeat(48)};export const acceptInvitation=async(token)=>{window.__calls.accept++;if(token!=='a'.repeat(48))throw Error('bad token');await pause();};export const listFriends=async()=>{await pause();return window.__calls.accept?[{uid:'fixture-friend',profile:{nickname:'Globetrotter',xp:120,level:2}}]:[];};export const deleteSharedProfile=async()=>{};`,
 socialSession:`export const syncChangedSocialProfile=async()=>{};`,
 googleSignIn:`export const signInWithGoogle=async()=>{};`,
 navigation:`export const useIsFocused=()=>true;export const useFocusEffect=callback=>{React.useEffect(callback,[callback]);};import React from 'react';`,
 icons:`import React from 'react';export const Ionicons=()=>null;`,
 FriendQrScanner:`import React from 'react';export const FriendQrScanner=({onInvite})=>React.createElement('button',{onClick:()=>onInvite('https://world-map-1.web.app/friend?invite='+'a'.repeat(48))},'Fixture decoded QR');`
};
const entry=`import React from 'react';import {createRoot} from 'react-dom/client';import {SafeAreaProvider} from 'react-native-safe-area-context';import {FriendsPanel} from '${process.cwd()}/src/features/social/FriendsPanel';window.__calls={create:0,accept:0};createRoot(document.getElementById('root')).render(<SafeAreaProvider><FriendsPanel/></SafeAreaProvider>);`;
await build({input:'fixture-entry.tsx',output:{file:output+'/app.js',format:'iife'},platform:'browser',transform:{jsx:'react-jsx',define:{'process.env.NODE_ENV':'"production"','__DEV__':'false'}},resolve:{extensions:['.web.tsx','.tsx','.web.js','.js','.ts','.json']},plugins:[{name:'fixture',resolveId(path){if(path==='fixture-entry.tsx')return '\0fixture-entry.tsx';const key=path==='firebase/auth'?'auth':path==='@react-navigation/native'?'navigation':path==='@expo/vector-icons'?'icons':path.split('/').at(-1);if(modules[key])return '\0fixture-'+key+'.tsx';if(path==='react-native')return import.meta.resolve('react-native-web').replace('file://','');},load(id){if(id==='\0fixture-entry.tsx')return entry;if(id.startsWith('\0fixture-'))return modules[id.slice(9,-4)];}}]});
writeFileSync(output+'/index.html','<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><div id="root"></div><script src="/app.js"></script>');
