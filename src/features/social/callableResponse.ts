/** Callable endpoints can return HTML for missing deployments, IAM failures or proxies.
 * Never parse an arbitrary HTTP response as JSON or expose its HTML body to the UI.
 */
export async function readCallableResponse<T>(
  response: Pick<Response, 'ok' | 'status' | 'headers' | 'text'>,
  functionName: string,
): Promise<T> {
  const body = await response.text();
  let payload: { result?: T; error?: { message?: string; status?: string } };
  try {
    payload = JSON.parse(body) as typeof payload;
  } catch {
    if (response.status === 404) {
      throw new Error(`Firebase invitation service ${functionName} was not found (HTTP 404). Check that the function is deployed in us-central1 for project world-map-1.`);
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Firebase invitation service ${functionName} denied the request (HTTP ${response.status}). Check Cloud Run invoker permissions and Firebase App Check.`);
    }
    throw new Error(`Firebase invitation service ${functionName} returned an invalid response (HTTP ${response.status}). Check Cloud Functions deployment and logs.`);
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error(`Invalid Firebase response from ${functionName} (HTTP ${response.status})`);
  }
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? `Firebase function ${functionName} failed (HTTP ${response.status})`);
  }
  if (payload.result === undefined) throw new Error(`Empty response from ${functionName}`);
  return payload.result;
}
