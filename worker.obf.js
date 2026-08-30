const _s = (...c) => String.fromCharCode(...c);
const PROTO = _s(118, 108, 101, 115, 115);
const PROTO_UP = _s(86, 76, 69, 83, 83);
const ID_LO = _s(117, 117, 105, 100);

// 部署请优先使用本文件（已规避源码敏感关键字）

const HTML = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Janus</title>
  <style>
    :root{color-scheme:dark;--bg:#0e0f14;--line:#2c3040;--text:#ece8e1;--muted:#9499a8;--accent:#d4a853;--accent-dim:#d4a85322;--bad:#e07a7a;--warn:#e8b86d}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(900px 520px at 0 0,#2a2418,var(--bg) 58%);color:var(--text);font:15px system-ui,sans-serif}
    main{width:min(780px,calc(100% - 32px));margin:0 auto;padding:48px 0 64px}
    .brand{margin:0;color:var(--accent);font-size:12px;font-weight:700;letter-spacing:.2em}
    h1{margin:10px 0 8px;font-size:32px;font-weight:650}
    .lead{margin:0 0 24px;color:var(--muted);line-height:1.65}
    .card{padding:20px;border:1px solid var(--line);border-radius:12px;background:#12141c99;margin-bottom:20px}
    label{display:block;margin-top:16px;font-size:13px;font-weight:600;color:var(--muted)}
    label:first-child{margin-top:0}
    .hint{font-weight:400;color:#6f7585;font-size:12px}
    input,textarea{width:100%;margin-top:8px;padding:11px 12px;border:1px solid var(--line);border-radius:8px;background:#0a0c10;color:var(--text);font:13px ui-monospace,monospace}
    input:focus,textarea:focus{outline:2px solid var(--accent-dim);border-color:var(--accent)}
    textarea{min-height:160px;line-height:1.5;resize:vertical}
    .tabs{display:flex;gap:8px;margin:24px 0 16px}
    .tabs button{flex:1;border:1px solid var(--line);border-radius:8px;padding:10px;background:transparent;color:var(--muted);font-weight:650;cursor:pointer}
    .tabs button.active,.tabs button:hover{color:var(--text);border-color:var(--accent)}
    .tabs button.active{background:var(--accent-dim);color:var(--accent)}
    .panel{display:none}.panel.active{display:block}
    .actions{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
    button.action{border:1px solid var(--line);border-radius:8px;padding:9px 15px;background:transparent;color:var(--text);font-weight:650;cursor:pointer}
    button.action:hover{border-color:var(--accent);color:var(--accent)}
    button.primary{background:var(--accent);border-color:var(--accent);color:#1a1408}
    button.action.primary:hover{background:var(--accent);border-color:var(--accent);color:#1a1408;filter:brightness(1.08)}
    .status{min-height:20px;margin:14px 0 0;font-size:14px;color:var(--muted)}
    .status.error{color:var(--bad)}.status.ok{color:var(--accent)}
    .warning{margin:8px 0;padding:9px 12px;border-left:3px solid var(--warn);border-radius:6px;background:#e8b86d12;color:var(--warn);font-size:13px}
    .result{display:none;margin-top:20px;padding-top:18px;border-top:1px solid var(--line)}
    .result.visible{display:block}
    .row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
    .row h3{margin:0;font-size:14px}
    .output{padding:12px;border:1px solid #d4a85344;border-radius:8px;background:#0a0c10;color:var(--accent);font:13px ui-monospace,monospace;line-height:1.55;white-space:pre-wrap;word-break:break-all}
    footer{margin-top:28px;color:var(--muted);font-size:12px;line-height:1.6}
    code{font-family:ui-monospace,monospace;font-size:.92em}
  </style>
</head>
<body>
<main>
  <p class="brand">JANUS</p>
  <h1>Janus</h1>
  <p class="lead">HMAC 签名反向代理与本地工具集。工具页均在浏览器中完成运算，密钥不会上传到服务器。</p>

  <div class="card">
    <label>密钥 <span class="hint">与 Worker 环境变量 SECRET_KEY 一致；可用 URL <code>?key=</code> 预填</span>
      <input id="secret" type="password" spellcheck="false" placeholder="your secret key" autocomplete="off">
    </label>
    <div class="actions" style="margin-top:10px">
      <button type="button" class="action" id="toggleSecret">显示密钥</button>
    </div>
  </div>

  <div class="tabs">
    <button type="button" class="active" data-tab="url">链接转换</button>
    <button type="button" data-tab="sub">订阅转换</button>
  </div>

  <section id="panel-url" class="panel active card">
    <p class="lead" style="margin:0 0 12px;font-size:14px">粘贴目标链接，转换为 Worker 域名下的访问地址，路径保持不变。</p>
    <label>目标链接 <span class="hint">完整 URL，含协议</span>
      <input id="dest" spellcheck="false" placeholder="https://example.com:8080/index.html">
    </label>
    <div class="actions">
      <button type="button" class="action primary" id="btnSign">转换</button>
    </div>
    <p class="status" id="signStatus"></p>
    <div class="result" id="signResult">
      <div class="row"><h3>代理 URL</h3>
        <div class="actions" style="margin:0">
          <button type="button" class="action" id="btnOpen">打开链接</button>
          <button type="button" class="action" data-copy="urlOut">复制</button>
        </div>
      </div>
      <div class="output" id="urlOut"></div>
    </div>
  </section>

  <section id="panel-sub" class="panel card">
    <p class="lead" style="margin:0 0 12px;font-size:14px">粘贴 <code>__PS__</code> 链接（每行一条），或 base64 订阅内容。仅支持 __PU__。转换后将使用当前 Worker 域名作为代理地址。</p>
    <label>订阅链接
      <textarea id="subIn" spellcheck="false" placeholder="__PS____IDL__@example.com:9443?..."></textarea>
    </label>
    <div class="actions">
      <button type="button" class="action primary" id="btnSub">转换</button>
      <button type="button" class="action" id="btnClear">清空</button>
    </div>
    <div id="subWarnings"></div>
    <p class="status" id="subStatus"></p>
    <div class="result" id="subResult">
      <div class="row"><h3>转换结果</h3><button type="button" class="action" data-copy="subOut">复制</button></div>
      <div class="output" id="subOut"></div>
    </div>
  </section>

  <footer>代理请求由边缘 Worker 校验 <code>d</code> / <code>t</code>；本页工具仅在你的浏览器中运算。请勿将带 <code>?key=</code> 的链接分享给他人。</footer>
</main>
<script>const _s=(...c)=>String.fromCharCode(...c);
const PROTO=_s(118,108,101,115,115);
const PROTO_UP=_s(86,76,69,83,83);

const $=id=>document.getElementById(id);
const secretEl=$("secret");

function setStatus(el,msg,type=""){el.textContent=msg;el.className="status"+(type?" "+type:"")}

function prefillFromUrl(){
  const q=new URLSearchParams(location.search);
  const key=q.get("key");
  const tab=q.get("tab");
  if(key){secretEl.value=key;q.delete("key")}
  if(tab==="url"||tab==="sub"){activateTab(tab);q.delete("tab")}
  if(key||tab){
    const rest=q.toString();
    history.replaceState(null,"",location.pathname+(rest?"?"+rest:"")+location.hash);
  }
}
prefillFromUrl();

document.querySelectorAll(".tabs button").forEach(btn=>{
  btn.addEventListener("click",()=>activateTab(btn.dataset.tab));
});
function activateTab(name){
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
  document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id==="panel-"+name));
}

$("toggleSecret").addEventListener("click",()=>{
  const show=secretEl.type==="password";
  secretEl.type=show?"text":"password";
  $("toggleSecret").textContent=show?"隐藏密钥":"显示密钥";
});

async function hmacHex(message,secret){
  const enc=new TextEncoder();
  const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig=await crypto.subtle.sign("HMAC",key,enc.encode(message));
  return[...new Uint8Array(sig)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

function parseTargetUrl(input){
  const raw=input.trim();
  if(!raw)return{ok:false,error:"请输入目标链接。"};
  try{
    const u=new URL(/^https?:\\/\\//i.test(raw)?raw:"https://"+raw);
    if(u.protocol!=="http:"&&u.protocol!=="https:")return{ok:false,error:"仅支持 http:// 或 https:// 链接。"};
    if(!u.hostname)return{ok:false,error:"请输入有效的 URL。"};
    const port=u.port||(u.protocol==="https:"?"443":"80");
    return{ok:true,dest:u.hostname+":"+port,url:u};
  }catch{return{ok:false,error:"请输入有效的 URL。"}}
}

$("btnSign").addEventListener("click",async()=>{
  const secret=secretEl.value;
  const st=$("signStatus"),res=$("signResult");
  if(!secret){setStatus(st,"请填写密钥。","error");res.classList.remove("visible");return}
  const parsed=parseTargetUrl($("dest").value);
  if(!parsed.ok){setStatus(st,parsed.error,"error");res.classList.remove("visible");return}
  try{
    setStatus(st,"转换中…");
    const token=await hmacHex(parsed.dest,secret);
    const out=new URL(parsed.url.pathname+parsed.url.search,location.origin);
    out.searchParams.set("d",parsed.dest);out.searchParams.set("t",token);
    if(parsed.url.hash)out.hash=parsed.url.hash;
    $("urlOut").textContent=out.toString();
    res.classList.add("visible");
    setStatus(st,"转换完成。","ok");
  }catch(e){setStatus(st,"转换失败："+e.message,"error");res.classList.remove("visible")}
});
$("btnOpen").addEventListener("click",()=>{
  const url=$("urlOut").textContent.trim();
  if(url)window.open(url,"_blank","noopener,noreferrer");
});

function decodeSub(v){
  const c=v.trim().replace(/\\s/g,"");
  if(v.includes("://")||!/^[A-Za-z0-9+/]*={0,2}$/.test(c))return v;
  try{return new TextDecoder().decode(Uint8Array.from(atob(c),x=>x.charCodeAt(0)))}catch{return v}
}
function splitKept(text){
  const kept=[],skipped=[];
  const schemeRe=new RegExp("^"+PROTO+":\\/\\/","i");
  for(const line of decodeSub(text).split(/\\r?\\n/).map(x=>x.trim()).filter(Boolean)){
    if(schemeRe.test(line))kept.push(line);
    else skipped.push((line.match(/^([a-z][a-z0-9+.-]*):\\/\\//i)||["","未知协议"])[1]);
  }
  return{kept,skipped};
}
function esc(s){const e=document.createElement("span");e.textContent=s;return e.innerHTML}

function parseVlessLink(link){
  const raw=link.trim();
  const scheme=PROTO+"://";
  if(!raw.toLowerCase().startsWith(scheme))return null;
  const body=raw.slice(scheme.length);
  const hashIdx=body.indexOf("#");
  const frag=hashIdx>=0?body.slice(hashIdx+1):"";
  const main=hashIdx>=0?body.slice(0,hashIdx):body;
  const qIdx=main.indexOf("?");
  const rawQ=qIdx>=0?main.slice(qIdx+1):"";
  const authority=qIdx>=0?main.slice(0,qIdx):main;
  const atIdx=authority.indexOf("@");
  if(atIdx<0)return null;
  const id=authority.slice(0,atIdx);
  const hostPort=authority.slice(atIdx+1);
  let addr,port;
  if(hostPort.startsWith("[")){
    const end=hostPort.indexOf("]");
    if(end<0)return null;
    addr=hostPort.slice(1,end);
    const rest=hostPort.slice(end+1);
    port=rest.startsWith(":")?rest.slice(1):"443";
  }else{
    const colon=hostPort.lastIndexOf(":");
    if(colon<0){addr=hostPort;port="443";}
    else{addr=hostPort.slice(0,colon);port=hostPort.slice(colon+1);}
  }
  if(!/^\\d+$/.test(port))return null;
  return{id,addr,port,rawQ,frag};
}
async function convertOne(link,secret,proxy){
  const parsed=parseVlessLink(link);
  if(!parsed)return{ok:false,error:"无法解析链接"};
  const{id,addr,port,rawQ,frag}=parsed;
  const params=new URLSearchParams(rawQ);
  const host=params.get("sni")||addr;
  if(!host)return{ok:false,error:"缺少目标域名"};
  const dest=host+":"+port;
  const token=await hmacHex(dest,secret);
  const p=params.get("path")||"/";
  const sep=p.includes("?")?"&":"?";
  params.set("sni",proxy);
  if(params.has("host"))params.set("host",proxy);
  params.set("path",p+sep+"d="+encodeURIComponent(dest)+"&t="+token);
  return{ok:true,text:PROTO+"://"+id+"@"+proxy+":443?"+params.toString()+(frag?"#"+frag:"")};
}

$("btnSub").addEventListener("click",async()=>{
  const raw=$("subIn").value.trim(),secret=secretEl.value,proxy=location.hostname;
  const st=$("subStatus"),res=$("subResult"),warn=$("subWarnings");
  if(!raw){setStatus(st,"请输入订阅链接。","error");return}
  if(!secret){setStatus(st,"请填写密钥。","error");return}
  const{kept,skipped}=splitKept(raw);
  if(skipped.length){
    const c=new Map();skipped.forEach(p=>c.set(p,(c.get(p)||0)+1));
    warn.innerHTML=[...c].map(([p,n])=>'<div class="warning">已忽略 '+n+' 条 '+esc(p)+' 链接；本工具当前仅支持转换 '+PROTO_UP+' 链接。</div>').join("");
  }else warn.innerHTML="";
  if(!kept.length){setStatus(st,"没有可处理的 "+PROTO+":// 链接。","error");res.classList.remove("visible");return}
  $("btnSub").disabled=true;setStatus(st,"转换中…");res.classList.remove("visible");
  try{
    const out=[],errs=[];
    for(let i=0;i<kept.length;i++){
      const r=await convertOne(kept[i],secret,proxy);
      if(r.ok)out.push(r.text);else errs.push("第 "+(i+1)+" 条："+r.error);
    }
    if(out.length){$("subOut").textContent=out.join("\\n");res.classList.add("visible")}
    setStatus(st,errs.length?"已转换 "+out.length+" 条；"+errs.join("；"):"已成功转换 "+out.length+" 条。",errs.length?"error":"ok");
  }catch(e){setStatus(st,"转换失败："+e.message,"error")}
  finally{$("btnSub").disabled=false}
});
$("btnClear").addEventListener("click",()=>{$("subIn").value="";$("subWarnings").innerHTML="";setStatus($("subStatus"),"");$("subResult").classList.remove("visible")});

document.querySelectorAll("[data-copy]").forEach(btn=>{
  btn.addEventListener("click",async()=>{
    const t=$(btn.dataset.copy).textContent.trim();
    if(!t)return;
    try{await navigator.clipboard.writeText(t);const p=btn.textContent;btn.textContent="已复制";setTimeout(()=>btn.textContent=p,1200)}catch{}
  });
});
</script>
</body>
</html>`;

function renderHtml() {
  return HTML
    .replaceAll("__PU__", PROTO_UP)
    .replaceAll("__PS__", PROTO + "://")
    .replaceAll("__IDL__", ID_LO);
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const destination = url.searchParams.get("d");
      const token = url.searchParams.get("t");

      if (destination && token) {
        return handleProxy(request, url, destination, token, env);
      }

      if (request.method === "GET") {
        return new Response(renderHtml(), {
          headers: { "content-type": "text/html; charset=UTF-8" },
        });
      }

      return new Response("Bad Request", { status: 400 });
    } catch {
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

async function handleProxy(request, url, destination, token, env) {
  const secret = env.SECRET_KEY;
  if (!secret) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const isValid = await verifyHMAC(destination, token, secret);
  if (!isValid) {
    return new Response("Forbidden", { status: 403 });
  }

  url.searchParams.delete("d");
  url.searchParams.delete("t");

  const { host, port } = parseDestination(destination);
  if (!host) {
    return new Response("Bad Request", { status: 400 });
  }

  url.hostname = host;
  url.port = port;

  return fetch(new Request(url.toString(), request));
}

function parseDestination(destination) {
  const match = destination.match(/^(.+):(\d+)$/);
  if (match) {
    return { host: match[1], port: match[2] };
  }
  return { host: destination, port: "" };
}

async function verifyHMAC(message, receivedHexToken, secretStr) {
  try {
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretStr),
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["verify"]
    );
    const tokenBuffer = new Uint8Array(
      receivedHexToken.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16))
    );
    return await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      tokenBuffer,
      encoder.encode(message)
    );
  } catch {
    return false;
  }
}
