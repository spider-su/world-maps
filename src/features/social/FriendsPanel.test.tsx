import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FriendsPanel } from './FriendsPanel';
import { friendsCopy } from './friendsCopy';
import { friendInviteUrl } from './friendInvite';
import { initialProgress } from '../geography/progress';
const fixture=vi.hoisted(()=>({language:'en' as 'en'|'pl'|'ru'}));
vi.mock('../../ui/LanguageContext',()=>({useLanguage:()=>({language:fixture.language})}));
vi.mock('../geography/ProgressContext',()=>({useProgress:()=>({progress:initialProgress})}));
vi.mock('@expo/vector-icons',()=>({Ionicons:()=>null}));
vi.mock('@react-navigation/native',()=>({useIsFocused:()=>true,useFocusEffect:()=>{}}));
vi.mock('../../ui/OptionsSheet',()=>({OptionsSheet:()=>null}));
vi.mock('./FriendInviteQr',()=>({FriendInviteQr:()=>null}));
vi.mock('./FriendQrScanner',()=>({FriendQrScanner:()=>null}));
describe('player-facing sharing',()=>{
 it('offers a share action and loading indicator without technical setup copy',()=>{
  for(const language of ['en','pl','ru'] as const){fixture.language=language;const html=renderToStaticMarkup(<FriendsPanel/>);
   expect(html).toContain(friendsCopy[language].shareApp);expect(html).toContain(friendsCopy[language].loading);
   for(const text of ['Firebase','App Check','deployed','Check link','Connected ·'])expect(html).not.toContain(text);
  }
 });
 it('shows incoming invitations for explicit approval before consent or sign-in',()=>{
  fixture.language='en';const url=friendInviteUrl('a'.repeat(48));const html=renderToStaticMarkup(<FriendsPanel incomingInvite={url}/>);
  expect(html).toContain('Friend invitation');expect(html).toContain('Add friend');expect(html).toContain('Turn on sharing and sign in');expect(html).toContain('aria-disabled="true"');expect(html).not.toContain(url);
 });
 it('does not present arbitrary deep links for approval',()=>{expect(renderToStaticMarkup(<FriendsPanel incomingInvite="https://evil.example/friend?invite=anything"/>)).not.toContain('Friend invitation');});
});
