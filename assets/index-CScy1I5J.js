(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const c of o)if(c.type==="childList")for(const h of c.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&a(h)}).observe(document,{childList:!0,subtree:!0});function r(o){const c={};return o.integrity&&(c.integrity=o.integrity),o.referrerPolicy&&(c.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?c.credentials="include":o.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function a(o){if(o.ep)return;o.ep=!0;const c=r(o);fetch(o.href,c)}})();var Te=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Ie(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var Ce={exports:{}};/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/(function(s,i){((r,a)=>{s.exports=a()})(Te,function r(){var a=typeof self<"u"?self:typeof window<"u"?window:a!==void 0?a:{},o,c=!a.document&&!!a.postMessage,h=a.IS_PAPA_WORKER||!1,b={},m=0,l={};function d(e){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(t){var n=ue(t);n.chunkSize=parseInt(n.chunkSize),t.step||t.chunk||(n.chunkSize=null),this._handle=new de(n),(this._handle.streamer=this)._config=n}).call(this,e),this.parseChunk=function(t,n){var p=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<p){let _=this._config.newline;_||(u=this._config.quoteChar||'"',_=this._handle.guessLineEndings(t,u)),t=[...t.split(_).slice(p)].join(_)}this.isFirstChunk&&A(this._config.beforeFirstChunk)&&(u=this._config.beforeFirstChunk(t))!==void 0&&(t=u),this.isFirstChunk=!1,this._halted=!1;var p=this._partialLine+t,u=(this._partialLine="",this._handle.parse(p,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){if(t=u.meta.cursor,p=(this._finished||(this._partialLine=p.substring(t-this._baseIndex),this._baseIndex=t),u&&u.data&&(this._rowCount+=u.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview),h)a.postMessage({results:u,workerId:l.WORKER_ID,finished:p});else if(A(this._config.chunk)&&!n){if(this._config.chunk(u,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=u=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(u.data),this._completeResults.errors=this._completeResults.errors.concat(u.errors),this._completeResults.meta=u.meta),this._completed||!p||!A(this._config.complete)||u&&u.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),p||u&&u.meta.paused||this._nextChunk(),u}this._halted=!0},this._sendError=function(t){A(this._config.error)?this._config.error(t):h&&this._config.error&&a.postMessage({workerId:l.WORKER_ID,error:t,finished:!1})}}function C(e){var t;(e=e||{}).chunkSize||(e.chunkSize=l.RemoteChunkSize),d.call(this,e),this._nextChunk=c?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(n){this._input=n,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(t=new XMLHttpRequest,this._config.withCredentials&&(t.withCredentials=this._config.withCredentials),c||(t.onload=oe(this._chunkLoaded,this),t.onerror=oe(this._chunkError,this)),t.open(this._config.downloadRequestBody?"POST":"GET",this._input,!c),this._config.downloadRequestHeaders){var n,p=this._config.downloadRequestHeaders;for(n in p)t.setRequestHeader(n,p[n])}var u;this._config.chunkSize&&(u=this._start+this._config.chunkSize-1,t.setRequestHeader("Range","bytes="+this._start+"-"+u));try{t.send(this._config.downloadRequestBody)}catch(_){this._chunkError(_.message)}c&&t.status===0&&this._chunkError()}},this._chunkLoaded=function(){t.readyState===4&&(t.status<200||400<=t.status?this._chunkError():(this._start+=this._config.chunkSize||t.responseText.length,this._finished=!this._config.chunkSize||this._start>=(n=>(n=n.getResponseHeader("Content-Range"))!==null?parseInt(n.substring(n.lastIndexOf("/")+1)):-1)(t),this.parseChunk(t.responseText)))},this._chunkError=function(n){n=t.statusText||n,this._sendError(new Error(n))}}function g(e){(e=e||{}).chunkSize||(e.chunkSize=l.LocalChunkSize),d.call(this,e);var t,n,p=typeof FileReader<"u";this.stream=function(u){this._input=u,n=u.slice||u.webkitSlice||u.mozSlice,p?((t=new FileReader).onload=oe(this._chunkLoaded,this),t.onerror=oe(this._chunkError,this)):t=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var u=this._input,_=(this._config.chunkSize&&(_=Math.min(this._start+this._config.chunkSize,this._input.size),u=n.call(u,this._start,_)),t.readAsText(u,this._config.encoding));p||this._chunkLoaded({target:{result:_}})},this._chunkLoaded=function(u){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(u.target.result)},this._chunkError=function(){this._sendError(t.error)}}function R(e){var t;d.call(this,e=e||{}),this.stream=function(n){return t=n,this._nextChunk()},this._nextChunk=function(){var n,p;if(!this._finished)return n=this._config.chunkSize,t=n?(p=t.substring(0,n),t.substring(n)):(p=t,""),this._finished=!t,this.parseChunk(p)}}function J(e){d.call(this,e=e||{});var t=[],n=!0,p=!1;this.pause=function(){d.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){d.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(u){this._input=u,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){p&&t.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),t.length?this.parseChunk(t.shift()):n=!0},this._streamData=oe(function(u){try{t.push(typeof u=="string"?u:u.toString(this._config.encoding)),n&&(n=!1,this._checkIsFinished(),this.parseChunk(t.shift()))}catch(_){this._streamError(_)}},this),this._streamError=oe(function(u){this._streamCleanUp(),this._sendError(u)},this),this._streamEnd=oe(function(){this._streamCleanUp(),p=!0,this._streamData("")},this),this._streamCleanUp=oe(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function de(e){var t,n,p,u,_=Math.pow(2,53),N=-_,G=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,Y=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,w=this,D=0,v=0,H=!1,y=!1,E=[],f={data:[],errors:[],meta:{}};function W($){return e.skipEmptyLines==="greedy"?$.join("").trim()==="":$.length===1&&$[0].length===0}function M(){if(f&&p&&(V("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+l.DefaultDelimiter+"'"),p=!1),e.skipEmptyLines&&(f.data=f.data.filter(function(T){return!W(T)})),U()){let T=function(j,I){A(e.transformHeader)&&(j=e.transformHeader(j,I)),E.push(j)};var x=T;if(f)if(Array.isArray(f.data[0])){for(var $=0;U()&&$<f.data.length;$++)f.data[$].forEach(T);f.data.splice(0,1)}else f.data.forEach(T)}function L(T,j){for(var I=e.header?{}:[],S=0;S<T.length;S++){var k=S,K=T[S],K=((O,F)=>(B=>(e.dynamicTypingFunction&&e.dynamicTyping[B]===void 0&&(e.dynamicTyping[B]=e.dynamicTypingFunction(B)),(e.dynamicTyping[B]||e.dynamicTyping)===!0))(O)?F==="true"||F==="TRUE"||F!=="false"&&F!=="FALSE"&&((B=>{if(G.test(B)&&(B=parseFloat(B),N<B&&B<_))return 1})(F)?parseFloat(F):Y.test(F)?new Date(F):F===""?null:F):F)(k=e.header?S>=E.length?"__parsed_extra":E[S]:k,K=e.transform?e.transform(K,k):K);k==="__parsed_extra"?(I[k]=I[k]||[],I[k].push(K)):I[k]=K}return e.header&&(S>E.length?V("FieldMismatch","TooManyFields","Too many fields: expected "+E.length+" fields but parsed "+S,v+j):S<E.length&&V("FieldMismatch","TooFewFields","Too few fields: expected "+E.length+" fields but parsed "+S,v+j)),I}var P;f&&(e.header||e.dynamicTyping||e.transform)&&(P=1,!f.data.length||Array.isArray(f.data[0])?(f.data=f.data.map(L),P=f.data.length):f.data=L(f.data,0),e.header&&f.meta&&(f.meta.fields=E),v+=P)}function U(){return e.header&&E.length===0}function V($,L,P,x){$={type:$,code:L,message:P},x!==void 0&&($.row=x),f.errors.push($)}A(e.step)&&(u=e.step,e.step=function($){f=$,U()?M():(M(),f.data.length!==0&&(D+=$.data.length,e.preview&&D>e.preview?n.abort():(f.data=f.data[0],u(f,w))))}),this.parse=function($,L,P){var x=e.quoteChar||'"',x=(e.newline||(e.newline=this.guessLineEndings($,x)),p=!1,e.delimiter?A(e.delimiter)&&(e.delimiter=e.delimiter($),f.meta.delimiter=e.delimiter):((x=((T,j,I,S,k)=>{var K,O,F,B;k=k||[",","	","|",";",l.RECORD_SEP,l.UNIT_SEP];for(var pe=0;pe<k.length;pe++){for(var X,ge=k[pe],Q=0,ee=0,q=0,Z=(F=void 0,new ae({comments:S,delimiter:ge,newline:j,preview:10}).parse(T)),ne=0;ne<Z.data.length;ne++)I&&W(Z.data[ne])?q++:(X=Z.data[ne].length,ee+=X,F===void 0?F=X:0<X&&(Q+=Math.abs(X-F),F=X));0<Z.data.length&&(ee/=Z.data.length-q),(O===void 0||Q<=O)&&(B===void 0||B<ee)&&1.99<ee&&(O=Q,K=ge,B=ee)}return{successful:!!(e.delimiter=K),bestDelimiter:K}})($,e.newline,e.skipEmptyLines,e.comments,e.delimitersToGuess)).successful?e.delimiter=x.bestDelimiter:(p=!0,e.delimiter=l.DefaultDelimiter),f.meta.delimiter=e.delimiter),ue(e));return e.preview&&e.header&&x.preview++,t=$,n=new ae(x),f=n.parse(t,L,P),M(),H?{meta:{paused:!0}}:f||{meta:{paused:!1}}},this.paused=function(){return H},this.pause=function(){H=!0,n.abort(),t=A(e.chunk)?"":t.substring(n.getCharIndex())},this.resume=function(){w.streamer._halted?(H=!1,w.streamer.parseChunk(t,!0)):setTimeout(w.resume,3)},this.aborted=function(){return y},this.abort=function(){y=!0,n.abort(),f.meta.aborted=!0,A(e.complete)&&e.complete(f),t=""},this.guessLineEndings=function(T,x){T=T.substring(0,1048576);var x=new RegExp(ie(x)+"([^]*?)"+ie(x),"gm"),P=(T=T.replace(x,"")).split("\r"),x=T.split(`
`),T=1<x.length&&x[0].length<P[0].length;if(P.length===1||T)return`
`;for(var j=0,I=0;I<P.length;I++)P[I][0]===`
`&&j++;return j>=P.length/2?`\r
`:"\r"}}function ie(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function ae(e){var t=(e=e||{}).delimiter,n=e.newline,p=e.comments,u=e.step,_=e.preview,N=e.fastMode,G=null,Y=!1,w=e.quoteChar==null?'"':e.quoteChar,D=w;if(e.escapeChar!==void 0&&(D=e.escapeChar),(typeof t!="string"||-1<l.BAD_DELIMITERS.indexOf(t))&&(t=","),p===t)throw new Error("Comment character same as delimiter");p===!0?p="#":(typeof p!="string"||-1<l.BAD_DELIMITERS.indexOf(p))&&(p=!1),n!==`
`&&n!=="\r"&&n!==`\r
`&&(n=`
`);var v=0,H=!1;this.parse=function(y,E,f){if(typeof y!="string")throw new Error("Input must be a string");var W=y.length,M=t.length,U=n.length,V=p.length,$=A(u),L=[],P=[],x=[],T=v=0;if(!y)return Q();if(N||N!==!1&&y.indexOf(w)===-1){for(var j=y.split(n),I=0;I<j.length;I++){if(x=j[I],v+=x.length,I!==j.length-1)v+=n.length;else if(f)return Q();if(!p||x.substring(0,V)!==p){if($){if(L=[],B(x.split(t)),ee(),H)return Q()}else B(x.split(t));if(_&&_<=I)return L=L.slice(0,_),Q(!0)}}return Q()}for(var S=y.indexOf(t,v),k=y.indexOf(n,v),K=new RegExp(ie(D)+ie(w),"g"),O=y.indexOf(w,v);;)if(y[v]===w)for(O=v,v++;;){if((O=y.indexOf(w,O+1))===-1)return f||P.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:L.length,index:v}),X();if(O===W-1)return X(y.substring(v,O).replace(K,w));if(w===D&&y[O+1]===D)O++;else if(w===D||O===0||y[O-1]!==D){S!==-1&&S<O+1&&(S=y.indexOf(t,O+1));var F=pe((k=k!==-1&&k<O+1?y.indexOf(n,O+1):k)===-1?S:Math.min(S,k));if(y.substr(O+1+F,M)===t){x.push(y.substring(v,O).replace(K,w)),y[v=O+1+F+M]!==w&&(O=y.indexOf(w,v)),S=y.indexOf(t,v),k=y.indexOf(n,v);break}if(F=pe(k),y.substring(O+1+F,O+1+F+U)===n){if(x.push(y.substring(v,O).replace(K,w)),ge(O+1+F+U),S=y.indexOf(t,v),O=y.indexOf(w,v),$&&(ee(),H))return Q();if(_&&L.length>=_)return Q(!0);break}P.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:L.length,index:v}),O++}}else if(p&&x.length===0&&y.substring(v,v+V)===p){if(k===-1)return Q();v=k+U,k=y.indexOf(n,v),S=y.indexOf(t,v)}else if(S!==-1&&(S<k||k===-1))x.push(y.substring(v,S)),v=S+M,S=y.indexOf(t,v);else{if(k===-1)break;if(x.push(y.substring(v,k)),ge(k+U),$&&(ee(),H))return Q();if(_&&L.length>=_)return Q(!0)}return X();function B(q){L.push(q),T=v}function pe(q){var Z=0;return Z=q!==-1&&(q=y.substring(O+1,q))&&q.trim()===""?q.length:Z}function X(q){return f||(q===void 0&&(q=y.substring(v)),x.push(q),v=W,B(x),$&&ee()),Q()}function ge(q){v=q,B(x),x=[],k=y.indexOf(n,v)}function Q(q){if(e.header&&!E&&L.length&&!Y){var Z=L[0],ne=Object.create(null),ye=new Set(Z);let _e=!1;for(let he=0;he<Z.length;he++){let te=Z[he];if(ne[te=A(e.transformHeader)?e.transformHeader(te,he):te]){let ve,xe=ne[te];for(;ve=te+"_"+xe,xe++,ye.has(ve););ye.add(ve),Z[he]=ve,ne[te]++,_e=!0,(G=G===null?{}:G)[ve]=te}else ne[te]=1,Z[he]=te;ye.add(te)}_e&&console.warn("Duplicate headers found and renamed."),Y=!0}return{data:L,errors:P,meta:{delimiter:t,linebreak:n,aborted:H,truncated:!!q,cursor:T+(E||0),renamedHeaders:G}}}function ee(){u(Q()),L=[],P=[]}},this.abort=function(){H=!0},this.getCharIndex=function(){return v}}function ce(e){var t=e.data,n=b[t.workerId],p=!1;if(t.error)n.userError(t.error,t.file);else if(t.results&&t.results.data){var u={abort:function(){p=!0,re(t.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:fe,resume:fe};if(A(n.userStep)){for(var _=0;_<t.results.data.length&&(n.userStep({data:t.results.data[_],errors:t.results.errors,meta:t.results.meta},u),!p);_++);delete t.results}else A(n.userChunk)&&(n.userChunk(t.results,u,t.file),delete t.results)}t.finished&&!p&&re(t.workerId,t.results)}function re(e,t){var n=b[e];A(n.userComplete)&&n.userComplete(t),n.terminate(),delete b[e]}function fe(){throw new Error("Not implemented.")}function ue(e){if(typeof e!="object"||e===null)return e;var t,n=Array.isArray(e)?[]:{};for(t in e)n[t]=ue(e[t]);return n}function oe(e,t){return function(){e.apply(t,arguments)}}function A(e){return typeof e=="function"}return l.parse=function(e,t){var n=(t=t||{}).dynamicTyping||!1;if(A(n)&&(t.dynamicTypingFunction=n,n={}),t.dynamicTyping=n,t.transform=!!A(t.transform)&&t.transform,!t.worker||!l.WORKERS_SUPPORTED)return n=null,l.NODE_STREAM_INPUT,typeof e=="string"?(e=(p=>p.charCodeAt(0)!==65279?p:p.slice(1))(e),n=new(t.download?C:R)(t)):e.readable===!0&&A(e.read)&&A(e.on)?n=new J(t):(a.File&&e instanceof File||e instanceof Object)&&(n=new g(t)),n.stream(e);(n=(()=>{var p;return!!l.WORKERS_SUPPORTED&&(p=(()=>{var u=a.URL||a.webkitURL||null,_=r.toString();return l.BLOB_URL||(l.BLOB_URL=u.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",_,")();"],{type:"text/javascript"})))})(),(p=new a.Worker(p)).onmessage=ce,p.id=m++,b[p.id]=p)})()).userStep=t.step,n.userChunk=t.chunk,n.userComplete=t.complete,n.userError=t.error,t.step=A(t.step),t.chunk=A(t.chunk),t.complete=A(t.complete),t.error=A(t.error),delete t.worker,n.postMessage({input:e,config:t,workerId:n.id})},l.unparse=function(e,t){var n=!1,p=!0,u=",",_=`\r
`,N='"',G=N+N,Y=!1,w=null,D=!1,v=((()=>{if(typeof t=="object"){if(typeof t.delimiter!="string"||l.BAD_DELIMITERS.filter(function(E){return t.delimiter.indexOf(E)!==-1}).length||(u=t.delimiter),typeof t.quotes!="boolean"&&typeof t.quotes!="function"&&!Array.isArray(t.quotes)||(n=t.quotes),typeof t.skipEmptyLines!="boolean"&&typeof t.skipEmptyLines!="string"||(Y=t.skipEmptyLines),typeof t.newline=="string"&&(_=t.newline),typeof t.quoteChar=="string"&&(N=t.quoteChar),typeof t.header=="boolean"&&(p=t.header),Array.isArray(t.columns)){if(t.columns.length===0)throw new Error("Option columns is empty");w=t.columns}t.escapeChar!==void 0&&(G=t.escapeChar+N),t.escapeFormulae instanceof RegExp?D=t.escapeFormulae:typeof t.escapeFormulae=="boolean"&&t.escapeFormulae&&(D=/^[=+\-@\t\r].*$/)}})(),new RegExp(ie(N),"g"));if(typeof e=="string"&&(e=JSON.parse(e)),Array.isArray(e)){if(!e.length||Array.isArray(e[0]))return H(null,e,Y);if(typeof e[0]=="object")return H(w||Object.keys(e[0]),e,Y)}else if(typeof e=="object")return typeof e.data=="string"&&(e.data=JSON.parse(e.data)),Array.isArray(e.data)&&(e.fields||(e.fields=e.meta&&e.meta.fields||w),e.fields||(e.fields=Array.isArray(e.data[0])?e.fields:typeof e.data[0]=="object"?Object.keys(e.data[0]):[]),Array.isArray(e.data[0])||typeof e.data[0]=="object"||(e.data=[e.data])),H(e.fields||[],e.data||[],Y);throw new Error("Unable to serialize unrecognized input");function H(E,f,W){var M="",U=(typeof E=="string"&&(E=JSON.parse(E)),typeof f=="string"&&(f=JSON.parse(f)),Array.isArray(E)&&0<E.length),V=!Array.isArray(f[0]);if(U&&p){for(var $=0;$<E.length;$++)0<$&&(M+=u),M+=y(E[$],$);0<f.length&&(M+=_)}for(var L=0;L<f.length;L++){var P=(U?E:f[L]).length,x=!1,T=U?Object.keys(f[L]).length===0:f[L].length===0;if(W&&!U&&(x=W==="greedy"?f[L].join("").trim()==="":f[L].length===1&&f[L][0].length===0),W==="greedy"&&U){for(var j=[],I=0;I<P;I++){var S=V?E[I]:I;j.push(f[L][S])}x=j.join("").trim()===""}if(!x){for(var k=0;k<P;k++){0<k&&!T&&(M+=u);var K=U&&V?E[k]:k;M+=y(f[L][K],k)}L<f.length-1&&(!W||0<P&&!T)&&(M+=_)}}return M}function y(E,f){var W,M;return E==null?"":E.constructor===Date?JSON.stringify(E).slice(1,25):(M=!1,D&&typeof E=="string"&&D.test(E)&&(E="'"+E,M=!0),W=E.toString().replace(v,G),(M=M||n===!0||typeof n=="function"&&n(E,f)||Array.isArray(n)&&n[f]||((U,V)=>{for(var $=0;$<V.length;$++)if(-1<U.indexOf(V[$]))return!0;return!1})(W,l.BAD_DELIMITERS)||-1<W.indexOf(u)||W.charAt(0)===" "||W.charAt(W.length-1)===" ")?N+W+N:W)}},l.RECORD_SEP="",l.UNIT_SEP="",l.BYTE_ORDER_MARK="\uFEFF",l.BAD_DELIMITERS=["\r",`
`,'"',l.BYTE_ORDER_MARK],l.WORKERS_SUPPORTED=!c&&!!a.Worker,l.NODE_STREAM_INPUT=1,l.LocalChunkSize=10485760,l.RemoteChunkSize=5242880,l.DefaultDelimiter=",",l.Parser=ae,l.ParserHandle=de,l.NetworkStreamer=C,l.FileStreamer=g,l.StringStreamer=R,l.ReadableStreamStreamer=J,a.jQuery&&((o=a.jQuery).fn.parse=function(e){var t=e.config||{},n=[];return this.each(function(_){if(!(o(this).prop("tagName").toUpperCase()==="INPUT"&&o(this).attr("type").toLowerCase()==="file"&&a.FileReader)||!this.files||this.files.length===0)return!0;for(var N=0;N<this.files.length;N++)n.push({file:this.files[N],inputElem:this,instanceConfig:o.extend({},t)})}),p(),this;function p(){if(n.length===0)A(e.complete)&&e.complete();else{var _,N,G,Y,w=n[0];if(A(e.before)){var D=e.before(w.file,w.inputElem);if(typeof D=="object"){if(D.action==="abort")return _="AbortError",N=w.file,G=w.inputElem,Y=D.reason,void(A(e.error)&&e.error({name:_},N,G,Y));if(D.action==="skip")return void u();typeof D.config=="object"&&(w.instanceConfig=o.extend(w.instanceConfig,D.config))}else if(D==="skip")return void u()}var v=w.instanceConfig.complete;w.instanceConfig.complete=function(H){A(v)&&v(H,w.file,w.inputElem),u()},l.parse(w.file,w.instanceConfig)}}function u(){n.splice(0,1),p()}}),h&&(a.onmessage=function(e){e=e.data,l.WORKER_ID===void 0&&e&&(l.WORKER_ID=e.workerId),typeof e.input=="string"?a.postMessage({workerId:l.WORKER_ID,results:l.parse(e.input,e.config),finished:!0}):(a.File&&e.input instanceof File||e.input instanceof Object)&&(e=l.parse(e.input,e.config))&&a.postMessage({workerId:l.WORKER_ID,results:e,finished:!0})}),(C.prototype=Object.create(d.prototype)).constructor=C,(g.prototype=Object.create(d.prototype)).constructor=g,(R.prototype=Object.create(R.prototype)).constructor=R,(J.prototype=Object.create(d.prototype)).constructor=J,l})})(Ce);var Fe=Ce.exports;const De=Ie(Fe),Pe=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function z(s){return`${s.getDate()} ${Pe[s.getMonth()]} ${s.getFullYear()}`}function me(s){if(!s||String(s).trim()==="")return null;const i=String(s).trim(),[r,a="0:0:0"]=i.split(" "),o=r.split("/");if(o.length<3)return null;const[c,h,b]=o,[m=0,l=0,d=0]=(a||"0:0:0").split(":"),C=new Date(+b,+c-1,+h,+m,+l,+d);return isNaN(C.getTime())?null:C}function Ee(s){const i=s.map(b=>b.CreatedOn).filter(Boolean);if(!i.length)throw new Error("No valid CreatedOn dates found in CSV.");const r=new Date(Math.max(...i.map(b=>b.getTime())));r.setHours(0,0,0,0);const a=new Date(r),o=new Date(r);o.setDate(o.getDate()-6);const c=new Date(o);c.setDate(c.getDate()-1);const h=new Date(c);return h.setDate(h.getDate()-6),{lwr:[o,a],pwr:[h,c],rd:r}}function be(s,i,r){const a=new Date(r);return a.setHours(23,59,59,999),s.filter(o=>o.CreatedOn&&o.CreatedOn>=i&&o.CreatedOn<=a)}function le(s,i=1/0){const r={};return s.forEach(a=>{a!=null&&a!==""&&(r[a]=(r[a]||0)+1)}),Object.entries(r).sort((a,o)=>o[1]-a[1]).slice(0,i).map(([a,o])=>({label:a,count:o}))}function $e(s,i){const r=[...new Set([...s.map(h=>h.label),...i.map(h=>h.label)])],a=Object.fromEntries(s.map(h=>[h.label,h.count])),o=Object.fromEntries(i.map(h=>[h.label,h.count])),c=r.map(h=>({type:h,lw:a[h]||0,pw:o[h]||0,delta:(a[h]||0)-(o[h]||0)}));return c.sort((h,b)=>b.lw-h.lw),c}function se(s,i="110px",r="#52B043"){if(!s||!s.length)return"";const a=Math.max(...s.map(o=>o.count),1);return s.map(o=>{const c=Math.round(o.count/a*100);return`<div class="hbar-row"><div class="hbar-name" style="width:${i}">${o.label}</div><div class="hbar-track"><div class="hbar-fill" style="width:${c}%;background:${r}"></div></div><div class="hbar-val">${o.count}</div></div>`}).join("")}function Me(s){return s.map((i,r)=>{const a=i.delta,o=a>0?`<span class="change-up">${a} &#9650;</span>`:a<0?`<span class="change-down">${Math.abs(a)} &#9660;</span>`:'<span class="change-flat">0 &mdash;</span>';return`<tr><td class='no'>${r+1}</td><td>${i.type}</td><td class='num'>${i.lw}</td><td class='num'>${i.pw}</td><td class='num'>${o}</td></tr>`}).join("")}function Le(s){return`<div class="stats-row" style="margin-top:10px;">
    <div class="stat-box"><div class="s-val">${s.resolved}</div><div class="s-lbl">Total Resolved</div><div class="s-pct">${s.resolve_pct}%</div></div>
    <div class="stat-box"><div class="s-val">${s.resolve_overdue}</div><div class="s-lbl">Resolve Overdue</div><div class="s-pct">&nbsp;</div></div>
    <div class="stat-box orange"><div class="s-val">${s.active}</div><div class="s-lbl">Total Active</div><div class="s-pct">${s.active_pct}%</div></div>
    <div class="stat-box pink"><div class="s-val">${s.active_overdue}</div><div class="s-lbl">Active Overdue</div><div class="s-pct">${s.active_od_pct}%</div></div>
  </div>`}function Oe(s,i=!1){return`<div style="${i?"":"margin-top:10px;"}"><div class="chart-label">SLA Completion (Last Week)</div>
    <div class="sla-row"><div class="sla-name">Passed</div>
      <div class="sla-track"><div class="sla-fill" style="width:${s.sla_pass_pct}%"></div></div>
      <div class="sla-val">${s.sla_pass} <span style="color:#52B043">(${s.sla_pass_pct}%)</span></div>
    </div>
    <div class="sla-row"><div class="sla-name">Failed</div>
      <div class="sla-track"><div class="sla-fill" style="width:${s.sla_fail_pct}%;background:#D9534F"></div></div>
      <div class="sla-val">${s.sla_fail} <span style="color:#D9534F">(${s.sla_fail_pct}%)</span></div>
    </div>
  </div>`}function Se(s,i,r,a,o){return`<div class="sec-header">Comparing Cases</div>
    <table class="compare-table"><thead><tr>
      <th>No.</th><th class="left">Top Event Type</th>
      <th>Last Week<br><small>(${a})</small></th>
      <th>Previous Week<br><small>(${o})</small></th>
      <th>Change</th>
    </tr></thead>
    <tbody>${Me(s)}</tbody></table>
    <div class="sla-callout-grid">
      <div class="sla-callout-green"><strong style="color:#1B5E20;">Prev Week SLA (${o})</strong><br>
        Passed: ${r.sla_pass} (${r.sla_pass_pct}%) &nbsp;|&nbsp; Failed: ${r.sla_fail} (${r.sla_fail_pct}%)</div>
      <div class="sla-callout-blue"><strong style="color:#0D47A1;">Last Week SLA (${a})</strong><br>
        Passed: ${i.sla_pass} (${i.sla_pass_pct}%) &nbsp;|&nbsp; Failed: ${i.sla_fail} (${i.sla_fail_pct}%)</div>
    </div>`}function ze(s,i){const r=new Date,a=l=>String(l).padStart(2,"0"),o=`${r.getFullYear()}${a(r.getMonth()+1)}${a(r.getDate())}_${a(r.getHours())}${a(r.getMinutes())}${a(r.getSeconds())}`,c=`PARQ_${i}_${o}.html`,h=new Blob([s],{type:"text/html;charset=utf-8"}),b=URL.createObjectURL(h),m=document.createElement("a");return m.href=b,m.download=c,m.click(),URL.revokeObjectURL(b),c}function Ae(s){return`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${s}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"><\/script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5;color:#222;font-size:13px}
.page{max-width:1280px;margin:0 auto;background:white;padding:14px 16px}
.page-title{background:#2C5F1E;color:white;text-align:center;padding:8px 12px;font-size:17px;font-weight:700;letter-spacing:.5px;margin-bottom:12px}
.period-row{display:flex;justify-content:center;gap:30px;margin-bottom:12px;font-size:12px;color:#555}
.period-row span strong{color:#2C5F1E}
.sec-header{background:#2C5F1E;color:white;font-weight:700;font-size:13px;text-align:center;padding:5px 10px;border-radius:3px;margin-bottom:8px}
.main-grid{display:grid;grid-template-columns:48% 52%;gap:14px}
.left-col{display:flex;flex-direction:column;gap:12px}
.case-summary-inner{display:grid;grid-template-columns:210px 1fr;gap:14px;align-items:start}
.donut-wrap{position:relative;width:190px;height:190px;margin:0 auto}
.donut-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none}
.donut-center .big{font-size:28px;font-weight:700;color:#222}
.donut-center .sub{font-size:11px;color:#555}
.stats-row{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-top:8px}
.stat-box{border:1.5px solid #ddd;border-radius:4px;padding:6px 4px;text-align:center}
.stat-box .s-val{font-size:20px;font-weight:700;color:#2C5F1E}
.stat-box.orange .s-val{color:#E87329}
.stat-box.pink .s-val{color:#D9534F}
.stat-box .s-lbl{font-size:10px;color:#555;margin-top:1px}
.stat-box .s-pct{font-size:11px;font-weight:600;color:#333;margin-top:2px}
.stat-box.orange{background:#FFF0E6;border-color:#E87329}
.stat-box.pink{background:#FFF0F0;border-color:#D9534F}
.chart-label{font-size:12px;font-weight:600;color:#333;margin-bottom:6px}
.hbar-row{display:flex;align-items:center;gap:6px;margin-bottom:5px;height:20px}
.hbar-name{text-align:right;font-size:11px;color:#444;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbar-track{flex:1;background:#eee;height:14px;border-radius:2px;overflow:hidden}
.hbar-fill{height:100%;border-radius:2px;transition:width .3s}
.hbar-val{width:32px;font-size:11px;color:#333;font-weight:600;flex-shrink:0}
.sla-row{display:flex;align-items:center;gap:6px;margin-bottom:5px}
.sla-name{width:55px;text-align:right;font-size:11px;color:#444}
.sla-track{flex:1;background:#eee;height:13px;border-radius:2px;overflow:hidden}
.sla-fill{height:100%;background:#52B043;border-radius:2px}
.sla-val{font-size:11px;color:#333;font-weight:600;width:70px}
.top5-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.week-col .week-label{font-size:12px;font-weight:700;color:#333;margin-bottom:6px}
.right-col{display:flex;flex-direction:column;gap:12px}
.highlight-box{border:1px solid #ddd;padding:10px 12px;border-radius:4px;line-height:1.55;font-size:11.5px;color:#444}
.compare-table{width:100%;border-collapse:collapse;font-size:12px}
.compare-table thead tr th{background:#2C5F1E;color:white;padding:6px 8px;text-align:center;font-weight:600}
.compare-table thead tr th.left{text-align:left}
.compare-table tbody tr{border-bottom:1px solid #e8e8e8}
.compare-table tbody tr:hover{background:#f9fff6}
.compare-table tbody td{padding:6px 8px}
.compare-table tbody td.num{text-align:center}
.compare-table tbody td.no{text-align:center;color:#888}
.change-up{background:#E8F5E9;color:#2C5F1E;font-weight:700;border-radius:3px;padding:1px 6px;white-space:nowrap}
.change-down{background:#FFEBEE;color:#C62828;font-weight:700;border-radius:3px;padding:1px 6px;white-space:nowrap}
.change-flat{background:#F5F5F5;color:#777;font-weight:600;border-radius:3px;padding:1px 6px}
.bottom-row{margin-top:12px}
.bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.footnote{text-align:center;font-size:10px;color:#999;margin-top:10px;padding-top:8px;border-top:1px solid #eee}
.sla-callout-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.sla-callout-green{background:#E8F5E9;border:1px solid #A5D6A7;border-radius:4px;padding:7px 10px;font-size:11.5px}
.sla-callout-blue{background:#E3F2FD;border:1px solid #90CAF9;border-radius:4px;padding:7px 10px;font-size:11.5px}
</style></head><body>`}function Re(s,i){const r=JSON.stringify([s.resolved,s.active,s.cancelled]),a=s.total||1,o=JSON.stringify(i.events.map(m=>m.label)),c=JSON.stringify(i.events.map(m=>m.count)),h=JSON.stringify(s.events.map(m=>m.label)),b=JSON.stringify(s.events.map(m=>m.count));return`<script>
new Chart(document.getElementById('donutChart'),{
  type:'doughnut',
  data:{labels:['Total Resolved','Total Active','Cancelled'],datasets:[{data:${r},backgroundColor:['#1A6B3C','#E87329','#CCCCCC'],borderWidth:2,borderColor:'#fff'}]},
  options:{responsive:false,cutout:'62%',plugins:{legend:{display:true,position:'bottom',labels:{font:{size:10},boxWidth:12,padding:8}},
    tooltip:{callbacks:{label:ctx=>' '+ctx.label+': '+ctx.raw+' ('+Math.round(ctx.raw/${a}*100)+'%)'}}}}
});
const bO={responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>' '+ctx.raw+' cases'}}},
  scales:{x:{ticks:{font:{size:9},maxRotation:40,minRotation:20},grid:{display:false}},y:{ticks:{font:{size:10},precision:0},grid:{color:'#eee'}}}};
new Chart(document.getElementById('prevWeekChart'),{type:'bar',data:{labels:${o},datasets:[{label:'Cases',data:${c},backgroundColor:'#52B043',borderRadius:3,borderSkipped:false}]},options:bO});
new Chart(document.getElementById('lastWeekChart'),{type:'bar',data:{labels:${h},datasets:[{label:'Cases',data:${b},backgroundColor:'#2C5F1E',borderRadius:3,borderSkipped:false}]},options:bO});
<\/script></body></html>`}const Ne={10:"Common Area 10",9:"Office Zone 9",8:"Office Zone 8",7:"Retail Zone 7",974:"External / Other",6:"Ground Zone 6",257:"Other Zone"},We={1:"Priority 1",2:"Priority 2",3:"Priority 3",6:"Priority 6"},Be=7,je=8,qe=new Set([4,5]);function Ue(s){if(!s)return"Other";const i=String(s).toLowerCase();return i.includes("แอร์")||i.includes("อุณหภูมิ")||i.includes("temperature")?"Aircon / Temperature":i.includes("ไฟ")||i.includes("หลอด")||i.includes("light")?"Lighting Faulty":i.includes("น้ำ")||i.includes("หยด")||i.includes("leak")?"Water Leak / Plumbing":i.includes("ประตู")||i.includes("มือจับ")||i.includes("door")?"Door / Lock":i.includes("แม่บ้าน")||i.includes("ทำความสะอาด")?"Cleaning":i.includes("กระเบื้อง")||i.includes("พื้น")||i.includes("tile")?"Floor / Tile":i.includes("ลิฟต์")||i.includes("lift")?"Lift / Elevator":i.includes("smoke")||i.includes("alarm")||i.includes("fire")?"Fire Alarm":"Other"}function He(s){return s.map(i=>{const r=+i.StatusId,a=me(i.CreatedOn),o=me(i.ActualCompletionDateTime),c=me(i.SlatoResolve),h=r===Be,b=r===je,m=qe.has(r),l=!!(o&&c&&o<=c),d=!!(o&&c&&o>c),C=i.TopLocation_Name?i.TopLocation_Name||"Other Zone":Ne[+i.TopLocationId]||"Other Zone",g=i.Priority_Name?i.Priority_Name||"Unknown":We[+i.PriorityId]||"Unknown",R=i.Asset_Name?i.Asset_Name||"No Asset Linked":i.AssetId&&+i.AssetId!=0?`Asset ${+i.AssetId}`:"No Asset Linked";return{...i,CreatedOn:a,ActualCompletionDateTime:o,SlatoResolve:c,EventType:Ue(i.Description),LocationLbl:C,PriorityLbl:g,AssetLbl:R,IsResolved:h,IsCancelled:b,IsActive:m,IsOverdue:i.IsOverdue==="True"||i.IsOverdue==="true"||i.IsOverdue===!0,SlaPass:l,SlaFail:d}})}function ke(s){const i=s.length,r=s.filter(d=>d.IsResolved).length,a=s.filter(d=>d.IsCancelled).length,o=s.filter(d=>d.IsActive).length,c=s.filter(d=>d.IsResolved&&d.SlaFail).length,h=s.filter(d=>d.IsActive&&d.IsOverdue).length,b=s.filter(d=>d.SlaPass).length,m=s.filter(d=>d.SlaFail).length,l=b+m;return{total:i,resolved:r,cancelled:a,active:o,resolve_overdue:c,active_overdue:h,resolve_pct:i?Math.round(r/i*1e4)/100:0,active_pct:i?Math.round(o/i*1e4)/100:0,active_od_pct:o?Math.round(h/o*1e4)/100:0,sla_pass:b,sla_fail:m,sla_pass_pct:l?Math.round(b/l*1e3)/10:0,sla_fail_pct:l?Math.round(m/l*1e3)/10:0,priorities:le(s.map(d=>d.PriorityLbl)),locations:le(s.map(d=>d.LocationLbl),6),events:le(s.map(d=>d.EventType),8),assets:le(s.filter(d=>d.AssetLbl!=="No Asset Linked").map(d=>d.AssetLbl),6)}}function Ke(s,i,r,a,o,c){var ae,ce,re;const[h,b]=a,[m,l]=o,d=`${z(h)} – ${z(b)}`,C=`${z(m)} – ${z(l)}`,g=((ae=r[0])==null?void 0:ae.type)||"N/A",R=((ce=r[0])==null?void 0:ce.lw)||0,J=((re=r[0])==null?void 0:re.pw)||0,de=s.assets.length?se(s.assets,"160px","#3A7EBF"):'<p style="font-size:11px;color:#999;font-style:italic;">No assets linked.</p>',ie=`
<div class="page">
  <div class="page-title">WEEKLY OPS MEETING — Corrective Work Orders | The PARQ</div>
  <div class="period-row">
    <span>Report Date: <strong>${z(c)}</strong></span>
    <span>Last Week: <strong>${d}</strong></span>
    <span>Previous Week: <strong>${C}</strong></span>
  </div>
  <div class="main-grid">
    <div class="left-col">
      <div>
        <div class="sec-header">Case Summary</div>
        <div class="case-summary-inner">
          <div>
            <div class="donut-wrap">
              <canvas id="donutChart" width="190" height="190"></canvas>
              <div class="donut-center"><div class="big">${s.total}</div><div class="sub">Total cases</div></div>
            </div>
          </div>
          <div>
            <div class="chart-label">Cases by priority level</div>${se(s.priorities)}
            <div class="chart-label" style="margin-top:10px;">Cases by Location</div>${se(s.locations)}
          </div>
        </div>
        ${Le(s)}
        ${Oe(s)}
      </div>
      <div>
        <div class="sec-header">Top Event Type by Week</div>
        <div class="top5-grid">
          <div class="week-col"><div class="week-label">${C}</div>${se(i.events,"130px")}</div>
          <div class="week-col"><div class="week-label">${d}</div>${se(s.events,"130px")}</div>
        </div>
      </div>
      <div>
        <div class="sec-header">Top Assets with Cases (Last Week)</div>
        ${de}
      </div>
    </div>
    <div class="right-col">
      <div>
        <div class="sec-header">Highlight Cases (Last Week: ${d})</div>
        <div class="highlight-box">
          <p style="color:#888;font-style:italic;">Auto-generated — add narrative manually.</p><br>
          <p><strong>Top Issue:</strong> ${g} — ${R} cases last week (vs ${J} previous week).</p><br>
          <p><strong>Active Overdue: ${s.active_overdue} case(s)</strong> require follow-up.</p>
        </div>
      </div>
      <div>${Se(r,s,i,d,C)}</div>
    </div>
  </div>
  <div class="bottom-row">
    <div class="sec-header" style="margin-top:12px;">Weekly Volume Comparison</div>
    <div class="bottom-grid">
      <div>
        <div class="chart-label" style="margin-bottom:8px;">${C}: ${i.total} Total Cases by Event Type</div>
        <canvas id="prevWeekChart" height="200"></canvas>
      </div>
      <div>
        <div class="chart-label" style="margin-bottom:8px;">${d}: ${s.total} Total Cases by Event Type</div>
        <canvas id="lastWeekChart" height="200"></canvas>
      </div>
    </div>
  </div>
  <div class="footnote">Data Source: MZ_PARQ_CWO_Enriched.csv &nbsp;|&nbsp; Last Week: ${d} (${s.total} records) &nbsp;|&nbsp; Previous Week: ${C} (${i.total} records) &nbsp;|&nbsp; Generated: ${z(c)}</div>
</div>`;return Ae("PARQ – Weekly CWO Report")+ie+Re(s,i)}function Qe(s){const i=He(s),r=[`Loaded ${i.length.toLocaleString()} rows`],{lwr:a,pwr:o,rd:c}=Ee(i),[h,b]=a,[m,l]=o;r.push(`Last Week: ${z(h)} – ${z(b)}`),r.push(`Prev Week: ${z(m)} – ${z(l)}`);const d=be(i,h,b),C=be(i,m,l);r.push(`Records → LW:${d.length}  PW:${C.length}`);const g=ke(d),R=ke(C),J=$e(g.events,R.events);return{html:Ke(g,R,J,a,o,c),logs:r}}const Ze=101,Je=4,Ge=new Set([1,2]),Ye={6:"Car Park",7:"Retail West Wing",8:"Retail East Wing",9:"Office West Wing",10:"Office East Wing",974:"PARQ"};function Ve(s){if(!s)return"Other";const i=String(s).split(" - ")[0].trim();return(i.length>35?i.slice(0,33)+"…":i)||"Other"}function Xe(s){return s.map(i=>{const r=+i.StatusCode,a=me(i.CreatedOn),o=me(i.SLADate),c=r===Ze,h=r===Je,b=Ge.has(r),m=String(i.IsFalseAlarm||"").trim().toLowerCase()==="true",l=String(i.SLAFailed||"").trim().toLowerCase()==="true",d=c&&!!o&&!l,C=l;let g;i.EventType_Description?g=Ve(i.EventType_Description):i.EventType_Code?g=String(i.EventType_Code).replace(/_/g," "):g="Other";let R;return i.Location_TopLocationId!=null&&i.Location_TopLocationId!==""?R=Ye[+i.Location_TopLocationId]||"Other Zone":i.Location_Name?R=i.Location_Name||"Other Zone":R="Other Zone",{...i,CreatedOn:a,SLADate:o,EventTypeLbl:g,LocationLbl:R,PriorityLbl:i.Priority_Name||"Unknown",EquipmentLbl:i.EquipmentTag||"No Equipment",IsResolved:c,IsActive:h,IsCancelled:b,IsFalseAlarm:m,SlaFailed:l,SlaPass:d,SlaFail:C}})}function we(s,i){const r=s.length,a=s.filter(g=>g.IsResolved).length,o=s.filter(g=>g.IsCancelled).length,c=s.filter(g=>g.IsActive).length,h=s.filter(g=>g.IsFalseAlarm).length,b=s.filter(g=>g.IsResolved&&g.SlaFail).length,m=s.filter(g=>g.IsActive&&g.SLADate&&g.SLADate<i).length,l=s.filter(g=>g.SlaPass).length,d=s.filter(g=>g.SlaFail).length,C=l+d;return{total:r,resolved:a,cancelled:o,active:c,false_alarm:h,resolve_overdue:b,active_overdue:m,resolve_pct:r?Math.round(a/r*1e4)/100:0,active_pct:r?Math.round(c/r*1e4)/100:0,active_od_pct:c?Math.round(m/c*1e4)/100:0,sla_pass:l,sla_fail:d,sla_pass_pct:C?Math.round(l/C*1e3)/10:0,sla_fail_pct:C?Math.round(d/C*1e3)/10:0,priorities:le(s.map(g=>g.PriorityLbl)),locations:le(s.map(g=>g.LocationLbl),6),events:le(s.map(g=>g.EventTypeLbl),8),equipments:le(s.filter(g=>g.EquipmentLbl!=="No Equipment").map(g=>g.EquipmentLbl),6)}}function et(s,i,r,a,o,c){var re,fe,ue;const[h,b]=a,[m,l]=o,d=`${z(h)} – ${z(b)}`,C=`${z(m)} – ${z(l)}`,g=((re=r[0])==null?void 0:re.type)||"N/A",R=((fe=r[0])==null?void 0:fe.lw)||0,J=((ue=r[0])==null?void 0:ue.pw)||0,de=s.total?Math.round(s.false_alarm/s.total*1e3)/10:0,ie=s.equipments.length?se(s.equipments,"110px","#3A7EBF"):'<p style="font-size:11px;color:#999;font-style:italic;">No equipment linked.</p>',ae=`<div style="background:#FFF8E1;border:1px solid #FFD54F;border-radius:4px;padding:8px 10px;font-size:12px;">
    <div style="font-size:22px;font-weight:700;color:#E65100;">${s.false_alarm}</div>
    <div style="font-size:10px;color:#555;margin-top:2px;">False Alarm Cases <span style="font-weight:600;color:#E65100;">(${de}% of total)</span></div>
  </div>`,ce=`
<div class="page">
  <div class="page-title">WEEKLY OPS MEETING — Case Management | The PARQ</div>
  <div class="period-row">
    <span>Report Date: <strong>${z(c)}</strong></span>
    <span>Last Week: <strong>${d}</strong></span>
    <span>Previous Week: <strong>${C}</strong></span>
  </div>
  <div class="main-grid">
    <div class="left-col">
      <div>
        <div class="sec-header">Case Summary</div>
        <div class="case-summary-inner">
          <div>
            <div class="donut-wrap">
              <canvas id="donutChart" width="190" height="190"></canvas>
              <div class="donut-center"><div class="big">${s.total}</div><div class="sub">Total cases</div></div>
            </div>
          </div>
          <div>
            <div class="chart-label">Cases by priority level</div>${se(s.priorities)}
            <div class="chart-label" style="margin-top:10px;">Cases by Location</div>${se(s.locations)}
          </div>
        </div>
        ${Le(s)}
        <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;">
          <div><div class="chart-label">False Alarm (Last Week)</div>${ae}</div>
          <div>${Oe(s,!0)}</div>
        </div>
      </div>
      <div>
        <div class="sec-header">Top Event Type by Week</div>
        <div class="top5-grid">
          <div class="week-col"><div class="week-label">${C}</div>${se(i.events,"150px")}</div>
          <div class="week-col"><div class="week-label">${d}</div>${se(s.events,"150px")}</div>
        </div>
      </div>
      <div>
        <div class="sec-header">Top Equipment Tags with Cases (Last Week)</div>
        ${ie}
      </div>
    </div>
    <div class="right-col">
      <div>
        <div class="sec-header">Highlight Cases (Last Week: ${d})</div>
        <div class="highlight-box">
          <p style="color:#888;font-style:italic;">Auto-generated — add narrative manually.</p><br>
          <p><strong>Top Issue:</strong> ${g} — ${R} cases last week (vs ${J} previous week).</p><br>
          <p><strong>False Alarms: ${s.false_alarm} case(s)</strong> (${de}% of total).</p><br>
          <p><strong>Active Overdue: ${s.active_overdue} case(s)</strong> require follow-up.</p>
        </div>
      </div>
      <div>${Se(r,s,i,d,C)}</div>
    </div>
  </div>
  <div class="bottom-row">
    <div class="sec-header" style="margin-top:12px;">Weekly Volume Comparison</div>
    <div class="bottom-grid">
      <div>
        <div class="chart-label" style="margin-bottom:8px;">${C}: ${i.total} Total Cases by Event Type</div>
        <canvas id="prevWeekChart" height="200"></canvas>
      </div>
      <div>
        <div class="chart-label" style="margin-bottom:8px;">${d}: ${s.total} Total Cases by Event Type</div>
        <canvas id="lastWeekChart" height="200"></canvas>
      </div>
    </div>
  </div>
  <div class="footnote">Data Source: MZ_PARQ_Cases_Enriched.csv &nbsp;|&nbsp; Last Week: ${d} (${s.total} records) &nbsp;|&nbsp; Previous Week: ${C} (${i.total} records) &nbsp;|&nbsp; Generated: ${z(c)}</div>
</div>`;return Ae("PARQ – Weekly Case Management Report")+ce+Re(s,i)}function tt(s){const i=Xe(s),r=[`Loaded ${i.length.toLocaleString()} rows`],{lwr:a,pwr:o,rd:c}=Ee(i),[h,b]=a,[m,l]=o;r.push(`Last Week: ${z(h)} – ${z(b)}`),r.push(`Prev Week: ${z(m)} – ${z(l)}`);const d=be(i,h,b),C=be(i,m,l);r.push(`Records → LW:${d.length}  PW:${C.length}`);const g=we(d,b),R=we(C,l),J=$e(g.events,R.events);return{html:et(g,R,J,a,o,c),logs:r}}function st(s){return new Promise((i,r)=>{De.parse(s,{header:!0,skipEmptyLines:!0,complete:a=>i(a.data),error:a=>r(new Error(a.message||"CSV parse error"))})})}window.sw=function(s){document.getElementById("pCWO").classList.toggle("show",s==="cwo"),document.getElementById("pCase").classList.toggle("show",s==="case"),document.getElementById("tCWO").className="tab"+(s==="cwo"?" g":""),document.getElementById("tCase").className="tab"+(s==="case"?" b":"")};window.of=function(s,i){if(i.files.length>0){const r=document.getElementById(s+"Fn");r.textContent="✓ "+i.files[0].name,r.style.display="block"}};["cwo","case"].forEach(s=>{const i=document.getElementById(s+"Dz");i&&(i.addEventListener("dragover",r=>{r.preventDefault(),i.classList.add("ov")}),i.addEventListener("dragleave",()=>i.classList.remove("ov")),i.addEventListener("drop",r=>{r.preventDefault(),i.classList.remove("ov");const a=r.dataTransfer.files[0];if(!a)return;const o=new DataTransfer;o.items.add(a),document.getElementById(s+"Fi").files=o.files;const c=document.getElementById(s+"Fn");c.textContent="✓ "+a.name,c.style.display="block"}))});window.gen=async function(s){const i=s==="case",r=document.getElementById(s+"Fi"),a=document.getElementById(s+"Sb"),o=document.getElementById(s+"Lb"),c=document.getElementById(s+"BG"),h=document.getElementById(s+"BT"),b=document.getElementById(s+"Sp");if(!r.files.length){a.className="sb er",a.style.display="block",a.innerHTML='<span class="si">❌</span>Please select a CSV file first.';return}c.disabled=!0,h.textContent="Generating…",b.style.display="inline-block",a.style.display="none",o.style.display="none";try{const m=await st(r.files[0]),{html:l,logs:d}=i?tt(m):Qe(m),g=ze(l,i?"Case_Weekly_Report":"CWO_Weekly_Report");a.className="sb ok "+(i?"bn":"gn"),a.innerHTML=`<span class="si">✅</span><strong>Dashboard generated!</strong><br>File downloaded as:<br><code style="font-size:11px;">${g}</code>`,o.innerHTML=d.map(R=>`<div>${R}</div>`).join(""),o.style.display="block"}catch(m){a.className="sb er",a.innerHTML=`<span class="si">❌</span><strong>Error:</strong> ${m.message}`,console.error(m)}a.style.display="block",c.disabled=!1,b.style.display="none",h.textContent=i?"📋 Generate Case Management Dashboard":"⚡ Generate CWO Dashboard"};
