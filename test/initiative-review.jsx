import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import InitiativeSetup from '../src/components/InitiativeSetup';
import '../src/App.css';
// Fixture explícita: no cámara, Ollama, sesión ni campaña reales.
function Review(){
 const [sent,setSent]=useState(null);
 const readDie=async()=>({dado:'d20',valor:16,observacion:'Candidato simulado para probar corrección.',imageData:'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180"><rect width="400" height="180" fill="#25334a"/><text x="20" y="90" fill="white">FOTO SINTÉTICA · prueba de interfaz</text></svg>')});
 return <main style={{padding:24}}><h1>Prueba aislada · datos simulados</h1><InitiativeSetup encounter={{id:'test',name:'Ensayo de interfaz'}} readDie={readDie} onStart={async p=>setSent(p)} onClose={()=>setSent('cancelado')}/><pre aria-label="Payload confirmado">{JSON.stringify(sent,null,2)}</pre></main>;
}
createRoot(document.getElementById('root')).render(<Review/>);
