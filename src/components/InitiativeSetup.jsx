import { useState } from "react";
import { readPhysicalDie } from "../services/diceReader";

// Una lectura es un candidato. Solo las filas confirmadas llegan al combate.
export default function InitiativeSetup({ encounter, onStart, onClose, readDie = readPhysicalDie }) {
  const [players,setPlayers]=useState([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  // Agrega un jugador sin asociarlo a una ficha de personaje.
  const add=()=>setPlayers(p=>[...p,{id:window.crypto.randomUUID(),name:"",roll:"",modifier:"0",confirmed:false,photo:null,candidate:null}]);
  // Cualquier edición obliga a confirmar nuevamente esa fila.
  const change=(id,field,value)=>setPlayers(p=>p.map(row=>row.id===id?{...row,[field]:value,confirmed:false}:row));
  // Comprueba nombre, d20 y modificador antes de aceptar la iniciativa.
  const valid=row=>row.name.trim()&&row.name.length<=120&&row.roll!==""&&Number.isInteger(Number(row.roll))&&Number(row.roll)>=1&&Number(row.roll)<=20&&row.modifier!==""&&Number.isInteger(Number(row.modifier))&&Math.abs(Number(row.modifier))<=50;
  // Solicita una foto y muestra la propuesta para este jugador.
  async function read(id){
    setBusy(true);setError("");
    setPlayers(p=>p.map(row=>row.id===id?{...row,confirmed:false,roll:"",photo:null,candidate:null}:row));
    try{
      const data=await readDie();
      setPlayers(p=>p.map(row=>row.id===id?{...row,photo:data.imageData,candidate:data,roll:data.dado==="d20"&&data.valor!=null?String(data.valor):"",confirmed:false}:row));
    }catch(e){setError(e.message);}finally{setBusy(false);}
  }
  // Envía solo los valores revisados; la foto queda en el navegador.
  async function start(){
    if(players.some(row=>!valid(row)||!row.confirmed))return;
    setBusy(true);setError("");
    try{await onStart(players.map(row=>({name:row.name.trim(),roll:Number(row.roll),modifier:Number(row.modifier)})));}
    catch(e){setError(e.message);setBusy(false);}
  }
  return <section className="encounter-builder" aria-label="Preparar iniciativas">
    <h3>Iniciativas · {encounter.name}</h3>
    <p>Agregá los jugadores por nombre. Ingresá el d20 manualmente o leelo con la cámara; revisá la foto y confirmá cada fila. Los monstruos conservan su cálculo automático.</p>
    <p>Para leer un dado, ejecutá el lector local en esta PC. La lectura manual detiene su detector automático.</p>
    {error&&<div className="alert-error" role="alert">{error}</div>}
    {players.map(row=><fieldset key={row.id} style={{margin:"16px 0",padding:16}}>
      <legend>{row.name||"Jugador nuevo"} · {row.confirmed?"Confirmado":"Pendiente de confirmar"}</legend>
      <label>Nombre <input className="form-input" style={{width:220,display:"inline-block"}} aria-label="Nombre del jugador" maxLength={120} value={row.name} disabled={busy} onChange={e=>change(row.id,"name",e.target.value)}/></label>{" "}
      <label>D20 <input className="form-input" style={{width:80,display:"inline-block"}} aria-label="Resultado d20" type="number" min="1" max="20" value={row.roll} disabled={busy} onChange={e=>change(row.id,"roll",e.target.value)}/></label>{" "}
      <label>Modificador <input className="form-input" style={{width:80,display:"inline-block"}} aria-label="Modificador de iniciativa" type="number" min="-50" max="50" value={row.modifier} disabled={busy} onChange={e=>change(row.id,"modifier",e.target.value)}/></label>
      <p>Total: {valid(row)?Number(row.roll)+Number(row.modifier):"—"}</p>
      <button type="button" className="btn-secondary" disabled={busy} onClick={()=>read(row.id)}>Leer dado</button>{" "}
      <button type="button" className="btn-primary" disabled={busy||!valid(row)} onClick={()=>setPlayers(p=>p.map(r=>r.id===row.id?{...r,confirmed:true}:r))}>Confirmar iniciativa</button>{" "}
      <button type="button" className="btn-danger-sm" disabled={busy} onClick={()=>setPlayers(p=>p.filter(r=>r.id!==row.id))}>Quitar jugador</button>
      {row.photo&&<div><img src={row.photo} alt={"Foto revisada para "+row.name} style={{maxWidth:420,width:"100%",marginTop:12}}/>
        <p>Ollama propuso: {row.candidate?.dado||"desconocido"} / {row.candidate?.valor??"indeterminado"}. {row.candidate?.observacion}</p>
        {row.candidate?.dado!=="d20"&&<p>La iniciativa usa d20. Revisá el tipo y corregí el valor o repetí la captura.</p>}
      </div>}
    </fieldset>)}
    <button type="button" className="btn-secondary" disabled={busy||players.length>=50} onClick={add}>Agregar jugador</button>
    <div className="modal-actions">
      <button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>Cancelar</button>
      <button type="button" className="btn-primary" disabled={busy||players.some(row=>!valid(row)||!row.confirmed)} onClick={start}>{busy?"Procesando…":"Calcular iniciativas e iniciar combate"}</button>
    </div>
    <small>Los participantes son nombres de este encuentro; no modifican fichas de personajes. Las fotos no se envían al backend compartido.</small>
  </section>;
}
