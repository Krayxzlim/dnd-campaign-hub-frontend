// Servicio local: nunca se envía el token de sesión de FRAGUA a la cámara o a Ollama.
const BASE=(import.meta.env.VITE_DICE_READER_URL||"http://127.0.0.1:3000").replace(/\/$/,"");
// Consulta la API local y muestra un mensaje si no está disponible.
async function call(path,method="GET"){
  let response;
  try{response=await fetch(BASE+path,{method,signal:window.AbortSignal.timeout(190000),cache:"no-store"});}
  catch{throw Error("No se pudo contactar al lector. Abrí INICIAR.cmd en esta PC y verificá el origen permitido y el permiso del navegador para acceder a la red local.");}
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.error||"Error del lector "+response.status);
  return data;
}
// Toma el control manual y pide una lectura cuando la cámara queda libre.
export async function readPhysicalDie(){
  await call('/api/auto/stop','POST');
  // Espera acotada: no interrumpir una inferencia ni asociar su foto a otro jugador.
  for(let n=0;n<200;n++){
    const s=await call('/api/state');
    if(!s.reading&&!s.auto.tickInProgress)return call('/api/read','POST');
    await new Promise(r=>setTimeout(r,300));
  }
  throw Error('El lector sigue ocupado. Esperá a que termine y volvé a intentar.');
}
