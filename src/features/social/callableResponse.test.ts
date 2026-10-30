import { describe, expect, it } from 'vitest';
import { readCallableResponse } from './callableResponse';
function response(status: number, body: string) {
  return { status, ok: status >= 200 && status < 300, headers: new Headers(), text: async () => body };
}
describe('Firebase callable response handling', () => {
  it('accepts valid callable JSON', async () => {
    await expect(readCallableResponse(response(200, '{"result":{"token":"abc"}}'), 'createFriendInvite')).resolves.toEqual({token:'abc'});
  });
  it('explains HTML 404 without leaking markup', async () => {
    await expect(readCallableResponse(response(404, '<html>Not Found</html>'), 'createFriendInvite')).rejects.toThrow(/not found \(HTTP 404\)/);
  });
  it('explains HTML 403 without leaking markup', async () => {
    await expect(readCallableResponse(response(403, '<html>Forbidden</html>'), 'createFriendInvite')).rejects.toThrow(/invoker permissions/);
  });
  it('preserves structured callable error', async () => {
    await expect(readCallableResponse(response(403, '{"error":{"status":"PERMISSION_DENIED","message":"App Check rejected"}}'), 'createFriendInvite')).rejects.toThrow('App Check rejected');
  });
  it('rejects malformed success', async () => {
    await expect(readCallableResponse(response(200, '<html>wrong origin</html>'), 'createFriendInvite')).rejects.toThrow(/invalid response/);
  });
});
