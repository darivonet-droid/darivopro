import { useState, useRef, useEffect } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{font-family:'Inter',system-ui,sans-serif;background:#0A1628;-webkit-tap-highlight-color:transparent;overscroll-behavior:none;}
  input[type=range]{accent-color:#2563EB;width:100%;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
  input,textarea{font-family:'Inter',system-ui,sans-serif;}
  ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:2px;}
  button{-webkit-tap-highlight-color:transparent;font-family:'Inter',system-ui,sans-serif;}
  button:active{transform:scale(0.96);transition:transform 0.08s;}
  @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes popIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
  .su{animation:slideUp 0.22s cubic-bezier(.2,.8,.4,1) both;}
  .fi{animation:fadeIn 0.18s ease both;}
  .pi{animation:popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both;}
`;

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  navy:"#0A1628", navyMid:"#0D1E35", navyLight:"#112240",
  blue:"#2563EB", blueL:"#3B82F6", bluePale:"#EFF6FF", blueDark:"#1D4ED8",
  white:"#FFFFFF", slate:"#F1F5F9", slateD:"#E2E8F0", slateDD:"#CBD5E1",
  text:"#1E293B", textMid:"#64748B", textLight:"#94A3B8",
  green:"#10B981", greenD:"#059669", greenPale:"#ECFDF5",
  amber:"#F59E0B", amberD:"#D97706", amberPale:"#FFFBEB",
  red:"#EF4444", redPale:"#FEF2F2",
  purple:"#7C3AED", purplePale:"#F5F3FF",
  teal:"#0D9488", tealPale:"#F0FDFA",
  brown:"#92400E",
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const SVG = ({d,size=22,color="currentColor",fill="none",sw=2,style={}}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {Array.isArray(d)?d.map((p,i)=><path key={i} d={p}/>):<path d={d}/>}
  </svg>
);
const I = {
  home:      ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],
  users:     ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  plus:      "M12 5v14 M5 12h14",
  gear:      ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  zap:       "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  check:     "M20 6L9 17l-5-5",
  back:      ["M19 12H5","M12 19l-7-7 7-7"],
  chevron:   "M9 18l6-6-6-6",
  edit:      ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  trash:     ["M3 6h18","M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6","M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],
  pdf:       ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  wa:        "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  brief:     ["M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z","M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"],
  star:      "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z",
  layers:    ["M12 2L2 7l10 5 10-5-10-5z","M2 17l10 5 10-5","M2 12l10 5 10-5"],
  camera:    ["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z","M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  share:     ["M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8","M16 6l-4-4-4 4","M12 2v13"],
  phone:     "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z",
  mail:      ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  user:      ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  tag:       ["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z","M7 7h.01"],
  x:         "M18 6L6 18 M6 6l12 12",
  save:      ["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z","M17 21v-8H7v8","M7 3v5h8"],
  sparkle:   "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z",
  receipt:   ["M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2","M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2","M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2","M9 12h6","M9 16h4"],
  convert:   ["M17 1l4 4-4 4","M3 11V9a4 4 0 0 1 4-4h14","M7 23l-4-4 4-4","M21 13v2a4 4 0 0 1-4 4H3"],
  building:  ["M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18","M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2","M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2","M10 6h4","M10 10h4","M10 14h4","M10 18h4"],
  folder:    ["M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"],
  bell:      ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"],
};

// ─── CATÁLOGO PROFESIONAL DE REFORMAS INTEGRALES ─────────────────────────────
// Partidas reales de presupuesto de obra con precios de mercado (S/, Perú 2026)
const BASE_CATALOG = [
  { id:"albanileria", label:"Albañilería", emoji:"🧱", color:T.amber,
    services:[
      {id:"a_demo_alic", label:"Demolición de alicatado",       calcType:"m2",   basePrice:12,  unit:"m²"},
      {id:"a_demo_tab",  label:"Demolición de tabique",          calcType:"m2",   basePrice:18,  unit:"m²"},
      {id:"a_demo_pav",  label:"Demolición de pavimento",        calcType:"m2",   basePrice:14,  unit:"m²"},
      {id:"a_tabique",   label:"Tabique ladrillo / pladur",      calcType:"m2",   basePrice:42,  unit:"m²"},
      {id:"a_alicatado", label:"Alicatado de paredes",           calcType:"m2",   basePrice:38,  unit:"m²"},
      {id:"a_solado",    label:"Solado / pavimento cerámico",    calcType:"m2",   basePrice:35,  unit:"m²"},
      {id:"a_recrecido", label:"Recrecido de mortero",           calcType:"m2",   basePrice:22,  unit:"m²"},
      {id:"a_escombro",  label:"Retirada de escombros",          calcType:"unit", basePrice:180, unit:"saco"},
    ]},
  { id:"fontaneria", label:"Fontanería", emoji:"💧", color:T.teal,
    services:[
      {id:"f_inst_bano",  label:"Instalación completa baño",    calcType:"fixed",basePrice:950,  unit:""},
      {id:"f_inst_cocina",label:"Instalación completa cocina",  calcType:"fixed",basePrice:780,  unit:""},
      {id:"f_punto_agua", label:"Punto de agua (toma)",          calcType:"unit", basePrice:85,   unit:"ud"},
      {id:"f_desague",    label:"Punto de desagüe",              calcType:"unit", basePrice:95,   unit:"ud"},
      {id:"f_sanitario",  label:"Colocación de sanitario",       calcType:"unit", basePrice:90,   unit:"ud"},
      {id:"f_mampara",    label:"Colocación de mampara",         calcType:"unit", basePrice:130,  unit:"ud"},
      {id:"f_griferia",   label:"Montaje de grifería",           calcType:"unit", basePrice:55,   unit:"ud"},
      {id:"f_termo",      label:"Instalación de termo eléctrico",calcType:"unit", basePrice:160,  unit:"ud"},
    ]},
  { id:"electricidad", label:"Electricidad", emoji:"⚡", color:"#D97706",
    services:[
      {id:"e_punto_luz",  label:"Punto de luz",                  calcType:"unit", basePrice:38,   unit:"ud"},
      {id:"e_enchufe",    label:"Punto de enchufe",              calcType:"unit", basePrice:35,   unit:"ud"},
      {id:"e_conmutado",  label:"Punto conmutado",               calcType:"unit", basePrice:48,   unit:"ud"},
      {id:"e_cuadro",     label:"Cuadro eléctrico nuevo",        calcType:"fixed",basePrice:450,  unit:""},
      {id:"e_inst_viv",   label:"Instalación completa vivienda", calcType:"fixed",basePrice:2800, unit:""},
      {id:"e_boletin",    label:"Boletín eléctrico (CIE)",       calcType:"fixed",basePrice:180,  unit:""},
      {id:"e_telecom",    label:"Punto TV / telecomunicaciones", calcType:"unit", basePrice:42,   unit:"ud"},
    ]},
  { id:"pintura", label:"Pintura", emoji:"🎨", color:T.blue,
    services:[
      {id:"p_plastica",   label:"Pintura plástica",              calcType:"m2",   basePrice:7,    unit:"m²"},
      {id:"p_techos",     label:"Pintura de techos",             calcType:"m2",   basePrice:8,    unit:"m²"},
      {id:"p_alisado",    label:"Alisado de paredes (quitar gota)",calcType:"m2", basePrice:14,   unit:"m²"},
      {id:"p_esmalte",    label:"Esmalte puertas / carpintería", calcType:"unit", basePrice:65,   unit:"ud"},
      {id:"p_antihumedad",label:"Tratamiento antihumedad",       calcType:"m2",   basePrice:19,   unit:"m²"},
      {id:"p_exterior",   label:"Pintura de fachada / exterior", calcType:"m2",   basePrice:13,   unit:"m²"},
    ]},
  { id:"carpinteria", label:"Carpintería", emoji:"🚪", color:T.brown,
    services:[
      {id:"c_puerta",     label:"Puerta de paso instalada",      calcType:"unit", basePrice:230,  unit:"ud"},
      {id:"c_blindada",   label:"Puerta blindada / acorazada",   calcType:"unit", basePrice:850,  unit:"ud"},
      {id:"c_tarima",     label:"Tarima flotante / laminado",    calcType:"m2",   basePrice:26,   unit:"m²"},
      {id:"c_rodapie",    label:"Rodapié (ml)",                  calcType:"unit", basePrice:7,    unit:"ml"},
      {id:"c_armario",    label:"Frente de armario empotrado",   calcType:"unit", basePrice:520,  unit:"ud"},
      {id:"c_ventana",    label:"Ventana PVC / aluminio",        calcType:"unit", basePrice:380,  unit:"ud"},
    ]},
  { id:"clima", label:"Climatización", emoji:"❄️", color:T.purple,
    services:[
      {id:"cl_split",     label:"Instalación split AC",          calcType:"unit", basePrice:280,  unit:"ud"},
      {id:"cl_conductos", label:"AC por conductos",              calcType:"fixed",basePrice:1900, unit:""},
      {id:"cl_radiador",  label:"Radiador instalado",            calcType:"unit", basePrice:175,  unit:"ud"},
      {id:"cl_caldera",   label:"Sustitución de caldera",        calcType:"fixed",basePrice:1450, unit:""},
      {id:"cl_suelo_rad", label:"Suelo radiante",                calcType:"m2",   basePrice:55,   unit:"m²"},
    ]},
];

const PRESETS = {m2:[5,10,15,20,30,50,80],unit:[1,2,3,4,5,8,10],hour:[1,2,4,6,8],fixed:[]};
const CALC_LABEL = {m2:"m²",unit:"ud",hour:"hora",fixed:"fijo"};
const fmt = n => "S/ "+(n||0).toLocaleString("es-PE",{minimumFractionDigits:0,maximumFractionDigits:0});
const today = () => new Date().toISOString().slice(0,10);

const defaultPrices = {};
BASE_CATALOG.forEach(c=>c.services.forEach(s=>{defaultPrices[s.id]=s.basePrice;}));
const defaultActiveCats = Object.fromEntries(BASE_CATALOG.map(c=>[c.id,true]));

// ─── DATOS DE EMPRESA (Facturación Perú) ──────────────────────────────────────
const DEFAULT_BIZ = {
  razonSocial:"Mi Empresa S.A.C.",
  ruc:"20123456789",
  direccion:"Av. Principal 123, Lima",
  telefono:"",
  moneda:"PEN",
  simbolo:"S/",
};

const SAMPLE_QUOTES = [
  {id:0,clientName:"Reforma Baño + Salón",phone:"+34 600 222 333",city:"Sevilla",
   items:[{svcId:"a_demo_alic",catLabel:"Albañilería",svcLabel:"Demolición de alicatado",qty:22,unit:"m²",unitPrice:12,subtotal:264,calcType:"m2"},
          {svcId:"a_alicatado",catLabel:"Albañilería",svcLabel:"Alicatado de paredes",qty:22,unit:"m²",unitPrice:38,subtotal:836,calcType:"m2"},
          {svcId:"f_inst_bano",catLabel:"Fontanería",svcLabel:"Instalación completa baño",qty:1,unit:"",unitPrice:950,subtotal:950,calcType:"fixed"},
          {svcId:"f_sanitario",catLabel:"Fontanería",svcLabel:"Colocación de sanitario",qty:3,unit:"ud",unitPrice:90,subtotal:270,calcType:"unit"},
          {svcId:"p_plastica",catLabel:"Pintura",svcLabel:"Pintura plástica",qty:48,unit:"m²",unitPrice:7,subtotal:336,calcType:"m2"},
          {svcId:"cl_split",catLabel:"Climatización",svcLabel:"Instalación split AC",qty:1,unit:"ud",unitPrice:280,subtotal:280,calcType:"unit"}],
   margin:40,totalBase:2936,totalLabor:1174,totalFinal:4110,status:"Pendiente",createdAt:"2026-06-10",notes:"Reforma combinada: baño completo + pintura salón + AC. 4 capítulos en un mismo presupuesto."},
  {id:1,clientName:"Carlos Mendoza",phone:"+34 612 345 678",city:"Madrid",
   items:[{svcId:"a_demo_alic",catLabel:"Albañilería",svcLabel:"Demolición de alicatado",qty:24,unit:"m²",unitPrice:12,subtotal:288,calcType:"m2"},
          {svcId:"a_alicatado",catLabel:"Albañilería",svcLabel:"Alicatado de paredes",qty:24,unit:"m²",unitPrice:38,subtotal:912,calcType:"m2"},
          {svcId:"f_sanitario",catLabel:"Fontanería",svcLabel:"Colocación de sanitario",qty:2,unit:"ud",unitPrice:90,subtotal:180,calcType:"unit"}],
   margin:40,totalBase:1380,totalLabor:552,totalFinal:1932,status:"Aprobado",createdAt:"2026-06-01",notes:"Reforma baño completo. Incluye retirada de escombros."},
  {id:2,clientName:"Ana Gómez",phone:"+34 654 987 321",city:"Barcelona",
   items:[{svcId:"p_alisado",catLabel:"Pintura",svcLabel:"Alisado de paredes (quitar gota)",qty:85,unit:"m²",unitPrice:14,subtotal:1190,calcType:"m2"},
          {svcId:"p_plastica",catLabel:"Pintura",svcLabel:"Pintura plástica",qty:85,unit:"m²",unitPrice:7,subtotal:595,calcType:"m2"}],
   margin:35,totalBase:1785,totalLabor:625,totalFinal:2410,status:"Pendiente",createdAt:"2026-06-05",notes:"Piso completo 85m². Color blanco roto."},
  {id:3,clientName:"Luis Ríos",phone:"+34 699 111 222",city:"Valencia",
   items:[{svcId:"e_punto_luz",catLabel:"Electricidad",svcLabel:"Punto de luz",qty:12,unit:"ud",unitPrice:38,subtotal:456,calcType:"unit"},
          {svcId:"e_enchufe",catLabel:"Electricidad",svcLabel:"Punto de enchufe",qty:18,unit:"ud",unitPrice:35,subtotal:630,calcType:"unit"}],
   margin:45,totalBase:1086,totalLabor:489,totalFinal:1575,status:"Borrador",createdAt:"2026-06-08",notes:""},
];

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const Pill = ({label,color=T.blue,sm})=>(
  <span style={{display:"inline-flex",alignItems:"center",padding:sm?"2px 8px":"3px 11px",borderRadius:20,fontSize:sm?10:11,fontWeight:700,color,background:color+"18",lineHeight:1.4,whiteSpace:"nowrap"}}>{label}</span>
);

const Toggle = ({on,onToggle})=>(
  <div onClick={onToggle} style={{width:46,height:26,borderRadius:13,cursor:"pointer",flexShrink:0,background:on?T.blue:T.slateD,position:"relative",transition:"background 0.2s",boxShadow:on?`0 0 0 3px ${T.blue}22`:"none"}}>
    <div style={{position:"absolute",top:3,left:on?24:3,width:20,height:20,borderRadius:10,background:T.white,transition:"left 0.18s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:"0 2px 6px rgba(0,0,0,0.18)"}}/>
  </div>
);

const DarkHeader = ({children,pt="50px"})=>(
  <div style={{background:`linear-gradient(160deg,${T.navy} 0%,${T.navyLight} 100%)`,padding:`${pt} 18px 22px`,borderBottomLeftRadius:26,borderBottomRightRadius:26}}>
    {children}
  </div>
);

const BackBtn = ({onBack,label="Volver"})=>(
  <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",padding:0,marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
    <SVG d={I.back} color={T.textLight} size={18}/>
    <span style={{color:T.textLight,fontSize:13,fontWeight:600}}>{label}</span>
  </button>
);

const StepDots = ({step,total})=>(
  <div style={{display:"flex",gap:6,alignItems:"center",justifyContent:"center"}}>
    {Array.from({length:total}).map((_,i)=>(
      <div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?T.white:i<step?T.green:"rgba(255,255,255,0.2)",transition:"all 0.3s"}}/>
    ))}
  </div>
);

function Toast({msg,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,2400);return()=>clearTimeout(t);},[]);
  return (
    <div className="pi" style={{position:"fixed",top:22,left:"50%",transform:"translateX(-50%)",background:T.navyLight,color:T.white,padding:"11px 20px",borderRadius:22,fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 4px 24px rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.1)",whiteSpace:"nowrap",maxWidth:"90vw",overflow:"hidden",textOverflow:"ellipsis"}}>
      {msg}
    </div>
  );
}

// ─── FLOATING SUMMARY BAR ────────────────────────────────────────────────────
function FloatBar({basket,prices,margin,onContinue,onReset}){
  const base = basket.reduce((a,it)=>{
    const p=prices[it.svcId]??it.basePrice;
    return a+(it.calcType==="fixed"?p:(parseFloat(it.qty)||0)*p);
  },0);
  const total = base*(1+margin/100);
  if(!basket.length) return null;
  return (
    <div className="pi" style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 28px)",maxWidth:362,zIndex:200}}>
      <div style={{background:T.navyLight,borderRadius:18,padding:"12px 14px",border:"1px solid rgba(255,255,255,0.12)",boxShadow:"0 10px 36px rgba(0,0,0,0.55)",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:38,height:38,borderRadius:11,background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{color:T.white,fontSize:15,fontWeight:900}}>{basket.length}</span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {basket.map(b=>b.svcLabel).join(", ")}
          </p>
          <p style={{color:T.white,fontSize:17,fontWeight:900}}>{fmt(total)}</p>
        </div>
        <button onClick={onReset} style={{background:"rgba(255,255,255,0.07)",border:"none",cursor:"pointer",borderRadius:9,padding:"7px 10px",color:T.textLight,fontSize:12,fontWeight:600,flexShrink:0}}>✕</button>
        <button onClick={onContinue} style={{background:`linear-gradient(135deg,${T.blue},${T.blueL})`,border:"none",cursor:"pointer",borderRadius:13,padding:"11px 18px",color:T.white,fontSize:14,fontWeight:800,boxShadow:`0 4px 16px ${T.blue}50`,flexShrink:0}}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// ─── QUOTE FLOW ───────────────────────────────────────────────────────────────
function QuoteScreen({onBack,onSave,prices,activeCats,catalog}){
  const [phase,setPhase]      = useState("cats");
  const [selCat,setSelCat]    = useState(null);
  const [basket,setBasket]    = useState([]);
  const [inputIdx,setInputIdx]= useState(0);
  const [margin,setMargin]    = useState(40);
  const [client,setClient]    = useState({name:"",phone:"",city:""});
  const [notes,setNotes]      = useState("");
  const [saved,setSaved]      = useState(false);
  const [status,setStatus]    = useState("Borrador");
  const [toast,setToast]      = useState(null);
  const inputRef = useRef();

  const cats = catalog.filter(c=>activeCats[c.id]);
  const isSelected = id => basket.some(b=>b.svcId===id);
  const catForSvc = id => catalog.find(c=>c.services.some(s=>s.id===id));

  const makeItem = (cat,svc) => ({svcId:svc.id,catLabel:cat.label,svcLabel:svc.label,calcType:svc.calcType,basePrice:svc.basePrice,unit:svc.unit,qty:svc.calcType==="fixed"?"1":""});

  const tapSvc = (cat,svc) => {
    if(isSelected(svc.id)){
      setBasket(b=>b.filter(x=>x.svcId!==svc.id));
      return;
    }
    const wasEmpty = basket.length===0;
    const item = makeItem(cat,svc);
    if(wasEmpty){
      setBasket([item]);
      if(svc.calcType==="fixed") setTimeout(()=>setPhase("result"),80);
      else { setInputIdx(0); setTimeout(()=>setPhase("input"),80); }
    } else {
      setBasket(b=>[...b,item]);
    }
  };

  const goToInput = () => {
    const firstNF = basket.findIndex(b=>b.calcType!=="fixed");
    if(firstNF===-1){ setPhase("result"); return; }
    setInputIdx(firstNF);
    setPhase("input");
  };

  const advanceInput = idx => {
    let next = idx+1;
    while(next<basket.length && basket[next].calcType==="fixed") next++;
    if(next>=basket.length) setPhase("result");
    else setInputIdx(next);
  };

  const updateQty = (idx,val) => setBasket(b=>b.map((it,i)=>i===idx?{...it,qty:val}:it));

  useEffect(()=>{
    if(phase==="input" && basket[inputIdx]?.calcType!=="fixed"){
      const t=setTimeout(()=>inputRef.current?.focus(),80);
      return()=>clearTimeout(t);
    }
  },[phase,inputIdx]);

  const calcItem = it => {
    const p = prices[it.svcId]??it.basePrice;
    const q = it.calcType==="fixed"?1:(parseFloat(it.qty)||0);
    return {qty:q,unitPrice:p,subtotal:q*p};
  };
  const totalBase  = basket.reduce((a,it)=>a+calcItem(it).subtotal,0);
  const totalLabor = totalBase*(margin/100);
  const totalFinal = totalBase+totalLabor;

  const doSave = () => {
    const items = basket.map(it=>({...it,...calcItem(it)}));
    onSave({id:Date.now(),clientName:client.name||"Sin cliente",phone:client.phone,city:client.city,items,margin,totalBase,totalLabor,totalFinal,status,createdAt:today(),notes});
    setSaved(true);
    setToast("✅ Presupuesto guardado");
  };

  const reset = () => {setPhase("cats");setSelCat(null);setBasket([]);setInputIdx(0);setMargin(40);setClient({name:"",phone:"",city:""});setNotes("");setSaved(false);setStatus("Borrador");};

  const phaseStep = (phase==="cats"||phase==="services")?0:phase==="input"?1:2;

  // Group basket items by category for the result table
  const groupedItems = (() => {
    const g = {};
    basket.forEach(it=>{ (g[it.catLabel]=g[it.catLabel]||[]).push(it); });
    return g;
  })();

  return (
    <div style={{minHeight:"100vh",background:T.slate,paddingBottom:40}}>
      {toast && <Toast msg={toast} onClose={()=>setToast(null)}/>}

      <DarkHeader>
        <BackBtn onBack={onBack}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{width:40,height:40,borderRadius:12,background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <SVG d={I.zap} color={T.white} size={22} fill={T.white}/>
          </div>
          <div style={{flex:1}}>
            <h2 style={{color:T.white,fontSize:18,fontWeight:900,lineHeight:1.1}}>Presupuesto de reforma</h2>
            <p style={{color:T.textLight,fontSize:12,marginTop:2}}>
              {(phase==="cats"||phase==="services")&&"Abre capítulos y marca partidas — combina los que quieras"}
              {phase==="input"&&"Introduce las mediciones"}
              {phase==="result"&&"Presupuesto generado"}
            </p>
          </div>
          {basket.length>0&&phase!=="result"&&(
            <div className="pi" style={{width:30,height:30,borderRadius:15,background:T.blue,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:T.white,fontSize:13,fontWeight:900}}>{basket.length}</span>
            </div>
          )}
        </div>
        <StepDots step={phaseStep} total={3}/>
      </DarkHeader>

      <div style={{padding:"18px 16px 100px"}}>

        {/* ═══ FASE 1: SELECTOR COMBINADO ═══
            Categorías siempre visibles + partidas desplegables en la misma pantalla */}
        {(phase==="cats"||phase==="services")&&(
          <div className="su">

            {/* Resumen carrito — visible si hay algo seleccionado */}
            {basket.length>0&&(
              <div className="pi" style={{background:T.navyLight,borderRadius:16,padding:"12px 16px",marginBottom:16,border:"1px solid rgba(255,255,255,0.1)"}}>
                <p style={{color:"rgba(255,255,255,0.5)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>
                  Partidas seleccionadas ({basket.length})
                </p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                  {basket.map(it=>{
                    const cap = catForSvc(it.svcId);
                    return (
                      <div key={it.svcId} style={{display:"flex",alignItems:"center",gap:5,background:(cap?.color||T.blue)+"20",borderRadius:20,padding:"4px 10px 4px 7px",border:`1px solid ${(cap?.color||T.blue)}30`}}>
                        <span style={{fontSize:12}}>{cap?.emoji}</span>
                        <span style={{fontSize:12,fontWeight:700,color:cap?.color||T.blue}}>{it.svcLabel}</span>
                        <button onClick={()=>setBasket(b=>b.filter(x=>x.svcId!==it.svcId))} style={{background:"none",border:"none",cursor:"pointer",color:T.textMid,fontSize:14,lineHeight:1,padding:"0 2px",marginLeft:2}}>×</button>
                      </div>
                    );
                  })}
                </div>
                <button onClick={goToInput} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.blue},${T.blueL})`,color:T.white,fontSize:15,fontWeight:800,boxShadow:`0 3px 14px ${T.blue}40`}}>
                  Calcular presupuesto →
                </button>
              </div>
            )}

            <p style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
              Toca un capítulo para ver sus partidas
            </p>

            {/* Acordeón: categorías + partidas en la misma pantalla */}
            {cats.map(cat=>{
              const isOpen = selCat?.id===cat.id;
              const selCount = basket.filter(b=>cat.services.some(s=>s.id===b.svcId)).length;
              return (
                <div key={cat.id} style={{marginBottom:8,borderRadius:16,overflow:"hidden",border:`2px solid ${selCount>0?cat.color:isOpen?cat.color+"60":T.slateD}`,transition:"border-color 0.2s"}}>

                  {/* Cabecera del capítulo */}
                  <button onClick={()=>setSelCat(isOpen?null:cat)} style={{
                    width:"100%",padding:"14px 16px",background:isOpen?cat.color+"0E":selCount>0?cat.color+"07":T.white,
                    border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left"
                  }}>
                    <span style={{fontSize:26,lineHeight:1}}>{cat.emoji}</span>
                    <div style={{flex:1}}>
                      <p style={{fontSize:15,fontWeight:800,color:isOpen||selCount>0?cat.color:T.text}}>{cat.label}</p>
                      <p style={{fontSize:11,color:T.textMid,marginTop:1}}>
                        {selCount>0?`${selCount} partida${selCount!==1?"s":""} añadida${selCount!==1?"s":""}`:`${cat.services.length} partidas disponibles`}
                      </p>
                    </div>
                    {selCount>0&&(
                      <div style={{width:22,height:22,borderRadius:11,background:T.green,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <SVG d={I.check} color={T.white} size={12}/>
                      </div>
                    )}
                    <div style={{width:28,height:28,borderRadius:8,background:isOpen?cat.color+"15":T.slate,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                      <SVG d={I.chevron} color={isOpen?cat.color:T.textMid} size={16} style={{transform:isOpen?"rotate(90deg)":"none",transition:"transform 0.2s"}}/>
                    </div>
                  </button>

                  {/* Partidas desplegadas */}
                  {isOpen&&(
                    <div className="su" style={{background:T.white,borderTop:`1px solid ${cat.color}20`}}>
                      {cat.services.map((svc,si)=>{
                        const sel = isSelected(svc.id);
                        const p = prices[svc.id]??svc.basePrice;
                        return (
                          <button key={svc.id} onClick={()=>{
                            if(isSelected(svc.id)){
                              setBasket(b=>b.filter(x=>x.svcId!==svc.id));
                            } else {
                              setBasket(b=>[...b,makeItem(cat,svc)]);
                            }
                          }} style={{
                            width:"100%",padding:"12px 16px 12px 20px",
                            borderBottom:si<cat.services.length-1?`1px solid ${T.slate}`:"none",
                            border:"none",background:sel?cat.color+"0A":T.white,
                            cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,textAlign:"left"
                          }}>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{fontSize:14,fontWeight:sel?800:600,color:sel?cat.color:T.text,lineHeight:1.3}}>
                                {svc.label}
                                {svc.custom&&<span style={{marginLeft:6}}><Pill label="Propia" color={T.purple} sm/></span>}
                              </p>
                              <p style={{fontSize:12,color:T.textMid,marginTop:1}}>
                                {svc.calcType==="fixed"?`S/ ${p} precio fijo`:`S/ ${p} / ${svc.unit}`}
                              </p>
                            </div>
                            <div style={{width:32,height:32,borderRadius:10,background:sel?cat.color:T.slate,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.15s",boxShadow:sel?`0 2px 8px ${cat.color}40`:"none"}}>
                              <SVG d={sel?I.check:I.plus} color={sel?T.white:T.textMid} size={15}/>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Botón calcular al fondo si hay selección */}
            {basket.length>0&&(
              <button onClick={goToInput} style={{width:"100%",marginTop:12,padding:"16px",borderRadius:14,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.blue},${T.blueL})`,color:T.white,fontSize:15,fontWeight:800,boxShadow:`0 4px 16px ${T.blue}40`}}>
                Calcular presupuesto · {basket.length} partida{basket.length!==1?"s":""} →
              </button>
            )}
          </div>
        )}

        {/* ═══ PHASE: mediciones ═══ */}
        {phase==="input"&&(
          <div className="su">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <p style={{fontSize:12,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.4}}>Introduce las mediciones</p>
              <button onClick={()=>{setSelCat(null);setPhase("cats");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:T.blue}}>+ Añadir más</button>
            </div>

            {basket.map((it,idx)=>{
              const isCurr = idx===inputIdx;
              const cat    = catForSvc(it.svcId);
              const p      = prices[it.svcId]??it.basePrice;
              const q      = parseFloat(it.qty)||0;
              const sub    = it.calcType==="fixed"?p:q*p;
              const done   = it.qty&&q>0&&idx<inputIdx;

              if(it.calcType==="fixed") return (
                <div key={it.svcId} style={{background:T.greenPale,borderRadius:14,border:`1.5px solid ${T.green}30`,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <p style={{fontSize:13,fontWeight:800,color:T.greenD}}>{it.svcLabel}</p>
                    <p style={{fontSize:11,color:T.greenD,opacity:.7}}>Precio cerrado · auto-incluido</p>
                  </div>
                  <p style={{fontSize:15,fontWeight:900,color:T.greenD}}>{fmt(p)}</p>
                </div>
              );

              if(!isCurr && done) return (
                <button key={it.svcId} onClick={()=>setInputIdx(idx)} style={{width:"100%",background:T.white,borderRadius:14,border:`1.5px solid ${T.slateD}`,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:26,height:26,borderRadius:13,background:T.green,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <SVG d={I.check} color={T.white} size={13}/>
                    </div>
                    <div style={{textAlign:"left"}}>
                      <p style={{fontSize:13,fontWeight:700,color:T.text}}>{it.svcLabel}</p>
                      <p style={{fontSize:11,color:T.textMid}}>{it.qty} {it.unit} × S/ {p}</p>
                    </div>
                  </div>
                  <p style={{fontSize:14,fontWeight:800,color:T.blue}}>{fmt(sub)}</p>
                </button>
              );

              if(!isCurr) return (
                <div key={it.svcId} style={{background:T.white,borderRadius:14,border:`1.5px solid ${T.slateD}`,padding:"12px 16px",marginBottom:8,opacity:.45}}>
                  <p style={{fontSize:13,fontWeight:700,color:T.textMid}}>{it.svcLabel}</p>
                  <p style={{fontSize:11,color:T.textLight}}>Pendiente…</p>
                </div>
              );

              return (
                <div key={it.svcId} className="pi" style={{background:T.white,borderRadius:20,border:`2.5px solid ${cat?.color||T.blue}`,padding:"18px 16px",marginBottom:10,boxShadow:`0 6px 22px ${cat?.color||T.blue}20`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:11,fontWeight:700,color:cat?.color,textTransform:"uppercase",letterSpacing:.5}}>{it.catLabel}</p>
                      <p style={{fontSize:16,fontWeight:900,color:T.text,marginTop:2,lineHeight:1.25}}>{it.svcLabel}</p>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                      <p style={{fontSize:13,color:T.textMid,fontWeight:600}}>S/ {p}/{it.unit}</p>
                      {q>0&&<p style={{fontSize:12,color:T.blue,fontWeight:700,marginTop:2}}>{fmt(sub)}</p>}
                    </div>
                  </div>

                  <p style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>
                    {it.calcType==="m2"?"Dimensiones (m²)":it.calcType==="hour"?"Horas estimadas":"Cantidad (unidades)"}
                  </p>
                  <div style={{position:"relative",marginBottom:12}}>
                    <input ref={inputRef} type="number" value={it.qty}
                      onChange={e=>updateQty(idx,e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&it.qty)advanceInput(idx);}}
                      placeholder="0" inputMode="decimal"
                      style={{width:"100%",padding:"18px 60px 18px 22px",borderRadius:16,fontSize:50,fontWeight:900,border:`2px solid ${q>0?cat?.color||T.blue:T.slateD}`,outline:"none",fontFamily:"inherit",color:T.text,background:T.slate,textAlign:"center",transition:"border-color 0.15s"}}
                    />
                    <span style={{position:"absolute",right:20,top:"50%",transform:"translateY(-50%)",fontSize:14,fontWeight:700,color:T.textMid}}>{it.unit}</span>
                  </div>

                  <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
                    {PRESETS[it.calcType||"m2"].map(n=>{
                      const active=String(it.qty)===String(n);
                      return (
                        <button key={n} onClick={()=>{updateQty(idx,String(n));setTimeout(()=>advanceInput(idx),160);}}
                          style={{padding:"10px 16px",borderRadius:24,border:`2px solid ${active?cat?.color||T.blue:T.slateD}`,background:active?(cat?.color||T.blue)+"12":T.white,cursor:"pointer",fontSize:15,fontWeight:800,color:active?cat?.color||T.blue:T.textMid}}>
                          {n}
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={()=>{if(it.qty)advanceInput(idx);}} disabled={!it.qty}
                    style={{width:"100%",padding:"15px",borderRadius:14,border:"none",cursor:it.qty?"pointer":"default",background:it.qty?`linear-gradient(135deg,${cat?.color||T.blue},${T.blueL})`:T.slateD,color:T.white,fontSize:15,fontWeight:800,boxShadow:it.qty?`0 4px 14px ${cat?.color||T.blue}35`:"none"}}>
                    {basket.slice(idx+1).every(b=>b.calcType==="fixed")?"Ver presupuesto →":"Siguiente →"}
                  </button>
                </div>
              );
            })}

            <div style={{background:T.white,borderRadius:16,border:`1px solid ${T.slateD}`,padding:"14px 16px",marginTop:6}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:700,color:T.text}}>Mano de obra / beneficio</span>
                <span style={{fontSize:14,fontWeight:900,color:T.blue}}>{margin}%</span>
              </div>
              <input type="range" min={0} max={120} step={5} value={margin} onChange={e=>setMargin(parseInt(e.target.value))}/>
            </div>
          </div>
        )}

        {/* ═══ PHASE: resultado ═══ */}
        {phase==="result"&&(
          <div className="su">
            {/* Hero */}
            <div style={{background:`linear-gradient(148deg,${T.blue} 0%,${T.blueL} 100%)`,borderRadius:22,padding:"26px 22px 22px",marginBottom:14,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-50,right:-50,width:180,height:180,borderRadius:90,background:"rgba(255,255,255,0.06)"}}/>
              <div style={{position:"absolute",bottom:-30,left:-20,width:130,height:130,borderRadius:65,background:"rgba(255,255,255,0.04)"}}/>
              <p style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6,position:"relative"}}>Presupuesto total</p>
              <p style={{color:T.white,fontSize:54,fontWeight:900,letterSpacing:-3,lineHeight:1,position:"relative"}}>{fmt(totalFinal)}</p>
              <div style={{display:"flex",gap:20,marginTop:14,position:"relative"}}>
                <div>
                  <p style={{color:"rgba(255,255,255,0.45)",fontSize:10,textTransform:"uppercase",letterSpacing:.4}}>Ejecución material</p>
                  <p style={{color:"rgba(255,255,255,0.9)",fontSize:15,fontWeight:700,marginTop:2}}>{fmt(totalBase)}</p>
                </div>
                <div style={{width:1,background:"rgba(255,255,255,0.15)"}}/>
                <div>
                  <p style={{color:"rgba(255,255,255,0.45)",fontSize:10,textTransform:"uppercase",letterSpacing:.4}}>M. obra / beneficio ({margin}%)</p>
                  <p style={{color:"rgba(255,255,255,0.9)",fontSize:15,fontWeight:700,marginTop:2}}>{fmt(totalLabor)}</p>
                </div>
              </div>
            </div>

            {/* Grouped breakdown by chapter */}
            <div style={{background:T.white,borderRadius:16,border:`1px solid ${T.slateD}`,overflow:"hidden",marginBottom:12}}>
              {Object.entries(groupedItems).map(([catLabel,items],gi)=>{
                const cat = catalog.find(c=>c.label===catLabel);
                const chapTotal = items.reduce((a,it)=>a+calcItem(it).subtotal,0);
                return (
                  <div key={catLabel}>
                    {/* Chapter header */}
                    <div style={{background:(cat?.color||T.blue)+"10",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:gi>0?`1px solid ${T.slateD}`:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:15}}>{cat?.emoji||"📋"}</span>
                        <p style={{fontSize:12,fontWeight:800,color:cat?.color||T.blue,textTransform:"uppercase",letterSpacing:.4}}>{catLabel}</p>
                      </div>
                      <p style={{fontSize:13,fontWeight:800,color:cat?.color||T.blue}}>{fmt(chapTotal)}</p>
                    </div>
                    {/* Chapter items */}
                    {items.map((it,i)=>{
                      const {qty,unitPrice,subtotal} = calcItem(it);
                      return (
                        <div key={it.svcId} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,alignItems:"center",padding:"11px 16px",borderBottom:`1px solid ${T.slate}`}}>
                          <p style={{fontSize:13,fontWeight:600,color:T.text,lineHeight:1.3}}>{it.svcLabel}</p>
                          <p style={{fontSize:11,color:T.textMid,textAlign:"right",whiteSpace:"nowrap"}}>
                            {it.calcType==="fixed"?"1 ud":`${qty} ${it.unit} × S/ ${unitPrice}`}
                          </p>
                          <p style={{fontSize:13,fontWeight:800,color:T.text,textAlign:"right",minWidth:60}}>{fmt(subtotal)}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {/* Grand totals */}
              <div style={{padding:"12px 16px",borderTop:`1px solid ${T.slateD}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:T.textMid}}>Ejecución material</span>
                  <span style={{fontSize:13,fontWeight:700,color:T.text}}>{fmt(totalBase)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:12,color:T.textMid}}>Mano de obra ({margin}%)</span>
                  <span style={{fontSize:13,fontWeight:700,color:T.text}}>{fmt(totalLabor)}</span>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:T.bluePale}}>
                <span style={{fontSize:14,fontWeight:800,color:T.text}}>TOTAL PRESUPUESTO</span>
                <span style={{fontSize:20,fontWeight:900,color:T.blue}}>{fmt(totalFinal)}</span>
              </div>
            </div>

            {/* Margin adjust */}
            <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,padding:"14px 16px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:700,color:T.text}}>Ajustar mano de obra</span>
                <span style={{fontSize:15,fontWeight:900,color:T.blue}}>{margin}% · {fmt(totalLabor)}</span>
              </div>
              <input type="range" min={0} max={120} step={5} value={margin} onChange={e=>setMargin(parseInt(e.target.value))} style={{marginBottom:8}}/>
              <div style={{display:"flex",gap:6}}>
                {[0,25,40,60,80,100].map(v=>(
                  <button key={v} onClick={()=>setMargin(v)} style={{flex:1,padding:"7px 2px",borderRadius:10,border:`1.5px solid ${margin===v?T.blue:T.slateD}`,background:margin===v?T.bluePale:"none",cursor:"pointer",fontSize:11,fontWeight:800,color:margin===v?T.blue:T.textMid}}>
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            {/* Client */}
            <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,padding:"14px 16px",marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Cliente (opcional)</p>
              {[
                {k:"name", ph:"Nombre del cliente",  icon:I.user},
                {k:"phone",ph:"Teléfono / WhatsApp", icon:I.phone},
                {k:"city", ph:"Ciudad / Dirección obra", icon:I.tag},
              ].map((f,i)=>(
                <div key={f.k} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<2?`1px solid ${T.slateD}`:"none"}}>
                  <SVG d={f.icon} color={T.textLight} size={16}/>
                  <input value={client[f.k]} onChange={e=>setClient(c=>({...c,[f.k]:e.target.value}))}
                    placeholder={f.ph} style={{flex:1,border:"none",outline:"none",fontSize:14,color:T.text,background:"transparent"}}/>
                </div>
              ))}
            </div>

            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="📝 Condiciones, exclusiones, plazos… (visible en PDF)"
              style={{width:"100%",padding:"13px 16px",borderRadius:12,fontSize:14,border:`1.5px solid ${T.slateD}`,outline:"none",color:T.text,background:T.white,resize:"none",minHeight:72,marginBottom:12}}/>

            {/* Status */}
            <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,padding:"12px 16px",marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Estado</p>
              <div style={{display:"flex",gap:8}}>
                {["Borrador","Pendiente","Aprobado"].map(s=>{
                  const active=status===s;
                  const sc=s==="Aprobado"?T.green:s==="Pendiente"?T.amber:T.textMid;
                  return (
                    <button key={s} onClick={()=>setStatus(s)} style={{flex:1,padding:"10px 4px",borderRadius:12,border:`2px solid ${active?sc:T.slateD}`,background:active?sc+"12":"none",cursor:"pointer",fontSize:12,fontWeight:800,color:active?sc:T.textMid}}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <button onClick={doSave} style={{padding:"16px",borderRadius:14,border:saved?`1.5px solid ${T.green}30`:"none",cursor:"pointer",background:saved?T.greenPale:`linear-gradient(135deg,${T.green},${T.greenD})`,color:saved?T.green:T.white,fontSize:14,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:saved?"none":`0 4px 16px ${T.green}35`}}>
                {saved?<><SVG d={I.check} color={T.green} size={16}/>Guardado</>:<><SVG d={I.save} color={T.white} size={15}/>Guardar</>}
              </button>
              <button onClick={()=>{if(!saved)doSave();setToast("💬 Abriendo WhatsApp…");}} style={{padding:"16px",borderRadius:14,border:"2px solid #25D36640",background:"#25D36612",cursor:"pointer",fontSize:14,fontWeight:800,color:"#128C7E",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <SVG d={I.wa} color="#128C7E" size={16}/>WhatsApp
              </button>
            </div>
            <button onClick={()=>{if(!saved)doSave();setToast("📄 Generando PDF…");}} style={{width:"100%",padding:"15px",borderRadius:14,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",fontSize:14,fontWeight:700,color:T.text,display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:10}}>
              <SVG d={I.pdf} color={T.red} size={18}/>Generar y enviar PDF
            </button>
            {saved&&(
              <button onClick={()=>{window.dispatchEvent(new CustomEvent("gotoInvoices"));}}
                style={{width:"100%",padding:"15px",borderRadius:14,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.green},${T.greenD})`,color:T.white,fontSize:15,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:10,boxShadow:`0 4px 16px ${T.green}35`}}>
                <SVG d={I.receipt} color={T.white} size={18}/>Convertir en Factura →
              </button>
            )}
            <button onClick={reset} style={{width:"100%",padding:"13px",borderRadius:14,border:`1.5px dashed ${T.slateD}`,background:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:T.textMid}}>
              + Nuevo presupuesto
            </button>
          </div>
        )}
      </div>

      {phase==="input"&&basket.length>0&&(
        <FloatBar basket={basket} prices={prices} margin={margin} onContinue={goToInput} onReset={()=>setBasket([])}/>
      )}
    </div>
  );
}

// ─── PDF MODAL ────────────────────────────────────────────────────────────────
function PDFModal({q,onClose,onToast,catalog}){
  const items = q?.items||[];
  const [copied,setCopied] = useState(false);

  // Group items by chapter
  const grouped = {};
  items.forEach(it=>{ (grouped[it.catLabel]=grouped[it.catLabel]||[]).push(it); });

  const waMsg = `Hola ${q?.clientName||""},\n\nTe envío el presupuesto de la reforma:\n\n${Object.entries(grouped).map(([c,its])=>`▸ ${c.toUpperCase()}\n${its.map(i=>`  • ${i.svcLabel}: ${fmt(i.subtotal)}`).join("\n")}`).join("\n\n")}\n\nEjecución: ${fmt(q?.totalBase)}\nMano de obra (${q?.margin}%): ${fmt(q?.totalLabor)}\nTOTAL: ${fmt(q?.totalFinal)}\n\nGenerado con DARIVO PRO`;

  const copyWA = ()=>{navigator.clipboard?.writeText(waMsg).catch(()=>{});setCopied(true);onToast("✅ Mensaje copiado");setTimeout(()=>setCopied(false),2000);};

  return (
    <div className="fi" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end"}}>
      <div className="su" style={{background:T.white,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:390,maxHeight:"90vh",overflow:"auto"}}>
        <div style={{background:T.navyLight,padding:"18px 18px 14px",borderRadius:"22px 22px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:10,background:T.red,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <SVG d={I.pdf} color={T.white} size={17}/>
            </div>
            <div>
              <p style={{color:T.white,fontSize:14,fontWeight:800}}>Presupuesto #{q?.id}</p>
              <p style={{color:T.textLight,fontSize:11}}>{q?.createdAt} · DARIVO PRO</p>
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",cursor:"pointer",borderRadius:20,padding:"8px 12px"}}>
            <SVG d={I.x} color={T.textLight} size={16}/>
          </button>
        </div>

        <div style={{padding:"20px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{width:28,height:28,borderRadius:8,background:T.blue,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:T.white,fontSize:11,fontWeight:900}}>D</span>
                </div>
                <p style={{fontSize:14,fontWeight:800,color:T.text}}>DARIVO PRO</p>
              </div>
              <p style={{fontSize:11,color:T.textMid}}>Reformas integrales</p>
            </div>
            <div style={{textAlign:"right"}}>
              <p style={{fontSize:13,fontWeight:800,color:T.text}}>{q?.clientName||"Sin cliente"}</p>
              {q?.phone&&<p style={{fontSize:11,color:T.textMid}}>{q?.phone}</p>}
              {q?.city&&<p style={{fontSize:11,color:T.textMid}}>{q?.city}</p>}
            </div>
          </div>

          {/* Chaptered table */}
          <div style={{border:`1px solid ${T.slateD}`,borderRadius:12,overflow:"hidden",marginBottom:16}}>
            {Object.entries(grouped).map(([catLabel,its])=>{
              const cat = catalog?.find(c=>c.label===catLabel);
              const chapTotal = its.reduce((a,i)=>a+i.subtotal,0);
              return (
                <div key={catLabel}>
                  <div style={{background:T.navyLight,padding:"9px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <p style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.8)",textTransform:"uppercase",letterSpacing:.4}}>{cat?.emoji} {catLabel}</p>
                    <p style={{fontSize:12,fontWeight:800,color:T.white}}>{fmt(chapTotal)}</p>
                  </div>
                  {its.map((it,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr auto auto",padding:"11px 14px",gap:8,alignItems:"center",borderBottom:`1px solid ${T.slate}`,background:i%2===0?T.white:T.slate+"60"}}>
                      <p style={{fontSize:12,fontWeight:600,color:T.text,lineHeight:1.3}}>{it.svcLabel}</p>
                      <p style={{fontSize:11,color:T.textMid,whiteSpace:"nowrap"}}>{it.calcType==="fixed"?"1 ud":`${it.qty} ${it.unit}`}</p>
                      <p style={{fontSize:12,fontWeight:800,color:T.text,textAlign:"right",minWidth:55}}>{fmt(it.subtotal)}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div style={{background:T.slate,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
            {[
              {l:"Ejecución material",v:q?.totalBase},
              {l:`Mano de obra (${q?.margin}%)`,v:q?.totalLabor},
            ].map(r=>(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:13,color:T.textMid}}>{r.l}</span>
                <span style={{fontSize:13,fontWeight:700,color:T.text}}>{fmt(r.v)}</span>
              </div>
            ))}
            <div style={{borderTop:`1.5px solid ${T.slateD}`,paddingTop:10,marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:15,fontWeight:800,color:T.text}}>TOTAL</span>
              <span style={{fontSize:22,fontWeight:900,color:T.blue}}>{fmt(q?.totalFinal)}</span>
            </div>
          </div>

          {q?.notes&&<div style={{background:T.amberPale,borderRadius:10,padding:"10px 14px",marginBottom:16,border:`1px solid ${T.amber}25`}}>
            <p style={{fontSize:11,fontWeight:700,color:T.amberD,marginBottom:3}}>CONDICIONES / NOTAS</p>
            <p style={{fontSize:13,color:T.text}}>{q?.notes}</p>
          </div>}

          <p style={{fontSize:10,color:T.textLight,textAlign:"center",marginBottom:16}}>Generado con DARIVO PRO · darivo.app · Validez 30 días</p>

          <div style={{background:T.navyLight,borderRadius:12,padding:"12px 14px",marginBottom:14}}>
            <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Mensaje WhatsApp</p>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.7)",lineHeight:1.6,whiteSpace:"pre-wrap",fontFamily:"monospace"}}>{waMsg}</p>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <button onClick={copyWA} style={{padding:"14px",borderRadius:13,border:"2px solid #25D36640",background:copied?"#25D36625":"#25D36610",cursor:"pointer",fontSize:14,fontWeight:800,color:"#128C7E",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <SVG d={I.wa} color="#128C7E" size={16}/>{copied?"Copiado":"WhatsApp"}
            </button>
            <button style={{padding:"14px",borderRadius:13,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",fontSize:14,fontWeight:700,color:T.text,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <SVG d={I.share} color={T.textMid} size={16}/>Compartir
            </button>
          </div>
          <button onClick={onClose} style={{width:"100%",padding:"13px",borderRadius:13,border:`1.5px solid ${T.slateD}`,background:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:T.textMid}}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ─── CLIENT DETAIL ────────────────────────────────────────────────────────────
function ClientDetail({client,quotes,onBack,onNewQuote,onViewPDF,onChangeStatus,onToast,onEditQuote,onDuplicateQuote,onDeleteQuote,onConvertQuote,onShareQuote}){
  const clientQuotes = quotes.filter(q=>q.clientName===client.name);
  const total = clientQuotes.reduce((a,q)=>a+q.totalFinal,0);
  const approved = clientQuotes.filter(q=>q.status==="Aprobado");

  return (
    <div style={{minHeight:"100vh",background:T.slate,paddingBottom:80}}>
      <DarkHeader>
        <BackBtn onBack={onBack} label="Clientes"/>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
          <div style={{width:56,height:56,borderRadius:28,background:`linear-gradient(135deg,${T.blue},${T.blueL})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{color:T.white,fontSize:22,fontWeight:900}}>{client.name[0]}</span>
          </div>
          <div>
            <h2 style={{color:T.white,fontSize:20,fontWeight:900}}>{client.name}</h2>
            {client.city&&<p style={{color:T.textLight,fontSize:13,marginTop:2}}>{client.city}</p>}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[
            {icon:I.wa,   l:"WhatsApp",color:"#25D366",a:()=>window.open(`https://wa.me/${(client.phone||"").replace(/\D/g,"")}`)},
            {icon:I.phone,l:"Llamar",  color:T.green,  a:()=>window.open(`tel:${client.phone||""}`)},
            {icon:I.mail, l:"Email",   color:T.blue,   a:()=>onToast("✉️ Sin email registrado")},
          ].map(b=>(
            <button key={b.l} onClick={b.a} style={{padding:"11px",borderRadius:14,border:"1.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.07)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
              <SVG d={b.icon} color={b.color} size={20}/>
              <span style={{fontSize:11,fontWeight:700,color:T.textLight}}>{b.l}</span>
            </button>
          ))}
        </div>
      </DarkHeader>

      <div style={{padding:"18px 16px 0"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:20}}>
          {[
            {l:"Presupuestos",v:clientQuotes.length,c:T.blue},
            {l:"Aprobados",   v:approved.length,    c:T.green},
            {l:"Total S/",    v:fmt(total),         c:T.amber,sm:true},
          ].map(s=>(
            <div key={s.l} style={{background:T.white,borderRadius:13,padding:"12px",border:`1px solid ${T.slateD}`,textAlign:"center"}}>
              <p style={{fontSize:s.sm?13:22,fontWeight:900,color:s.c}}>{s.v}</p>
              <p style={{fontSize:10,color:T.textMid,marginTop:3}}>{s.l}</p>
            </div>
          ))}
        </div>

        {(client.phone||client.city)&&(
          <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,padding:"12px 16px",marginBottom:20}}>
            <p style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Contacto</p>
            {client.phone&&<div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:client.city?`1px solid ${T.slateD}`:"none"}}>
              <SVG d={I.phone} color={T.textMid} size={15}/><span style={{fontSize:14,color:T.text}}>{client.phone}</span>
            </div>}
            {client.city&&<div style={{display:"flex",alignItems:"center",gap:10,paddingTop:client.phone?8:0}}>
              <SVG d={I.tag} color={T.textMid} size={15}/><span style={{fontSize:14,color:T.text}}>{client.city}</span>
            </div>}
          </div>
        )}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <p style={{fontSize:13,fontWeight:700,color:T.text}}>Historial</p>
          <button onClick={onNewQuote} style={{background:`${T.blue}12`,border:"none",cursor:"pointer",borderRadius:10,padding:"7px 12px",color:T.blue,fontSize:12,fontWeight:800}}>+ Nuevo</button>
        </div>
        {clientQuotes.map(q=>{
          const sc=q.status==="Aprobado"?T.green:q.status==="Pendiente"?T.amber:T.textMid;
          return (
            <div key={q.id} style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,padding:"13px 15px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:700,color:T.text,lineHeight:1.4}}>
                    {q.items?.map(i=>i.svcLabel).join(" + ").slice(0,50)||"Presupuesto"}
                  </p>
                  <p style={{fontSize:11,color:T.textMid,marginTop:2}}>{q.createdAt} · {q.items?.length} partida{q.items?.length!==1?"s":""}</p>
                </div>
                <p style={{fontSize:16,fontWeight:900,color:T.blue,marginLeft:10,flexShrink:0}}>{fmt(q.totalFinal)}</p>
              </div>
              {/* Estado + PDF */}
              <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
                {["Borrador","Pendiente","Aprobado"].map(s=>(
                  <button key={s} onClick={()=>onChangeStatus(q.id,s)} style={{padding:"4px 10px",borderRadius:14,border:`1.5px solid ${s===q.status?sc:T.slateD}`,background:s===q.status?sc+"12":"none",cursor:"pointer",fontSize:10,fontWeight:700,color:s===q.status?sc:T.textLight}}>
                    {s}
                  </button>
                ))}
                <button onClick={()=>onViewPDF(q)} style={{marginLeft:"auto",padding:"5px 11px",borderRadius:14,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  <SVG d={I.pdf} color={T.red} size={13}/>
                  <span style={{fontSize:10,fontWeight:700,color:T.textMid}}>PDF</span>
                </button>
              </div>
              {/* Acciones */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:10,borderTop:`1px solid ${T.slateD}`}}>
                <button onClick={()=>onEditQuote&&onEditQuote(q)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:12,border:`1.5px solid ${T.slateD}`,background:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:T.textMid}}>
                  <SVG d={I.edit} color={T.textMid} size={12}/>Editar
                </button>
                <button onClick={()=>onDuplicateQuote&&onDuplicateQuote(q)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:12,border:`1.5px solid ${T.blue}30`,background:`${T.blue}08`,cursor:"pointer",fontSize:11,fontWeight:700,color:T.blue}}>
                  <SVG d={I.convert} color={T.blue} size={12}/>Re-cotizar
                </button>
                <button onClick={()=>onShareQuote&&onShareQuote(q)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:12,border:`1.5px solid ${T.slateD}`,background:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:T.textMid}}>
                  <SVG d={I.share} color={T.textMid} size={12}/>Compartir
                </button>
                {q.status==="Aprobado"&&(
                  <button onClick={()=>onConvertQuote&&onConvertQuote(q)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:12,border:`1.5px solid ${T.green}35`,background:`${T.green}08`,cursor:"pointer",fontSize:11,fontWeight:700,color:T.green}}>
                    <SVG d={I.receipt} color={T.green} size={12}/>Facturar
                  </button>
                )}
                <button onClick={()=>onDeleteQuote&&onDeleteQuote(q)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:12,border:`1.5px solid ${T.red}30`,background:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:T.red,marginLeft:"auto"}}>
                  <SVG d={I.trash} color={T.red} size={12}/>Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({onNav,quotes,catalog}){
  const approved = quotes.filter(q=>q.status==="Aprobado");
  const pending  = quotes.filter(q=>q.status==="Pendiente");
  const revenue  = approved.reduce((a,q)=>a+q.totalFinal,0);

  return (
    <div style={{paddingBottom:90}}>
      <DarkHeader>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <p style={{color:T.textLight,fontSize:13,fontWeight:500,marginBottom:3}}>¡Hola de nuevo!</p>
            <h1 style={{color:T.white,fontSize:24,fontWeight:900,lineHeight:1.1}}>Usuario Pro 👷</h1>
          </div>
          <div style={{background:T.blue,borderRadius:14,padding:"8px 13px",display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:8,height:8,borderRadius:4,background:T.white,boxShadow:"0 0 8px rgba(255,255,255,0.8)"}}/>
            <span style={{color:T.white,fontSize:13,fontWeight:900,letterSpacing:.5}}>DARIVO PRO</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
          {[
            {l:"Aprobados", v:approved.length,c:T.green},
            {l:"Pendientes",v:pending.length, c:T.amber},
            {l:"Ingresos",  v:fmt(revenue),   c:T.blueL,sm:true},
          ].map(s=>(
            <div key={s.l} style={{background:"rgba(255,255,255,0.07)",borderRadius:13,padding:"11px 12px",border:"1px solid rgba(255,255,255,0.08)"}}>
              <p style={{color:s.c,fontSize:s.sm?13:24,fontWeight:900,lineHeight:1}}>{s.v}</p>
              <p style={{color:T.textLight,fontSize:10,fontWeight:500,marginTop:4}}>{s.l}</p>
            </div>
          ))}
        </div>
      </DarkHeader>

      <div style={{padding:"18px 16px 0"}}>
        <button onClick={()=>onNav("quote")} style={{width:"100%",padding:"20px 18px",borderRadius:20,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.blue},${T.blueL})`,display:"flex",alignItems:"center",gap:15,marginBottom:12,boxShadow:`0 8px 28px ${T.blue}45`}}>
          <div style={{width:52,height:52,borderRadius:15,background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <SVG d={I.zap} color={T.white} size={26} fill={T.white}/>
          </div>
          <div style={{textAlign:"left",flex:1}}>
            <p style={{color:T.white,fontSize:18,fontWeight:900}}>Nuevo presupuesto</p>
            <p style={{color:"rgba(255,255,255,0.7)",fontSize:13,marginTop:2}}>Combina partidas · menos de 60 seg</p>
          </div>
          <div style={{width:38,height:38,borderRadius:19,background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <SVG d={I.chevron} color={T.white} size={20}/>
          </div>
        </button>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22}}>
          {[
            {l:"Clientes",     sub:"Base de contactos",icon:"users",color:T.green,nav:"clients"},
            {l:"Presupuestos", sub:`${quotes.length} registros`,icon:"brief",color:T.blue,nav:"quotes"},
          ].map(b=>(
            <button key={b.l} onClick={()=>onNav(b.nav)} style={{padding:"18px 14px",borderRadius:16,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",textAlign:"left"}}>
              <div style={{width:38,height:38,borderRadius:10,background:b.color+"15",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}>
                <SVG d={I[b.icon]} color={b.color} size={20}/>
              </div>
              <p style={{fontSize:14,fontWeight:800,color:T.text}}>{b.l}</p>
              <p style={{fontSize:11,color:T.textMid,marginTop:2}}>{b.sub}</p>
            </button>
          ))}
        </div>

        <p style={{fontSize:12,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Capítulos de obra</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:22}}>
          {catalog.map(cat=>(
            <button key={cat.id} onClick={()=>onNav("quote")} style={{padding:"9px 14px",borderRadius:22,border:`1.5px solid ${cat.color}25`,background:cat.color+"10",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:15}}>{cat.emoji}</span>
              <span style={{fontSize:13,fontWeight:700,color:cat.color}}>{cat.label}</span>
            </button>
          ))}
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <p style={{fontSize:13,fontWeight:700,color:T.text}}>Últimos presupuestos</p>
          <button onClick={()=>onNav("quotes")} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:T.blue}}>Ver todos →</button>
        </div>
        {quotes.slice(0,4).map(q=>(
          <div key={q.id} style={{background:T.white,borderRadius:14,padding:"13px 15px",border:`1px solid ${T.slateD}`,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:14,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.clientName}</p>
              <p style={{fontSize:11,color:T.textMid,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.items?.map(i=>i.svcLabel).join(", ").slice(0,42)||"—"}</p>
            </div>
            <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
              <p style={{fontSize:15,fontWeight:900,color:T.blue}}>{fmt(q.totalFinal)}</p>
              <Pill label={q.status} sm color={q.status==="Aprobado"?T.green:q.status==="Pendiente"?T.amber:T.textMid}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CLIENTS ─────────────────────────────────────────────────────────────────
function ClientsScreen({quotes,onNew,onSelect}){
  const [q,setQ] = useState("");
  const map = {};
  quotes.forEach(qt=>{
    const k=qt.clientName;
    if(k&&k!=="Sin cliente"){
      if(!map[k]) map[k]={name:k,phone:qt.phone||"",city:qt.city||"",quotes:[]};
      map[k].quotes.push(qt);
    }
  });
  const clients = Object.values(map).filter(c=>!q||c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{paddingBottom:90}}>
      <DarkHeader>
        <h2 style={{color:T.white,fontSize:20,fontWeight:900,marginBottom:4}}>Clientes</h2>
        <p style={{color:T.textLight,fontSize:13,marginBottom:14}}>{clients.length} contactos</p>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍  Buscar cliente…"
          style={{width:"100%",padding:"12px 16px",borderRadius:14,border:"none",fontSize:14,background:"rgba(255,255,255,0.1)",outline:"none",color:T.white}}/>
      </DarkHeader>
      <div style={{padding:"18px 16px 0"}}>
        {clients.map(c=>{
          const total = c.quotes.reduce((a,q)=>a+q.totalFinal,0);
          const apro  = c.quotes.filter(q=>q.status==="Aprobado").length;
          return (
            <div key={c.name} onClick={()=>onSelect(c)} style={{background:T.white,borderRadius:14,padding:"14px 15px",border:`1px solid ${T.slateD}`,marginBottom:10,display:"flex",alignItems:"center",gap:13,cursor:"pointer"}}>
              <div style={{width:46,height:46,borderRadius:23,background:`linear-gradient(135deg,${T.blue},${T.blueL})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:T.white,fontSize:19,fontWeight:900}}>{c.name[0]}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:15,fontWeight:700,color:T.text}}>{c.name}</p>
                <p style={{fontSize:11,color:T.textMid,marginTop:2}}>{c.city||"—"} · {c.quotes.length} presup. · {apro} aprobado{apro!==1?"s":""}</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:14,fontWeight:800,color:T.blue}}>{fmt(total)}</p>
                <SVG d={I.chevron} color={T.textLight} size={16}/>
              </div>
            </div>
          );
        })}
        <button onClick={onNew} style={{width:"100%",padding:"18px",borderRadius:14,border:`2px dashed ${T.slateD}`,background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,marginTop:4}}>
          <SVG d={I.plus} color={T.textLight} size={22}/>
          <span style={{fontSize:14,fontWeight:600,color:T.textMid}}>Nuevo presupuesto</span>
        </button>
      </div>
    </div>
  );
}

// ─── QUOTES LIST ─────────────────────────────────────────────────────────────
function QuotesScreen({quotes,onNew,onChangeStatus,onViewPDF,onEditQuote,onDuplicateQuote,onDeleteQuote,onConvertQuote,onShareQuote}){
  const [filter,setFilter] = useState("Todos");
  const [q,setQ] = useState("");
  const MAP = {Todos:null,Aprobados:"Aprobado",Pendientes:"Pendiente",Borradores:"Borrador"};
  let list = filter==="Todos"?quotes:quotes.filter(x=>x.status===MAP[filter]);
  if(q) list = list.filter(x=>(x.clientName||"").toLowerCase().includes(q.toLowerCase())||(x.items||[]).some(i=>i.svcLabel.toLowerCase().includes(q.toLowerCase())));
  const totalVal = list.reduce((a,x)=>a+x.totalFinal,0);

  return (
    <div style={{paddingBottom:90}}>
      <DarkHeader>
        <h2 style={{color:T.white,fontSize:20,fontWeight:900,marginBottom:2}}>Presupuestos</h2>
        <p style={{color:T.textLight,fontSize:13,marginBottom:14}}>{list.length} registros · {fmt(totalVal)}</p>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍  Buscar…"
          style={{width:"100%",padding:"11px 16px",borderRadius:14,border:"none",fontSize:14,background:"rgba(255,255,255,0.1)",outline:"none",color:T.white,marginBottom:12}}/>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}}>
          {Object.keys(MAP).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 16px",borderRadius:22,border:"none",cursor:"pointer",flexShrink:0,background:filter===f?T.blue:"rgba(255,255,255,0.12)",color:filter===f?T.white:T.textLight,fontSize:13,fontWeight:700}}>
              {f}
            </button>
          ))}
        </div>
      </DarkHeader>

      <div style={{padding:"18px 16px 0"}}>
        {list.map(q=>{
          const sc=q.status==="Aprobado"?T.green:q.status==="Pendiente"?T.amber:T.textMid;
          const svcs=(q.items||[]).map(i=>i.svcLabel).join(", ");
          return (
            <div key={q.id} style={{background:T.white,borderRadius:14,padding:"14px 15px",border:`1px solid ${T.slateD}`,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:15,fontWeight:800,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.clientName}</p>
                  <p style={{fontSize:12,color:T.textMid,marginTop:2,lineHeight:1.4}}>{svcs.slice(0,55)}{svcs.length>55?"…":""}</p>
                  <p style={{fontSize:11,color:T.textLight,marginTop:2}}>{q.createdAt} · {(q.items||[]).length} partida{(q.items||[]).length!==1?"s":""}</p>
                </div>
                <p style={{fontSize:17,fontWeight:900,color:T.blue,flexShrink:0,marginLeft:10}}>{fmt(q.totalFinal)}</p>
              </div>
              {/* Estado + PDF */}
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
                {["Borrador","Pendiente","Aprobado"].map(s=>(
                  <button key={s} onClick={()=>onChangeStatus(q.id,s)} style={{padding:"5px 10px",borderRadius:14,border:`1.5px solid ${s===q.status?sc:T.slateD}`,background:s===q.status?sc+"12":"none",cursor:"pointer",fontSize:11,fontWeight:700,color:s===q.status?sc:T.textLight}}>
                    {s}
                  </button>
                ))}
                <button onClick={()=>onViewPDF(q)} style={{marginLeft:"auto",padding:"5px 12px",borderRadius:14,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  <SVG d={I.pdf} color={T.red} size={13}/>
                  <span style={{fontSize:11,fontWeight:700,color:T.textMid}}>PDF</span>
                </button>
              </div>
              {/* Acciones */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:10,borderTop:`1px solid ${T.slateD}`}}>
                <button onClick={()=>onEditQuote&&onEditQuote(q)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:12,border:`1.5px solid ${T.slateD}`,background:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:T.textMid}}>
                  <SVG d={I.edit} color={T.textMid} size={12}/>Editar
                </button>
                <button onClick={()=>onDuplicateQuote&&onDuplicateQuote(q)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:12,border:`1.5px solid ${T.blue}30`,background:`${T.blue}08`,cursor:"pointer",fontSize:11,fontWeight:700,color:T.blue}}>
                  <SVG d={I.convert} color={T.blue} size={12}/>Re-cotizar
                </button>
                <button onClick={()=>onShareQuote&&onShareQuote(q)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:12,border:`1.5px solid ${T.slateD}`,background:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:T.textMid}}>
                  <SVG d={I.share} color={T.textMid} size={12}/>Compartir
                </button>
                {q.status==="Aprobado"&&(
                  <button onClick={()=>onConvertQuote&&onConvertQuote(q)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:12,border:`1.5px solid ${T.green}35`,background:`${T.green}08`,cursor:"pointer",fontSize:11,fontWeight:700,color:T.green}}>
                    <SVG d={I.receipt} color={T.green} size={12}/>Facturar
                  </button>
                )}
                <button onClick={()=>onDeleteQuote&&onDeleteQuote(q)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:12,border:`1.5px solid ${T.red}30`,background:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:T.red,marginLeft:"auto"}}>
                  <SVG d={I.trash} color={T.red} size={12}/>Eliminar
                </button>
              </div>
            </div>
          );
        })}
        <button onClick={onNew} style={{width:"100%",padding:"18px",borderRadius:14,border:`2px dashed ${T.slateD}`,background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <SVG d={I.plus} color={T.textLight} size={22}/>
          <span style={{fontSize:14,fontWeight:600,color:T.textMid}}>Nuevo presupuesto</span>
        </button>
      </div>
    </div>
  );
}

// ─── SETTINGS ── catálogo editable: añadir partidas propias ──────────────────
function SettingsScreen({activeCats,setActiveCats,prices,setPrices,catalog,customServices,setCustomServices,onToast,bizData,setBizData}){
  const [tab,setTab]           = useState("cats");
  const [editing,setEditing]   = useState(null);
  const [tempVal,setTempVal]   = useState("");
  const [adding,setAdding]     = useState(null);
  const [newSvc,setNewSvc]     = useState({label:"",calcType:"m2",price:""});

  const allSvc = catalog.flatMap(c=>c.services);
  const svc = editing ? allSvc.find(s=>s.id===editing) : null;
  const cat = editing ? catalog.find(c=>c.services.some(s=>s.id===editing)) : null;
  const addCat = adding ? catalog.find(c=>c.id===adding) : null;

  const savePrice = ()=>{
    if(editing&&tempVal!=="") setPrices(p=>({...p,[editing]:parseFloat(tempVal)||0}));
    setEditing(null);setTempVal("");
  };

  const UNIT_FOR = {m2:"m²",unit:"ud",hour:"hora",fixed:""};

  const saveNewService = ()=>{
    if(!newSvc.label.trim()||newSvc.price===""){ onToast("⚠️ Completa nombre y precio"); return; }
    const id = `custom_${Date.now()}`;
    const service = {id,label:newSvc.label.trim(),calcType:newSvc.calcType,basePrice:parseFloat(newSvc.price)||0,unit:UNIT_FOR[newSvc.calcType],custom:true};
    setCustomServices(p=>({...p,[adding]:[...(p[adding]||[]),service]}));
    setPrices(p=>({...p,[id]:service.basePrice}));
    setAdding(null);
    setNewSvc({label:"",calcType:"m2",price:""});
    onToast(`✅ "${service.label}" añadida`);
  };

  const deleteCustom = (catId,svcId)=>{
    setCustomServices(p=>({...p,[catId]:(p[catId]||[]).filter(s=>s.id!==svcId)}));
    onToast("🗑️ Partida eliminada");
  };

  return (
    <div style={{paddingBottom:90}}>
      <DarkHeader>
        <h2 style={{color:T.white,fontSize:20,fontWeight:900,marginBottom:4}}>Más</h2>
        <p style={{color:T.textLight,fontSize:13}}>Categorías · Mis Tarifas · Empresa</p>
      </DarkHeader>

      {/* PRICE EDIT MODAL */}
      {editing&&(
        <div className="fi" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div className="su" style={{background:T.white,borderRadius:"22px 22px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:390}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
              <span style={{fontSize:26}}>{cat?.emoji}</span>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5}}>{cat?.label}</p>
                <p style={{fontSize:17,fontWeight:900,color:T.text}}>{svc?.label}</p>
              </div>
            </div>
            <p style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>
              Precio {svc?.calcType==="fixed"?"cerrado":`por ${svc?.unit}`}
            </p>
            <div style={{position:"relative",marginBottom:20}}>
              <input autoFocus type="number" value={tempVal} onChange={e=>setTempVal(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&savePrice()}
                style={{width:"100%",padding:"16px 52px 16px 18px",borderRadius:14,fontSize:32,fontWeight:900,border:`2.5px solid ${cat?.color||T.blue}`,outline:"none",color:T.text}}/>
              <span style={{position:"absolute",right:17,top:"50%",transform:"translateY(-50%)",fontSize:14,fontWeight:800,color:T.textMid}}>S/</span>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setEditing(null);setTempVal("");}} style={{flex:1,padding:"14px",borderRadius:13,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",fontSize:15,fontWeight:700,color:T.textMid}}>Cancelar</button>
              <button onClick={savePrice} style={{flex:2,padding:"14px",borderRadius:13,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.blue},${T.blueL})`,color:T.white,fontSize:15,fontWeight:800}}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {adding&&(
        <div className="fi" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div className="su" style={{background:T.white,borderRadius:"22px 22px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:390}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <span style={{fontSize:26}}>{addCat?.emoji}</span>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5}}>{addCat?.label}</p>
                <p style={{fontSize:17,fontWeight:900,color:T.text}}>Nueva partida</p>
              </div>
            </div>
            <p style={{fontSize:12,color:T.textMid,marginBottom:18}}>Ej: "Demolición de alicatado", "Pintura plástica"…</p>

            <p style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Nombre de la partida</p>
            <input autoFocus value={newSvc.label} onChange={e=>setNewSvc(s=>({...s,label:e.target.value}))}
              placeholder="Nombre del servicio…"
              style={{width:"100%",padding:"14px 16px",borderRadius:13,fontSize:15,fontWeight:600,border:`2px solid ${(addCat?.color||T.blue)}40`,outline:"none",color:T.text,marginBottom:16}}/>

            <p style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Tipo de cálculo</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
              {[["m2","m²"],["unit","unidad"],["hour","horas"],["fixed","fijo"]].map(([tp,l])=>(
                <button key={tp} onClick={()=>setNewSvc(s=>({...s,calcType:tp}))} style={{padding:"11px 4px",borderRadius:11,border:`2px solid ${newSvc.calcType===tp?(addCat?.color||T.blue):T.slateD}`,background:newSvc.calcType===tp?(addCat?.color||T.blue)+"10":"none",cursor:"pointer",fontSize:12,fontWeight:800,color:newSvc.calcType===tp?(addCat?.color||T.blue):T.textMid,textAlign:"center"}}>
                  {l}
                </button>
              ))}
            </div>

            <p style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>
              Precio {newSvc.calcType==="fixed"?"fijo":newSvc.calcType==="m2"?"por m²":newSvc.calcType==="unit"?"por unidad":"por hora"}
            </p>
            <div style={{position:"relative",marginBottom:20}}>
              <input type="number" value={newSvc.price} onChange={e=>setNewSvc(s=>({...s,price:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&saveNewService()}
                placeholder="0"
                style={{width:"100%",padding:"14px 52px 14px 18px",borderRadius:14,fontSize:28,fontWeight:900,border:`2.5px solid ${addCat?.color||T.blue}`,outline:"none",color:T.text}}/>
              <span style={{position:"absolute",right:17,top:"50%",transform:"translateY(-50%)",fontSize:14,fontWeight:800,color:T.textMid}}>S/</span>
            </div>

            {newSvc.label&&newSvc.price&&(
              <div className="pi" style={{background:(addCat?.color||T.blue)+"0D",borderRadius:12,padding:"11px 14px",marginBottom:18,border:`1.5px solid ${(addCat?.color||T.blue)}25`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <p style={{fontSize:13,fontWeight:800,color:addCat?.color||T.blue}}>{newSvc.label}</p>
                  <p style={{fontSize:11,color:T.textMid}}>{addCat?.label}</p>
                </div>
                <p style={{fontSize:15,fontWeight:900,color:addCat?.color||T.blue}}>
                  S/ {newSvc.price}{newSvc.calcType!=="fixed"?`/${({m2:"m²",unit:"ud",hour:"hora"})[newSvc.calcType]}`:""}
                </p>
              </div>
            )}

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setAdding(null);setNewSvc({label:"",calcType:"m2",price:""});}} style={{flex:1,padding:"14px",borderRadius:13,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",fontSize:15,fontWeight:700,color:T.textMid}}>Cancelar</button>
              <button onClick={saveNewService} style={{flex:2,padding:"14px",borderRadius:13,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${addCat?.color||T.blue},${T.blueL})`,color:T.white,fontSize:15,fontWeight:800}}>+ Añadir partida</button>
            </div>
          </div>
        </div>
      )}

      <div style={{padding:"16px 16px 0"}}>
        <div style={{display:"flex",background:T.slateD,borderRadius:14,padding:4,marginBottom:18}}>
          {[["cats","Categorías"],["prices","Mis Tarifas"],["biz","Empresa"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:tab===k?T.white:"none",fontSize:13,fontWeight:tab===k?800:600,color:tab===k?T.text:T.textMid,boxShadow:tab===k?"0 1px 5px rgba(0,0,0,0.1)":"none",transition:"all 0.2s"}}>
              {l}
            </button>
          ))}
        </div>

        {/* CAPÍTULOS */}
        {tab==="cats"&&(
          <div className="fi">
            <p style={{fontSize:13,color:T.textMid,marginBottom:14}}>Activa capítulos y añade tus propias partidas</p>
            {catalog.map(cat=>(
              <div key={cat.id} style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,marginBottom:10,overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,padding:"15px 16px",borderBottom:activeCats[cat.id]?`1px solid ${T.slateD}`:"none"}}>
                  <span style={{fontSize:22}}>{cat.emoji}</span>
                  <p style={{fontSize:15,fontWeight:800,color:T.text,flex:1}}>{cat.label}</p>
                  <span style={{fontSize:11,color:T.textMid,marginRight:8}}>{cat.services.length} partidas</span>
                  <Toggle on={activeCats[cat.id]} onToggle={()=>setActiveCats(p=>({...p,[cat.id]:!p[cat.id]}))}/>
                </div>
                {activeCats[cat.id]&&(
                  <div style={{padding:"8px 16px 12px"}}>
                    {cat.services.map((s)=>{
                      const p=prices[s.id]??s.basePrice;
                      return (
                        <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.slate}`,gap:8}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0}}>
                            <span style={{fontSize:13,color:T.textMid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.label}</span>
                            {s.custom&&<Pill label="Propia" color={T.purple} sm/>}
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                            <span style={{fontSize:12,color:cat.color,fontWeight:800}}>
                              {s.calcType==="fixed"?`S/ ${p}`:`S/ ${p}/${s.unit}`}
                            </span>
                            {s.custom&&(
                              <button onClick={()=>deleteCustom(cat.id,s.id)} style={{background:T.redPale,border:"none",cursor:"pointer",borderRadius:7,padding:"4px 6px",display:"flex"}}>
                                <SVG d={I.trash} color={T.red} size={13}/>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <button onClick={()=>setAdding(cat.id)} style={{width:"100%",marginTop:10,padding:"11px",borderRadius:11,border:`2px dashed ${cat.color}40`,background:cat.color+"08",cursor:"pointer",fontSize:13,fontWeight:800,color:cat.color,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                      <SVG d={I.plus} color={cat.color} size={15}/>
                      Añadir partida a {cat.label}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TARIFAS */}
        {tab==="prices"&&(
          <div className="fi">
            <p style={{fontSize:13,color:T.textMid,marginBottom:14}}>Toca para editar · Enter para guardar</p>
            {catalog.filter(c=>activeCats[c.id]).map(cat=>(
              <div key={cat.id} style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:17}}>{cat.emoji}</span>
                    <p style={{fontSize:12,fontWeight:800,color:T.textMid,textTransform:"uppercase",letterSpacing:.5}}>{cat.label}</p>
                  </div>
                  <button onClick={()=>setAdding(cat.id)} style={{background:cat.color+"12",border:"none",cursor:"pointer",borderRadius:9,padding:"5px 10px",color:cat.color,fontSize:11,fontWeight:800}}>+ Partida</button>
                </div>
                <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,overflow:"hidden"}}>
                  {cat.services.map((s,i)=>{
                    const p=prices[s.id]??s.basePrice;
                    return (
                      <button key={s.id} onClick={()=>{setEditing(s.id);setTempVal(String(p));}}
                        style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderBottom:i<cat.services.length-1?`1px solid ${T.slateD}`:"none",background:"none",cursor:"pointer",textAlign:"left",gap:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <p style={{fontSize:14,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.label}</p>
                            {s.custom&&<Pill label="Propia" color={T.purple} sm/>}
                          </div>
                          <p style={{fontSize:11,color:T.textMid,marginTop:1}}>{s.calcType==="fixed"?"Precio cerrado":`Por ${s.unit}`}</p>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                          <span style={{fontSize:17,fontWeight:900,color:cat.color}}>S/ {p}</span>
                          <div style={{width:28,height:28,borderRadius:8,background:T.slate,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <SVG d={I.edit} color={T.textMid} size={13}/>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPRESA */}
        {tab==="biz"&&(
          <div className="fi">
            {/* Datos de facturación — se usan en todas las facturas */}
            <p style={{fontSize:13,color:T.textMid,marginBottom:12}}>Estos datos aparecen en todas tus facturas</p>
            <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,overflow:"hidden",marginBottom:14}}>
              {[
                {label:"Razón social / Nombre",k:"razonSocial",ph:"Mi Empresa S.A.C."},
                {label:"RUC",k:"ruc",ph:"20XXXXXXXXX"},
                {label:"Dirección fiscal",k:"direccion",ph:"Av. Principal 123, Lima"},
                {label:"Teléfono",k:"telefono",ph:"+51 9XX XXX XXX"},
              ].map((f,i)=>(
                <div key={f.k} style={{padding:"13px 16px",borderBottom:i<3?`1px solid ${T.slateD}`:"none"}}>
                  <p style={{fontSize:10,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.4,marginBottom:5}}>{f.label}</p>
                  <input value={bizData?.[f.k]||""} onChange={e=>setBizData&&setBizData(b=>({...b,[f.k]:e.target.value}))}
                    placeholder={f.ph}
                    style={{border:"none",outline:"none",fontSize:14,fontWeight:600,color:T.text,background:"transparent",width:"100%"}}/>
                </div>
              ))}
            </div>

            {/* Moneda */}
            <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,padding:"13px 16px",marginBottom:14}}>
              <p style={{fontSize:10,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>Moneda por defecto</p>
              <div style={{display:"flex",gap:8}}>
                {[["PEN","S/ Sol peruano"],["USD","$ Dólar"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setBizData&&setBizData(b=>({...b,moneda:v,simbolo:v==="PEN"?"S/":"$"}))} style={{flex:1,padding:"11px",borderRadius:11,border:`2px solid ${(bizData?.moneda||"PEN")===v?T.blue:T.slateD}`,background:(bizData?.moneda||"PEN")===v?T.bluePale:"none",cursor:"pointer",fontSize:13,fontWeight:800,color:(bizData?.moneda||"PEN")===v?T.blue:T.textMid}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div style={{background:T.navyLight,borderRadius:14,padding:"16px 18px"}}>
              <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Backend · Supabase</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["tenants","Multi-empresa"],["users","Roles"],["services","Catálogo"],["quotes","Presupuestos"],["invoices","Facturas"],["storage","PDF / Docs"]].map(([t,d])=>(
                  <div key={t} style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:6,height:6,borderRadius:3,background:T.green,flexShrink:0}}/>
                    <div>
                      <p style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontFamily:"monospace"}}>{t}</p>
                      <p style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECCIONES ADICIONALES — Módulo Más §6 */}
        <div style={{marginTop:24,marginBottom:8}}>
          <p style={{fontSize:12,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Más opciones</p>
          {[
            {icon:I.user,     color:T.blue,   title:"Perfil del usuario",      sub:"Nombre, foto y datos de acceso"},
            {icon:I.brief,    color:T.green,  title:"Informes",                sub:"Semana · Mes · Anual"},
            {icon:I.folder,   color:T.amber,  title:"Documentos",            sub:"Facturas y cotizaciones por período"},
            {icon:I.building, color:T.purple, title:"Mi Plan",                 sub:"Plan actual · renovación · cambiar plan"},
            {icon:I.sparkle,  color:T.purple, title:"IA — Preferencias",       sub:"Ajustes del asistente inteligente"},
            {icon:I.phone,    color:T.teal,   title:"Soporte",                 sub:"Tickets · Nuevo / En proceso / Resuelto"},
            {icon:I.gear,     color:T.textMid,title:"Preferencias generales",  sub:"Idioma · notificaciones · moneda"},
          ].map(item=>(
            <button key={item.title} onClick={()=>onToast("📋 "+item.title+" — ver 07-MODULO-MAS.md")} style={{width:"100%",padding:"14px 16px",borderRadius:14,border:`1px solid ${T.slateD}`,background:T.white,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,marginBottom:8}}>
              <div style={{width:40,height:40,borderRadius:10,background:item.color+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <SVG d={item.icon} color={item.color} size={20}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:14,fontWeight:800,color:T.text}}>{item.title}</p>
                <p style={{fontSize:12,color:T.textMid,marginTop:2}}>{item.sub}</p>
              </div>
              <SVG d={I.chevron} color={T.textLight} size={18}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MÓDULO FACTURACIÓN PERÚ ──────────────────────────────────────────────────

// Contador de facturas (correlativo)
let _invoiceCounter = 1;
const nextInvoiceNum = () => { const n=_invoiceCounter++; return `F001-${String(n).padStart(6,"0")}`; };

// ── Pantalla principal de Facturas ──
function InvoicesScreen({quotes,invoices,onNew,onConvert,onChangeInvStatus,onViewInv,bizData}){
  const [filter,setFilter] = useState("Todas");
  const FMAP = {"Todas":null,"Emitidas":"Emitida","Cobradas":"Cobrada","Pendientes":"Pendiente"};
  const list = filter==="Todas"?invoices:invoices.filter(x=>x.invStatus===FMAP[filter]);
  const total = list.reduce((a,x)=>a+(x.totalFinal||0),0);
  const sym = bizData?.simbolo||"S/";
  const fmtPEN = n => `${sym} ${(n||0).toLocaleString("es-PE",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  // Quotes not yet invoiced
  const pendingQuotes = quotes.filter(q=>q.status==="Aprobado"&&!invoices.some(i=>i.fromQuoteId===q.id));

  return (
    <div style={{paddingBottom:90}}>
      <DarkHeader>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <h2 style={{color:T.white,fontSize:20,fontWeight:900,marginBottom:2}}>Facturación</h2>
            <p style={{color:T.textLight,fontSize:12}}>{list.length} facturas · {fmtPEN(total)}</p>
          </div>
          <div style={{background:`${T.green}22`,borderRadius:12,padding:"6px 12px",border:`1px solid ${T.green}40`}}>
            <p style={{color:T.green,fontSize:11,fontWeight:800}}>{bizData?.ruc||"Sin RUC"}</p>
          </div>
        </div>
        <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:2}}>
          {Object.keys(FMAP).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 14px",borderRadius:20,border:"none",cursor:"pointer",flexShrink:0,background:filter===f?T.blue:"rgba(255,255,255,0.12)",color:filter===f?T.white:T.textLight,fontSize:12,fontWeight:700}}>
              {f}
            </button>
          ))}
        </div>
      </DarkHeader>

      <div style={{padding:"16px 16px 0"}}>

        {/* Presupuestos aprobados listos para convertir */}
        {pendingQuotes.length>0&&(
          <div style={{marginBottom:18}}>
            <p style={{fontSize:11,fontWeight:800,color:T.amber,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
              ⚡ Presupuestos aprobados — convertir en factura
            </p>
            {pendingQuotes.map(q=>(
              <div key={q.id} style={{background:T.amberPale,borderRadius:14,border:`1.5px solid ${T.amber}35`,padding:"13px 15px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:14,fontWeight:800,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.clientName}</p>
                  <p style={{fontSize:11,color:T.textMid,marginTop:2}}>{q.createdAt} · {fmt(q.totalFinal)}</p>
                </div>
                <button onClick={()=>onConvert(q)} style={{background:`linear-gradient(135deg,${T.green},${T.greenD})`,border:"none",cursor:"pointer",borderRadius:12,padding:"10px 14px",color:T.white,fontSize:12,fontWeight:800,flexShrink:0,display:"flex",alignItems:"center",gap:6,boxShadow:`0 3px 12px ${T.green}40`}}>
                  <SVG d={I.convert} color={T.white} size={14}/>Facturar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Nueva factura desde cero */}
        <button onClick={()=>onNew(null)} style={{width:"100%",padding:"14px 18px",borderRadius:16,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.blue},${T.blueL})`,display:"flex",alignItems:"center",gap:12,marginBottom:18,boxShadow:`0 4px 20px ${T.blue}35`}}>
          <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <SVG d={I.receipt} color={T.white} size={20}/>
          </div>
          <div style={{textAlign:"left",flex:1}}>
            <p style={{color:T.white,fontSize:15,fontWeight:800}}>Nueva factura</p>
            <p style={{color:"rgba(255,255,255,0.65)",fontSize:12}}>Crear desde cero en 60 seg</p>
          </div>
          <SVG d={I.chevron} color={T.white} size={18}/>
        </button>

        {/* Lista de facturas */}
        {list.length===0&&<div style={{textAlign:"center",padding:"40px 16px"}}>
          <p style={{fontSize:36,marginBottom:10}}>🧾</p>
          <p style={{fontSize:15,fontWeight:700,color:T.text}}>Sin facturas todavía</p>
          <p style={{fontSize:13,color:T.textMid,marginTop:4}}>Convierte un presupuesto aprobado o crea una nueva</p>
        </div>}

        {list.map(inv=>{
          const sc = inv.invStatus==="Cobrada"?T.green:inv.invStatus==="Emitida"?T.blue:T.amber;
          return (
            <div key={inv.invId} style={{background:T.white,borderRadius:14,padding:"14px 15px",border:`1px solid ${T.slateD}`,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:800,color:T.textMid,fontFamily:"monospace"}}>{inv.invNum}</span>
                    <Pill label={inv.invStatus} sm color={sc}/>
                  </div>
                  <p style={{fontSize:15,fontWeight:800,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inv.clientName}</p>
                  <p style={{fontSize:11,color:T.textMid,marginTop:2}}>{inv.clientRuc&&`${inv.clientRuc} · `}{inv.invDate}</p>
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                  <p style={{fontSize:16,fontWeight:900,color:T.blue}}>{fmtPEN(inv.totalFinal)}</p>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                {["Pendiente","Emitida","Cobrada"].map(s=>(
                  <button key={s} onClick={()=>onChangeInvStatus(inv.invId,s)} style={{padding:"4px 10px",borderRadius:14,border:`1.5px solid ${s===inv.invStatus?sc:T.slateD}`,background:s===inv.invStatus?sc+"12":"none",cursor:"pointer",fontSize:10,fontWeight:700,color:s===inv.invStatus?sc:T.textLight}}>
                    {s}
                  </button>
                ))}
                <button onClick={()=>onViewInv(inv)} style={{marginLeft:"auto",padding:"5px 12px",borderRadius:14,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  <SVG d={I.pdf} color={T.red} size={13}/>
                  <span style={{fontSize:11,fontWeight:700,color:T.textMid}}>Ver factura</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Pantalla crear/editar factura ──
function InvoiceEditor({quote,bizData,invoices,onSave,onBack,onToast}){
  const [step,setStep]       = useState(quote?"confirm":"form"); // form | confirm | done
  const fmtPEN = n => `${bizData?.simbolo||"S/"} ${(n||0).toLocaleString("es-PE",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  // Auto-fill from quote if available
  const [cliName, setCliName]   = useState(quote?.clientName||"");
  const [cliRuc,  setCliRuc]    = useState("");
  const [cliDir,  setCliDir]    = useState(quote?.city||"");
  const [invDate, setInvDate]   = useState(today());
  const [moneda,  setMoneda]    = useState(bizData?.moneda||"PEN");
  const [sym]                    = useState(bizData?.simbolo||"S/");
  const [igv,     setIgv]       = useState(18); // IGV Peru 18%
  const [incIgv,  setIncIgv]    = useState(false);
  const [saved,   setSaved]     = useState(false);

  // Line items from quote or empty
  const baseItems = quote
    ? (quote.items||[]).map(it=>({...it,desc:it.svcLabel,cantidad:it.qty,pu:it.unitPrice,subtotal:it.subtotal}))
    : [{desc:"",cantidad:1,pu:0,subtotal:0}];
  const [items,setItems] = useState(baseItems);

  const updateItem = (idx,field,val)=>{
    setItems(prev=>prev.map((it,i)=>{
      if(i!==idx) return it;
      const upd = {...it,[field]:val};
      if(field==="cantidad"||field==="pu"){
        upd.subtotal = (parseFloat(upd.cantidad)||0)*(parseFloat(upd.pu)||0);
      }
      return upd;
    }));
  };
  const addItem = ()=>setItems(p=>[...p,{desc:"",cantidad:1,pu:0,subtotal:0}]);
  const removeItem = idx=>setItems(p=>p.filter((_,i)=>i!==idx));

  const subtotalBase = items.reduce((a,it)=>a+(parseFloat(it.subtotal)||0),0);
  const igvAmount    = incIgv ? subtotalBase*(igv/100)/(1+igv/100) : subtotalBase*(igv/100);
  const baseAfterIgv = incIgv ? subtotalBase-igvAmount : subtotalBase;
  const totalFinal   = incIgv ? subtotalBase : subtotalBase*(1+igv/100);
  const invNum       = nextInvoiceNum();

  const doSave = ()=>{
    const inv = {
      invId:Date.now(), invNum, invDate, invStatus:"Emitida",
      clientName:cliName||"Sin nombre", clientRuc:cliRuc, clientDir:cliDir,
      moneda, sym, items, subtotalBase:baseAfterIgv, igvAmount, totalFinal,
      fromQuoteId:quote?.id||null, bizData:{...bizData},
    };
    onSave(inv);
    setSaved(true);
    setStep("done");
  };

  if(step==="done") return (
    <div style={{minHeight:"100vh",background:T.slate}}>
      <DarkHeader>
        <BackBtn onBack={onBack}/>
        <div style={{textAlign:"center",padding:"10px 0 6px"}}>
          <div style={{width:64,height:64,borderRadius:32,background:T.greenPale,border:`3px solid ${T.green}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <SVG d={I.check} color={T.green} size={28}/>
          </div>
          <h2 style={{color:T.white,fontSize:20,fontWeight:900}}>¡Factura generada!</h2>
          <p style={{color:T.textLight,fontSize:13,marginTop:4}}>{invNum} · {fmtPEN(totalFinal)}</p>
        </div>
      </DarkHeader>
      <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={()=>{onToast("📲 Abriendo WhatsApp…");const msg=encodeURIComponent(`Estimado/a ${cliName},\n\nLe envío la factura ${invNum} por el servicio realizado.\n\nImporte total: ${fmtPEN(totalFinal)}\n\nQuedamos a su disposición.\n\n${bizData?.razonSocial||""}\nRUC: ${bizData?.ruc||""}`);window.open(`https://wa.me/?text=${msg}`);}}
          style={{padding:"17px",borderRadius:16,border:"none",cursor:"pointer",background:"#25D366",color:T.white,fontSize:16,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 20px #25D36640"}}>
          <SVG d={I.wa} color={T.white} size={22}/>Enviar por WhatsApp
        </button>
        <button onClick={()=>onToast("📄 Generando PDF…")} style={{padding:"15px",borderRadius:16,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",fontSize:15,fontWeight:700,color:T.text,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <SVG d={I.pdf} color={T.red} size={18}/>Descargar PDF
        </button>
        <button onClick={onBack} style={{padding:"14px",borderRadius:16,border:`1.5px dashed ${T.slateD}`,background:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:T.textMid}}>
          Volver a Facturas
        </button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.slate,paddingBottom:40}}>
      <DarkHeader>
        <BackBtn onBack={onBack}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
          <div style={{width:40,height:40,borderRadius:12,background:T.green,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <SVG d={I.receipt} color={T.white} size={21}/>
          </div>
          <div>
            <h2 style={{color:T.white,fontSize:18,fontWeight:900,lineHeight:1.1}}>
              {quote?"Convertir en Factura":"Nueva Factura"}
            </h2>
            <p style={{color:T.textLight,fontSize:12,marginTop:2}}>
              {quote?`Desde presupuesto · ${quote.clientName}`:"Factura desde cero"}
            </p>
          </div>
        </div>
      </DarkHeader>

      <div style={{padding:"16px 16px 80px"}}>

        {/* Nro. y fecha */}
        <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,padding:"14px 16px",marginBottom:12}}>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <p style={{fontSize:10,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.4,marginBottom:5}}>N° Serie</p>
              <p style={{fontSize:15,fontWeight:900,color:T.blue,fontFamily:"monospace"}}>{invNum}</p>
              <p style={{fontSize:10,color:T.textLight,marginTop:2}}>Auto correlativo</p>
            </div>
            <div style={{width:1,background:T.slateD}}/>
            <div style={{flex:1}}>
              <p style={{fontSize:10,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.4,marginBottom:5}}>Fecha emisión</p>
              <input type="date" value={invDate} onChange={e=>setInvDate(e.target.value)}
                style={{border:"none",outline:"none",fontSize:14,fontWeight:700,color:T.text,background:"transparent",width:"100%"}}/>
            </div>
            <div style={{width:1,background:T.slateD}}/>
            <div style={{flex:1}}>
              <p style={{fontSize:10,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.4,marginBottom:5}}>Moneda</p>
              <select value={moneda} onChange={e=>setMoneda(e.target.value)}
                style={{border:"none",outline:"none",fontSize:14,fontWeight:700,color:T.text,background:"transparent",width:"100%",cursor:"pointer"}}>
                <option value="PEN">PEN – S/</option>
                <option value="USD">USD – $</option>
              </select>
            </div>
          </div>
        </div>

        {/* Datos emisor (empresa) */}
        <div style={{background:T.navyLight,borderRadius:14,padding:"13px 16px",marginBottom:12}}>
          <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Emisor (tu empresa)</p>
          <p style={{fontSize:14,fontWeight:800,color:T.white}}>{bizData?.razonSocial||"Tu Empresa S.A.C."}</p>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.55)",marginTop:2}}>RUC: {bizData?.ruc||"—"}</p>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginTop:1}}>{bizData?.direccion||"—"}</p>
        </div>

        {/* Datos cliente */}
        <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,padding:"14px 16px",marginBottom:12}}>
          <p style={{fontSize:10,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Cliente / Receptor</p>
          {[
            {label:"Razón social / Nombre",   val:cliName,  set:setCliName,  ph:"Nombre del cliente"},
            {label:"RUC / DNI",               val:cliRuc,   set:setCliRuc,   ph:"20XXXXXXXXX"},
            {label:"Dirección",               val:cliDir,   set:setCliDir,   ph:"Av. / Calle, Distrito, Ciudad"},
          ].map((f,i)=>(
            <div key={f.label} style={{display:"flex",flexDirection:"column",gap:3,paddingBottom:10,borderBottom:i<2?`1px solid ${T.slateD}`:"none",marginBottom:i<2?10:0}}>
              <p style={{fontSize:10,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.4}}>{f.label}</p>
              <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                style={{border:"none",outline:"none",fontSize:14,fontWeight:600,color:T.text,background:"transparent"}}/>
            </div>
          ))}
        </div>

        {/* Detalle de servicios */}
        <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,overflow:"hidden",marginBottom:12}}>
          <div style={{background:T.navyLight,padding:"10px 16px",display:"grid",gridTemplateColumns:"1fr 48px 64px 64px",gap:6,alignItems:"center"}}>
            {["Descripción del servicio","Cant.","P. Unit.","Total"].map(h=>(
              <p key={h} style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:.3}}>{h}</p>
            ))}
          </div>
          {items.map((it,idx)=>(
            <div key={idx} style={{padding:"10px 16px",borderBottom:`1px solid ${T.slateD}`,display:"flex",flexDirection:"column",gap:6,background:idx%2===0?T.white:T.slate}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 48px 64px 64px",gap:6,alignItems:"center"}}>
                <input value={it.desc} onChange={e=>updateItem(idx,"desc",e.target.value)}
                  placeholder="Servicio…" style={{border:"none",outline:"none",fontSize:13,fontWeight:600,color:T.text,background:"transparent"}}/>
                <input type="number" value={it.cantidad} onChange={e=>updateItem(idx,"cantidad",e.target.value)}
                  style={{border:`1px solid ${T.slateD}`,borderRadius:7,padding:"4px 6px",fontSize:12,fontWeight:700,color:T.text,background:T.white,outline:"none",textAlign:"center"}}/>
                <input type="number" value={it.pu} onChange={e=>updateItem(idx,"pu",e.target.value)}
                  style={{border:`1px solid ${T.slateD}`,borderRadius:7,padding:"4px 6px",fontSize:12,fontWeight:700,color:T.text,background:T.white,outline:"none",textAlign:"right"}}/>
                <p style={{fontSize:13,fontWeight:800,color:T.blue,textAlign:"right"}}>{sym}{(parseFloat(it.subtotal)||0).toFixed(2)}</p>
              </div>
              {items.length>1&&(
                <button onClick={()=>removeItem(idx)} style={{alignSelf:"flex-end",background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:11,fontWeight:700}}>
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button onClick={addItem} style={{width:"100%",padding:"11px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:700,color:T.blue,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <SVG d={I.plus} color={T.blue} size={15}/>Agregar línea
          </button>
        </div>

        {/* Opciones IGV */}
        <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.slateD}`,padding:"13px 16px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <p style={{fontSize:13,fontWeight:700,color:T.text}}>IGV incluido en precios</p>
            <div onClick={()=>setIncIgv(v=>!v)} style={{width:46,height:26,borderRadius:13,cursor:"pointer",flexShrink:0,background:incIgv?T.blue:T.slateD,position:"relative",transition:"background 0.2s"}}>
              <div style={{position:"absolute",top:3,left:incIgv?24:3,width:20,height:20,borderRadius:10,background:T.white,transition:"left 0.18s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:"0 2px 6px rgba(0,0,0,0.18)"}}/>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:12,color:T.textMid}}>Base imponible</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>{fmtPEN(baseAfterIgv)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:12,color:T.textMid}}>IGV (18%)</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>{fmtPEN(igvAmount)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1.5px solid ${T.slateD}`,paddingTop:10}}>
            <span style={{fontSize:15,fontWeight:800,color:T.text}}>Importe total</span>
            <span style={{fontSize:22,fontWeight:900,color:T.blue}}>{fmtPEN(totalFinal)}</span>
          </div>
        </div>

        {/* Botones de acción */}
        <button onClick={doSave} style={{width:"100%",padding:"17px",borderRadius:16,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.green},${T.greenD})`,color:T.white,fontSize:16,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:`0 5px 20px ${T.green}45`,marginBottom:10}}>
          <SVG d={I.receipt} color={T.white} size={20}/>
          {quote?"Confirmar y emitir factura":"Generar factura"}
        </button>
        <button onClick={onBack} style={{width:"100%",padding:"13px",borderRadius:14,border:`1.5px dashed ${T.slateD}`,background:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:T.textMid}}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Modal detalle de factura (PDF preview) ──
function InvoiceModal({inv,bizData,onClose,onToast}){
  const fmtPEN = n => `${inv?.sym||"S/"} ${(n||0).toLocaleString("es-PE",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const [copied,setCopied] = useState(false);
  const msg = `Estimado/a ${inv?.clientName||"cliente"},\n\nLe envío la factura ${inv?.invNum} por el servicio realizado.\n\nImporte total: ${fmtPEN(inv?.totalFinal)}\n\n${(inv?.items||[]).map(it=>`• ${it.desc}: ${fmtPEN(it.subtotal)}`).join("\n")}\n\nBase imponible: ${fmtPEN(inv?.subtotalBase)}\nIGV (18%): ${fmtPEN(inv?.igvAmount)}\nTotal: ${fmtPEN(inv?.totalFinal)}\n\n${bizData?.razonSocial||""}\nRUC: ${bizData?.ruc||""}`;

  return (
    <div className="fi" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end"}}>
      <div className="su" style={{background:T.white,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:390,maxHeight:"92vh",overflow:"auto"}}>

        {/* Header */}
        <div style={{background:T.navyLight,padding:"18px 18px 14px",borderRadius:"22px 22px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:10,background:T.green,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <SVG d={I.receipt} color={T.white} size={17}/>
            </div>
            <div>
              <p style={{color:T.white,fontSize:14,fontWeight:800}}>{inv?.invNum}</p>
              <p style={{color:T.textLight,fontSize:11}}>{inv?.invDate}</p>
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",cursor:"pointer",borderRadius:20,padding:"8px 12px"}}>
            <SVG d={I.x} color={T.textLight} size={16}/>
          </button>
        </div>

        <div style={{padding:"20px 18px"}}>
          {/* Factura title */}
          <div style={{textAlign:"center",marginBottom:20,padding:"16px",background:T.slate,borderRadius:12}}>
            <p style={{fontSize:11,fontWeight:700,color:T.textMid,letterSpacing:2,textTransform:"uppercase"}}>FACTURA</p>
            <p style={{fontSize:24,fontWeight:900,color:T.blue,fontFamily:"monospace",marginTop:4}}>{inv?.invNum}</p>
          </div>

          {/* Emisor / Receptor */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <div style={{background:T.navyLight,borderRadius:12,padding:"12px 14px"}}>
              <p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Emisor</p>
              <p style={{fontSize:12,fontWeight:800,color:T.white,lineHeight:1.4}}>{inv?.bizData?.razonSocial||bizData?.razonSocial}</p>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:3}}>RUC {inv?.bizData?.ruc||bizData?.ruc}</p>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:2}}>{inv?.bizData?.direccion||bizData?.direccion}</p>
            </div>
            <div style={{background:T.slate,borderRadius:12,padding:"12px 14px"}}>
              <p style={{fontSize:9,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Receptor</p>
              <p style={{fontSize:12,fontWeight:800,color:T.text,lineHeight:1.4}}>{inv?.clientName}</p>
              {inv?.clientRuc&&<p style={{fontSize:10,color:T.textMid,marginTop:3}}>RUC/DNI {inv?.clientRuc}</p>}
              {inv?.clientDir&&<p style={{fontSize:10,color:T.textMid,marginTop:2}}>{inv?.clientDir}</p>}
            </div>
          </div>

          {/* Tabla servicios */}
          <div style={{border:`1px solid ${T.slateD}`,borderRadius:12,overflow:"hidden",marginBottom:14}}>
            <div style={{background:T.navyLight,display:"grid",gridTemplateColumns:"1fr 36px 56px 60px",padding:"9px 14px",gap:6}}>
              {["Descripción del servicio","Cant","P. Unit","Total"].map(h=>(
                <p key={h} style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:.3}}>{h}</p>
              ))}
            </div>
            {(inv?.items||[]).map((it,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 36px 56px 60px",padding:"11px 14px",gap:6,alignItems:"center",borderBottom:`1px solid ${T.slateD}`,background:i%2===0?T.white:T.slate}}>
                <p style={{fontSize:12,fontWeight:600,color:T.text,lineHeight:1.3}}>{it.desc||it.svcLabel}</p>
                <p style={{fontSize:11,color:T.textMid,textAlign:"center"}}>{it.cantidad||it.qty}</p>
                <p style={{fontSize:11,color:T.textMid,textAlign:"right"}}>{inv?.sym}{(parseFloat(it.pu||it.unitPrice)||0).toFixed(2)}</p>
                <p style={{fontSize:12,fontWeight:800,color:T.text,textAlign:"right"}}>{fmtPEN(it.subtotal)}</p>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div style={{background:T.slate,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:T.textMid}}>Base imponible</span>
              <span style={{fontSize:13,fontWeight:700,color:T.text}}>{fmtPEN(inv?.subtotalBase)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:12,color:T.textMid}}>IGV (18%)</span>
              <span style={{fontSize:13,fontWeight:700,color:T.text}}>{fmtPEN(inv?.igvAmount)}</span>
            </div>
            <div style={{borderTop:`2px solid ${T.slateD}`,paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:15,fontWeight:900,color:T.text,textTransform:"uppercase",letterSpacing:.5}}>Importe Total</span>
              <span style={{fontSize:24,fontWeight:900,color:T.blue}}>{fmtPEN(inv?.totalFinal)}</span>
            </div>
          </div>

          <p style={{fontSize:10,color:T.textLight,textAlign:"center",marginBottom:16}}>Documento generado con DARIVO PRO · {inv?.invDate}</p>

          {/* WA Preview */}
          <div style={{background:T.navyLight,borderRadius:12,padding:"12px 14px",marginBottom:14}}>
            <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Mensaje WhatsApp</p>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.7)",lineHeight:1.6,whiteSpace:"pre-wrap",fontFamily:"monospace"}}>{msg}</p>
          </div>

          {/* Acciones */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <button onClick={()=>{navigator.clipboard?.writeText(msg).catch(()=>{});setCopied(true);onToast("✅ Mensaje copiado");setTimeout(()=>setCopied(false),2000);}}
              style={{padding:"14px",borderRadius:13,border:"2px solid #25D36640",background:copied?"#25D36625":"#25D36610",cursor:"pointer",fontSize:13,fontWeight:800,color:"#128C7E",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <SVG d={I.wa} color="#128C7E" size={16}/>{copied?"¡Copiado!":"WhatsApp"}
            </button>
            <button onClick={()=>onToast("📄 Generando PDF…")} style={{padding:"14px",borderRadius:13,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",fontSize:13,fontWeight:700,color:T.text,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <SVG d={I.pdf} color={T.red} size={16}/>Descargar PDF
            </button>
          </div>
          <button onClick={onClose} style={{width:"100%",padding:"13px",borderRadius:13,border:`1.5px solid ${T.slateD}`,background:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:T.textMid}}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ─── MÓDULO IA (nav posición 3) ─────────────────────────────────────────────
function IAMenuScreen({onNav,onToast}){
  return (
    <div style={{paddingBottom:90}}>
      <DarkHeader pt="50px">
        <p style={{color:T.white,fontSize:20,fontWeight:900}}>IA</p>
        <p style={{color:T.textLight,fontSize:13,marginTop:4}}>Crea cotizaciones con asistencia inteligente</p>
      </DarkHeader>
      <div style={{padding:"20px 16px"}}>
        {[
          {l:"Escribir con IA",sub:"Describe el trabajo en texto",icon:I.edit,action:()=>onNav("quote")},
          {l:"Hablar con IA",sub:"Dicta el trabajo con tu voz",icon:I.phone,action:()=>onToast("🎤 Modo voz — próximamente")},
        ].map(o=>(
          <button key={o.l} onClick={o.action} style={{width:"100%",padding:"18px 16px",borderRadius:16,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:T.purplePale,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <SVG d={o.icon} color={T.purple} size={22}/>
            </div>
            <div>
              <p style={{fontSize:15,fontWeight:800,color:T.text}}>{o.l}</p>
              <p style={{fontSize:12,color:T.textMid,marginTop:2}}>{o.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MÓDULO CIERRE (nav posición 5) — ref. imagen oficial 09 ────────────────
const CIERRE_PURPLE = "#6D28D9";
const CIERRE_PURPLE_L = "#7C3AED";
const SAMPLE_GASTOS = [
  {id:1,cat:"Alimentación",prov:"Supermercado La Plaza",fecha:"15 May 2024",total:45.80,status:"Aprobado"},
  {id:2,cat:"Combustible",prov:"Estación Repsol",fecha:"14 May 2024",total:38.60,status:"Aprobado"},
  {id:3,cat:"Materiales",prov:"Librería El Mundo",fecha:"13 May 2024",total:23.15,status:"Aprobado"},
];

function CierreScreen({onToast}){
  const [tab,setTab] = useState("gastos");
  const [mes,setMes] = useState("Mayo");
  const [anio,setAnio] = useState("2024");
  const [expedienteListo,setExpedienteListo] = useState(false);

  const TabBtn = ({id,label}) => {
    const on = tab===id;
    return (
      <button onClick={()=>{setTab(id);setExpedienteListo(false);}} style={{flex:1,padding:"10px 0",background:"none",border:"none",cursor:"pointer",fontSize:14,fontWeight:on?800:600,color:on?CIERRE_PURPLE:T.textMid,borderBottom:on?`2px solid ${CIERRE_PURPLE}`:"2px solid transparent"}}>
        {label}
      </button>
    );
  };

  return (
    <div style={{paddingBottom:90}}>
      <div style={{background:T.white,padding:"12px 16px 0",borderBottom:`1px solid ${T.slateD}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <p style={{fontSize:13,fontWeight:800,color:T.text}}>Darivo Pro</p>
          <div style={{position:"relative"}}>
            <SVG d={I.bell} color={T.textMid} size={22}/>
            <span style={{position:"absolute",top:-4,right:-4,minWidth:16,height:16,borderRadius:8,background:T.red,color:T.white,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>2</span>
          </div>
        </div>
        <p style={{fontSize:22,fontWeight:900,color:T.text}}>Gastos</p>
        <p style={{fontSize:13,color:T.textMid,marginBottom:14}}>Registra y gestiona todos tus gastos</p>
        <div style={{display:"flex",borderBottom:`1px solid ${T.slateD}`}}>
          <TabBtn id="gastos" label="Gastos"/>
          <TabBtn id="expediente" label="Expediente Mensual"/>
        </div>
      </div>

      <div style={{padding:"16px"}}>
        {tab==="gastos"&&(
          <>
            <div style={{background:`linear-gradient(135deg,${CIERRE_PURPLE},${CIERRE_PURPLE_L})`,borderRadius:18,padding:"18px 16px",marginBottom:14,color:T.white}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <SVG d={I.camera} color={T.white} size={22}/>
                <p style={{fontSize:17,fontWeight:900}}>Registrar gasto</p>
                <span style={{marginLeft:"auto",fontSize:11,fontWeight:700,background:"rgba(255,255,255,0.2)",padding:"4px 8px",borderRadius:8}}>IA</span>
              </div>
              <p style={{fontSize:12,opacity:0.85,marginBottom:14}}>La IA analizará tu documento automáticamente</p>
              {["Tomar fotografía","Seleccionar imagen","Subir documento PDF","Registro manual"].map(a=>(
                <button key={a} onClick={()=>onToast("📷 "+a+" — flujo completo en MD 09")} style={{width:"100%",textAlign:"left",padding:"12px 14px",marginBottom:8,borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:T.white,cursor:"pointer",fontSize:13,fontWeight:600}}>{a}</button>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <p style={{fontSize:14,fontWeight:800,color:T.text}}>Gastos recientes</p>
              <button style={{background:"none",border:"none",color:CIERRE_PURPLE,fontSize:12,fontWeight:700,cursor:"pointer"}}>Ver todos</button>
            </div>
            {SAMPLE_GASTOS.map(g=>(
              <div key={g.id} style={{background:T.white,borderRadius:14,padding:"14px 16px",border:`1px solid ${T.slateD}`,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <p style={{fontSize:11,fontWeight:700,color:CIERRE_PURPLE}}>{g.cat}</p>
                    <p style={{fontSize:14,fontWeight:800,color:T.text,marginTop:2}}>{g.prov}</p>
                    <p style={{fontSize:11,color:T.textMid,marginTop:4}}>{g.fecha}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:15,fontWeight:900,color:T.text}}>S/ {g.total.toFixed(2)}</p>
                    <Pill label={g.status} sm color={T.green}/>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {tab==="expediente"&&!expedienteListo&&(
          <>
            <div style={{background:`linear-gradient(135deg,${CIERRE_PURPLE},${CIERRE_PURPLE_L})`,borderRadius:18,padding:"18px 16px",marginBottom:16,color:T.white}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <SVG d={I.folder} color={T.white} size={22}/>
                <p style={{fontSize:17,fontWeight:900}}>Expediente mensual</p>
                <span style={{marginLeft:"auto",fontSize:11,fontWeight:700,background:"rgba(255,255,255,0.2)",padding:"4px 8px",borderRadius:8}}>IA</span>
              </div>
              <p style={{fontSize:12,opacity:0.85}}>Genera automáticamente toda la documentación de tu actividad</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:T.textMid,marginBottom:6}}>Mes</p>
                <select value={mes} onChange={e=>setMes(e.target.value)} style={{width:"100%",padding:"12px",borderRadius:12,border:`1.5px solid ${T.slateD}`,fontSize:14,fontWeight:600}}>
                  {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:T.textMid,marginBottom:6}}>Año</p>
                <select value={anio} onChange={e=>setAnio(e.target.value)} style={{width:"100%",padding:"12px",borderRadius:12,border:`1.5px solid ${T.slateD}`,fontSize:14,fontWeight:600}}>
                  {["2024","2025","2026"].map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <button onClick={()=>setExpedienteListo(true)} style={{width:"100%",padding:"16px",borderRadius:14,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${CIERRE_PURPLE},${CIERRE_PURPLE_L})`,color:T.white,fontSize:16,fontWeight:900,marginBottom:20}}>
              Generar expediente
            </button>
            <div style={{background:T.white,borderRadius:14,padding:"16px",border:`1px solid ${T.slateD}`,marginBottom:16}}>
              <p style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:12}}>¿Qué incluye tu expediente?</p>
              {["Facturas del período","Gastos del período","Comprobantes asociados","Resumen del período"].map(t=>(
                <p key={t} style={{fontSize:13,color:T.textMid,marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                  <SVG d={I.check} color={T.green} size={16}/>{t}
                </p>
              ))}
            </div>
            <p style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:10}}>Formatos disponibles</p>
            {[
              {l:"Exportar en PDF",sub:"Documento PDF completo"},
              {l:"Descargar ZIP",sub:"Archivo comprimido"},
              {l:"Carpeta organizada",sub:"Carpeta estructurada"},
            ].map(f=>(
              <button key={f.l} onClick={()=>onToast("📦 "+f.l)} style={{width:"100%",textAlign:"left",padding:"14px 16px",borderRadius:14,border:`1.5px solid ${T.slateD}`,background:T.white,cursor:"pointer",marginBottom:8}}>
                <p style={{fontSize:14,fontWeight:700,color:T.text}}>{f.l}</p>
                <p style={{fontSize:11,color:T.textMid,marginTop:2}}>{f.sub}</p>
              </button>
            ))}
          </>
        )}

        {tab==="expediente"&&expedienteListo&&(
          <div style={{textAlign:"center",padding:"24px 8px"}}>
            <div style={{width:72,height:72,borderRadius:36,background:T.greenPale,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <SVG d={I.folder} color={T.green} size={36}/>
            </div>
            <p style={{fontSize:22,fontWeight:900,color:T.text}}>¡Expediente listo!</p>
            <p style={{fontSize:14,color:T.textMid,marginTop:6,marginBottom:20}}>{mes} {anio}</p>
            <div style={{background:T.white,borderRadius:14,padding:"16px",border:`1px solid ${T.slateD}`,textAlign:"left",marginBottom:20}}>
              <p style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:12}}>Resumen del período</p>
              {[["Facturas","24"],["Gastos","15"],["Comprobantes","39"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:13,color:T.textMid}}>{k}</span>
                  <span style={{fontSize:13,fontWeight:700,color:T.text}}>{v}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:`1px solid ${T.slateD}`}}>
                <span style={{fontSize:14,fontWeight:800,color:T.text}}>Total período</span>
                <span style={{fontSize:16,fontWeight:900,color:CIERRE_PURPLE}}>S/ 2,458.60</span>
              </div>
            </div>
            <button onClick={()=>onToast("📂 Ver expediente")} style={{width:"100%",padding:"16px",borderRadius:14,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${CIERRE_PURPLE},${CIERRE_PURPLE_L})`,color:T.white,fontSize:16,fontWeight:900,marginBottom:10}}>Ver expediente</button>
            <button onClick={()=>setExpedienteListo(false)} style={{background:"none",border:"none",color:CIERRE_PURPLE,fontSize:13,fontWeight:700,cursor:"pointer"}}>Generar otro expediente</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({active,onNav}){
  const TABS=[
    {k:"home",     d:I.home,     l:"Inicio"},
    {k:"clients",  d:I.users,    l:"Clientes"},
    {k:"ia",       d:I.sparkle,  l:"IA", central:true},
    {k:"invoices", d:I.receipt,  l:"Facturas"},
    {k:"cierre",   d:I.folder,   l:"Cierre"},
    {k:"settings", d:I.gear,     l:"Más"},
  ];
  const accent = active==="cierre" ? CIERRE_PURPLE : T.blue;
  return (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,background:T.white,borderTop:`1px solid ${T.slateD}`,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"8px 0 20px",zIndex:50,boxShadow:"0 -4px 20px rgba(0,0,0,0.06)"}}>
      {TABS.map(tab=>{
        if(tab.central) return (
          <button key={tab.k} onClick={()=>onNav(tab.k)} style={{width:52,height:52,borderRadius:26,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.purple},${CIERRE_PURPLE_L})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px ${T.purple}55`,marginTop:-16,flexShrink:0}}>
            <SVG d={tab.d} color={T.white} size={24}/>
          </button>
        );
        const on=active===tab.k;
        return (
          <button key={tab.k} onClick={()=>onNav(tab.k)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 4px",flex:1,position:"relative",minWidth:0}}>
            {on&&<div style={{position:"absolute",top:-8,width:28,height:3,borderRadius:2,background:accent}}/>}
            <SVG d={tab.d} color={on?accent:T.textLight} size={20}/>
            <span style={{fontSize:9,fontWeight:on?800:500,color:on?accent:T.textLight,whiteSpace:"nowrap"}}>{tab.l}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]          = useState("home");
  const [activeTab,setActiveTab]    = useState("home");
  const [quotes,setQuotes]          = useState(SAMPLE_QUOTES);
  const [activeCats,setActiveCats]  = useState(defaultActiveCats);
  const [prices,setPrices]          = useState(defaultPrices);
  const [customServices,setCustomServices] = useState({});
  const [pdfQuote,setPdfQuote]      = useState(null);
  const [selClient,setSelClient]    = useState(null);
  const [globalToast,setGlobalToast]= useState(null);

  // ── Facturación ──
  const [invoices,setInvoices]      = useState([]);
  const [invoiceCtx,setInvoiceCtx]  = useState(null); // quote to convert, or null for new
  const [viewInv,setViewInv]        = useState(null);
  const [bizData,setBizData]        = useState(DEFAULT_BIZ);

  // MERGED CATALOG: base + custom services per category
  const catalog = BASE_CATALOG.map(cat=>({
    ...cat,
    services:[...cat.services, ...(customServices[cat.id]||[])],
  }));

  const go = s => {
    setScreen(s);
    if(["home","clients","ia","invoices","cierre","settings"].includes(s)) setActiveTab(s);
  };
  const toast = m => setGlobalToast(m);

  const handleSave         = q => setQuotes(p=>[q,...p]);
  const handleStatus       = (id,status) => setQuotes(p=>p.map(q=>q.id===id?{...q,status}:q));
  const handleViewPDF      = q => setPdfQuote(q);
  const handleSelClient    = c => { setSelClient(c); setScreen("clientDetail"); };
  const handleSaveInvoice  = inv => { setInvoices(p=>[inv,...p]); };
  const handleInvStatus    = (invId,s) => setInvoices(p=>p.map(i=>i.invId===invId?{...i,invStatus:s}:i));
  const handleConvert      = q => { setInvoiceCtx(q); setScreen("invoiceEditor"); };

  // ── Acciones de historial ──
  const handleEditQuote      = q => toast("✏️ Editar «"+q.clientName+"» — próximamente");
  const handleDuplicateQuote = q => { const dup={...q,id:Date.now(),status:"Borrador",createdAt:today()}; setQuotes(p=>[dup,...p]); toast("✅ Re-cotización creada para "+q.clientName); };
  const handleDeleteQuote    = q => { setQuotes(p=>p.filter(x=>x.id!==q.id)); toast("🗑️ Cotización eliminada"); };
  const handleShareQuote     = q => { if(typeof navigator!=="undefined"&&navigator.share){navigator.share({title:"Cotización "+q.clientName,text:"Presupuesto "+fmt(q.totalFinal)}).catch(()=>{});}else{toast("📋 Compartir: "+q.clientName+" · "+fmt(q.totalFinal));} };

  // Listen for "Convertir en Factura" button from QuoteScreen
  useEffect(()=>{
    const handler = () => go("invoices");
    window.addEventListener("gotoInvoices",handler);
    return ()=>window.removeEventListener("gotoInvoices",handler);
  },[]);

  return (
    <>
      <style>{GS}</style>
      <div style={{maxWidth:390,margin:"0 auto",minHeight:"100vh",background:T.slate,position:"relative",overflowX:"hidden"}}>
        {globalToast && <Toast msg={globalToast} onClose={()=>setGlobalToast(null)}/>}

        {screen==="home"&&<HomeScreen onNav={go} quotes={quotes} catalog={catalog}/>}
        {screen==="quote"&&<QuoteScreen onBack={()=>go("home")} onSave={handleSave} prices={prices} activeCats={activeCats} catalog={catalog}/>}
        {screen==="clients"&&<ClientsScreen quotes={quotes} onNew={()=>go("quote")} onSelect={handleSelClient}/>}
        {screen==="clientDetail"&&selClient&&(
          <ClientDetail client={selClient} quotes={quotes}
            onBack={()=>{setSelClient(null);go("clients");}}
            onNewQuote={()=>go("quote")} onViewPDF={handleViewPDF}
            onChangeStatus={handleStatus} onToast={toast}
            onEditQuote={handleEditQuote}
            onDuplicateQuote={handleDuplicateQuote}
            onDeleteQuote={handleDeleteQuote}
            onConvertQuote={handleConvert}
            onShareQuote={handleShareQuote}/>
        )}
        {screen==="quotes"&&(
          <QuotesScreen quotes={quotes} onNew={()=>go("quote")} onChangeStatus={handleStatus} onViewPDF={handleViewPDF}
            onEditQuote={handleEditQuote}
            onDuplicateQuote={handleDuplicateQuote}
            onDeleteQuote={handleDeleteQuote}
            onConvertQuote={handleConvert}
            onShareQuote={handleShareQuote}/>
        )}
        {screen==="settings"&&(
          <SettingsScreen activeCats={activeCats} setActiveCats={setActiveCats}
            prices={prices} setPrices={setPrices}
            catalog={catalog} customServices={customServices} setCustomServices={setCustomServices}
            onToast={toast} bizData={bizData} setBizData={setBizData}/>
        )}
        {screen==="ia"&&<IAMenuScreen onNav={go} onToast={toast}/>}
        {screen==="cierre"&&<CierreScreen onToast={toast}/>}

        {/* ── Módulo Facturación ── */}
        {screen==="invoices"&&(
          <InvoicesScreen quotes={quotes} invoices={invoices}
            onNew={q=>{setInvoiceCtx(q);setScreen("invoiceEditor");}}
            onConvert={handleConvert}
            onChangeInvStatus={handleInvStatus}
            onViewInv={inv=>{setViewInv(inv);}}
            bizData={bizData}/>
        )}
        {screen==="invoiceEditor"&&(
          <InvoiceEditor quote={invoiceCtx} bizData={bizData} invoices={invoices}
            onSave={inv=>{handleSaveInvoice(inv);}}
            onBack={()=>{setInvoiceCtx(null);go("invoices");}}
            onToast={toast}/>
        )}

        {screen!=="quote"&&screen!=="invoiceEditor"&&<BottomNav active={activeTab} onNav={go}/>}
        {pdfQuote&&<PDFModal q={pdfQuote} onClose={()=>setPdfQuote(null)} onToast={toast} catalog={catalog}/>}
        {viewInv&&<InvoiceModal inv={viewInv} bizData={bizData} onClose={()=>setViewInv(null)} onToast={toast}/>}
      </div>
    </>
  );
}
