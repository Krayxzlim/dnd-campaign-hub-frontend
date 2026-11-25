import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recoveryEntry, recoveryUrl, requestRecovery, updateRecoveredPassword, recoveryMessage } from '../src/services/passwordRecovery.js';

test('recovery remains routed after Supabase consumes the hash, including expired links', () => {
  assert.equal(recoveryEntry('https://web.test/?recovery=1').active, true);
  assert.equal(recoveryEntry('https://web.test/#type=recovery&access_token=test').active, true);
  assert.deepEqual(recoveryEntry('https://web.test/?recovery=1#error=access_denied'), { active:true, invalid:true });
  assert.equal(recoveryEntry('https://web.test/').active, false);
  assert.equal(recoveryUrl('https://web.test'), 'https://web.test/?recovery=1');
});
test('recovery sends email and redirect without disclosing whether an account exists', async () => {
  const auth = { resetPasswordForEmail: async (email, options) => {
    assert.equal(email, 'player@example.test');
    assert.equal(options.redirectTo, 'https://web.test/?recovery=1');
    return { error: null };
  }};
  assert.equal(await requestRecovery(auth, ' player@example.test ', recoveryUrl('https://web.test')), recoveryMessage);
  await assert.rejects(requestRecovery({resetPasswordForEmail:async()=>({error:new Error('rate limit')})},'x','x'), /rate limit/);
});
test('password validation prevents requests and preserves exact password characters', async () => {
  let calls=0;
  const auth={updateUser:async ({password})=>{ calls++; assert.equal(password,' space password ');return {error:null};},signOut:async ({scope})=>{assert.equal(scope,'global'); return {error:null};}};
  await assert.rejects(updateRecoveredPassword(auth,'short','short'), /8 caracteres/);
  await assert.rejects(updateRecoveredPassword(auth,'password1','password2'), /coinciden/);
  assert.equal(calls,0);
  assert.deepEqual(await updateRecoveredPassword(auth,' space password ',' space password '),{logoutFailed:false});
});
test('expired session is not success; sign-out failure does not undo password success', async () => {
  await assert.rejects(updateRecoveredPassword({updateUser:async()=>({error:new Error('expired')})},'password1','password1'),/expired/);
  assert.deepEqual(await updateRecoveredPassword({updateUser:async()=>({error:null}),signOut:async()=>({error:new Error('offline')})},'password1','password1'),{logoutFailed:true});
});
