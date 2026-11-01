const fs=require('fs'),path=require('path');
const R=(f)=>fs.readFileSync(path.join(__dirname,f),'utf8');
const css=R('src/style.css');
const js=['engine','topics1','topics2','topics3','theory','core','app'].map(f=>R('src/'+f+'.js')).join('\n');
if(/<\/script/i.test(js)) throw new Error('</script> dentro del JS');
const MJ='https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.js';
const cfg=`<script>window.MathJax={tex:{inlineMath:[['$','$']],displayMath:[['$$','$$']]},svg:{fontCache:'none'},options:{enableMenu:false},startup:{typeset:false}};</script>
<script async src="${MJ}"></script>`;
const bodyHtml=`<div id="app" class="app"></div>\n${cfg}\n<script>\n${js}\n</script>`;
// Fragmento para el artifact (el publicador añade el esqueleto del documento)
fs.writeFileSync('dist/artifact.html',`<title>Integra</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n${css}\n</style>\n${bodyHtml}\n`);
// Documento completo para alojar como PWA
const full=`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Integra</title>
<meta name="description" content="Aprende y repasa integrales paso a paso">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Integra">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png?v=2">
<style>
:root{color-scheme:light dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
[hidden]{display:none!important}
${css}
</style>
</head>
<body>
${bodyHtml}
<script>if('serviceWorker' in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>
</body>
</html>
`;
fs.writeFileSync('dist/index.html',full);
console.log('artifact.html',(fs.statSync('dist/artifact.html').size/1024).toFixed(1)+' KB','| index.html',(fs.statSync('dist/index.html').size/1024).toFixed(1)+' KB');
