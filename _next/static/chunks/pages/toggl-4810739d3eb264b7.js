(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[567],{2948:function(e,t,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/toggl",function(){return r(5139)}])},2602:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{default:function(){return s},noSSR:function(){return n}});let l=r(8754);r(5893),r(7294);let a=l._(r(5491));function o(e){return{default:(null==e?void 0:e.default)||e}}function n(e,t){return delete t.webpack,delete t.modules,e(t)}function s(e,t){let r=a.default,l={loading:e=>{let{error:t,isLoading:r,pastDelay:l}=e;return null}};e instanceof Promise?l.loader=()=>e:"function"==typeof e?l.loader=e:"object"==typeof e&&(l={...l,...e});let s=(l={...l,...t}).loader;return(l.loadableGenerated&&(l={...l,...l.loadableGenerated},delete l.loadableGenerated),"boolean"!=typeof l.ssr||l.ssr)?r({...l,loader:()=>null!=s?s().then(o):Promise.resolve(o(()=>null))}):(delete l.webpack,delete l.modules,n(r,l))}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},1159:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"LoadableContext",{enumerable:!0,get:function(){return l}});let l=r(8754)._(r(7294)).default.createContext(null)},5491:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return f}});let l=r(8754)._(r(7294)),a=r(1159),o=[],n=[],s=!1;function i(e){let t=e(),r={loading:!0,loaded:null,error:null};return r.promise=t.then(e=>(r.loading=!1,r.loaded=e,e)).catch(e=>{throw r.loading=!1,r.error=e,e}),r}class d{promise(){return this._res.promise}retry(){this._clearTimeouts(),this._res=this._loadFn(this._opts.loader),this._state={pastDelay:!1,timedOut:!1};let{_res:e,_opts:t}=this;e.loading&&("number"==typeof t.delay&&(0===t.delay?this._state.pastDelay=!0:this._delay=setTimeout(()=>{this._update({pastDelay:!0})},t.delay)),"number"==typeof t.timeout&&(this._timeout=setTimeout(()=>{this._update({timedOut:!0})},t.timeout))),this._res.promise.then(()=>{this._update({}),this._clearTimeouts()}).catch(e=>{this._update({}),this._clearTimeouts()}),this._update({})}_update(e){this._state={...this._state,error:this._res.error,loaded:this._res.loaded,loading:this._res.loading,...e},this._callbacks.forEach(e=>e())}_clearTimeouts(){clearTimeout(this._delay),clearTimeout(this._timeout)}getCurrentValue(){return this._state}subscribe(e){return this._callbacks.add(e),()=>{this._callbacks.delete(e)}}constructor(e,t){this._loadFn=e,this._opts=t,this._callbacks=new Set,this._delay=null,this._timeout=null,this.retry()}}function u(e){return function(e,t){let r=Object.assign({loader:null,loading:null,delay:200,timeout:null,webpack:null,modules:null},t),o=null;function i(){if(!o){let t=new d(e,r);o={getCurrentValue:t.getCurrentValue.bind(t),subscribe:t.subscribe.bind(t),retry:t.retry.bind(t),promise:t.promise.bind(t)}}return o.promise()}if(!s){let e=r.webpack?r.webpack():r.modules;e&&n.push(t=>{for(let r of e)if(t.includes(r))return i()})}function u(e,t){!function(){i();let e=l.default.useContext(a.LoadableContext);e&&Array.isArray(r.modules)&&r.modules.forEach(t=>{e(t)})}();let n=l.default.useSyncExternalStore(o.subscribe,o.getCurrentValue,o.getCurrentValue);return l.default.useImperativeHandle(t,()=>({retry:o.retry}),[]),l.default.useMemo(()=>{var t;return n.loading||n.error?l.default.createElement(r.loading,{isLoading:n.loading,pastDelay:n.pastDelay,timedOut:n.timedOut,error:n.error,retry:o.retry}):n.loaded?l.default.createElement((t=n.loaded)&&t.default?t.default:t,e):null},[e,n])}return u.preload=()=>i(),u.displayName="LoadableComponent",l.default.forwardRef(u)}(i,e)}function c(e,t){let r=[];for(;e.length;){let l=e.pop();r.push(l(t))}return Promise.all(r).then(()=>{if(e.length)return c(e,t)})}u.preloadAll=()=>new Promise((e,t)=>{c(o).then(e,t)}),u.preloadReady=e=>(void 0===e&&(e=[]),new Promise(t=>{let r=()=>(s=!0,t());c(n,e).then(r,r)})),window.__NEXT_PRELOADREADY=u.preloadReady;let f=u},5139:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return u}});var l=r(5893),a=r(7294),o=r(6490),n=r(5152),s=r.n(n),i=r(3148);let d=s()(()=>r.e(495).then(r.bind(r,6495)).then(e=>e.Bar),{loadableGenerated:{webpack:()=>[null]},ssr:!1});function u(){let[e,t]=(0,a.useState)({labels:[],datasets:[]}),[r,n]=(0,a.useState)(!0),[s,i]=(0,a.useState)(null);return(0,a.useEffect)(()=>{(async function(){try{n(!0);let e=(0,o.eI)("https://oxhtyvhbjowtybdhdxfa.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aHR5dmhiam93dHliZGhkeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2NzIwMTAsImV4cCI6MjA1NTI0ODAxMH0.hbKqzjs1UWVfdiKUBdRBASNwyR9EGElJqGXzxojJ-u0");console.log("TogglPage: Starting toggl_entries query");let{data:r,error:l}=await e.from("toggl_entries").select("date, bucket, hours").order("date",{ascending:!0});if(console.log("TogglPage: toggl_entries query completed - ".concat(l?"Error: "+l.message:"Success - "+((null==r?void 0:r.length)||0)+" records")),l)throw l;if(r&&r.length>0){let e={},l=new Set;r.forEach(t=>{let r=t.date;e[r]||(e[r]={});let a=t.bucket||"Uncategorized";l.add(a),e[r][a]=(e[r][a]||0)+t.hours});let a=Object.keys(e).sort(),o=Array.from(l),n=["rgba(54, 162, 235, 0.8)","rgba(75, 192, 192, 0.8)","rgba(255, 99, 132, 0.8)","rgba(255, 206, 86, 0.8)","rgba(153, 102, 255, 0.8)","rgba(255, 159, 64, 0.8)"],s=o.map((t,r)=>({label:t,data:a.map(r=>e[r][t]||0),backgroundColor:n[r%n.length]}));t({labels:a,datasets:s})}}catch(e){console.error("Error fetching Toggl data:",e),i(e.message)}finally{n(!1)}})()},[]),(0,l.jsxs)("div",{className:"min-h-screen bg-gray-900 text-white p-6",children:[(0,l.jsx)("h1",{className:"text-2xl font-bold mb-6",children:"Time Tracking Dashboard"}),(0,l.jsx)("div",{className:"bg-gray-800 rounded-lg p-6 shadow-lg",children:r?(0,l.jsx)("div",{className:"flex justify-center items-center h-64",children:(0,l.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"})}):s?(0,l.jsxs)("div",{className:"text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500",children:[(0,l.jsx)("p",{className:"font-bold",children:"Error loading data:"}),(0,l.jsx)("p",{children:s})]}):e.datasets.length>0?(0,l.jsx)("div",{className:"h-96",children:(0,l.jsx)(d,{data:e,options:{responsive:!0,plugins:{legend:{position:"top",labels:{color:"#e5e7eb"}},title:{display:!0,text:"Time Tracking by Category",color:"#e5e7eb"}},scales:{x:{stacked:!0,grid:{color:"rgba(255, 255, 255, 0.1)"},ticks:{color:"#e5e7eb"}},y:{stacked:!0,grid:{color:"rgba(255, 255, 255, 0.1)"},ticks:{color:"#e5e7eb"},title:{display:!0,text:"Hours",color:"#e5e7eb"}}}}})}):(0,l.jsxs)("div",{className:"text-center py-12 text-gray-400",children:[(0,l.jsx)("p",{className:"text-xl mb-2",children:"No time tracking data available"}),(0,l.jsx)("p",{children:"Log your time in Toggl to see data here"})]})})]})}i.kL.register(i.uw,i.f$,i.ZL,i.Dx,i.u,i.De)},5152:function(e,t,r){e.exports=r(2602)}},function(e){e.O(0,[196,490,676,888,774,179],function(){return e(e.s=2948)}),_N_E=e.O()}]);