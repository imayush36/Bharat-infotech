// Vercel serverless endpoint. Keep RESEND_API_KEY server-side only.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow","POST"); return res.status(405).json({ok:false,error:"Method not allowed"}); }
  const origin=req.headers.origin, allowed=(process.env.ALLOWED_SITE_ORIGINS||"").split(",").map(v=>v.trim()).filter(Boolean);
  if(origin && allowed.length && !allowed.includes(origin)) return res.status(403).json({ok:false,error:"Origin not allowed"});
  const apiKey=process.env.RESEND_API_KEY, from=process.env.ENQUIRY_FROM_EMAIL, to=process.env.ENQUIRY_TO_EMAIL||"infotechsbharat@gmail.com";
  if(!apiKey||!from) return res.status(503).json({ok:false,error:"Email notification service is not configured."});
  const x=req.body&&typeof req.body==="object"?req.body:{};
  const name=String(x.name||"").trim().slice(0,100), email=String(x.email||"").trim().slice(0,160),
    service=String(x.service||"").trim().slice(0,160), message=String(x.message||"").trim().slice(0,2000), page=String(x.page||"").trim().slice(0,1000);
  if(!name||!service||!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ok:false,error:"A name, service, and valid email are required."});
  const esc=v=>v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const textBody=["New Bharat Infotechs website enquiry","",`Name: ${name}`,`Email: ${email}`,`Service: ${service}`,`Details: ${message||"Not provided"}`,`Page: ${page||"Not provided"}`].join("\n");
  try {
    const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({
      from,to:[to],subject:`Website enquiry: ${service} — ${name}`,text:textBody,
      html:`<h2>New Bharat Infotechs website enquiry</h2><p><b>Name:</b> ${esc(name)}</p><p><b>Email:</b> ${esc(email)}</p><p><b>Service:</b> ${esc(service)}</p><p><b>Details:</b><br>${esc(message||"Not provided").replace(/\n/g,"<br>")}</p><p><b>Page:</b> ${esc(page||"Not provided")}</p>`
    })});
    const data=await r.json().catch(()=>({}));
    if(!r.ok){console.error("Resend rejected email",r.status,data);return res.status(502).json({ok:false,error:"Email provider rejected the notification."});}
    return res.status(200).json({ok:true,id:data.id||null});
  } catch(e){console.error("Email provider request failed",e);return res.status(502).json({ok:false,error:"Email provider is unreachable."});}
};
