"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[376,495],{2376:function(e,t,r){r.r(t),r.d(t,{default:function(){return c}});var a=r(5893),s=r(7294),n=r(9558);let l={"list-check":(0,a.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,a.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"})}),percent:(0,a.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,a.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"})}),flame:(0,a.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[(0,a.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"}),(0,a.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"})]}),trophy:(0,a.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,a.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"})})},i={blue:"from-blue-400 to-blue-600",purple:"from-purple-400 to-purple-600",green:"from-green-400 to-green-600",amber:"from-amber-400 to-amber-600",red:"from-red-400 to-red-600"};function o(e){let{title:t,value:r,unit:s,icon:n,isLoading:o,color:d="blue"}=e,c=i[d]||i.blue;return o?(0,a.jsxs)("div",{className:"bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm animate-pulse",children:[(0,a.jsxs)("div",{className:"flex justify-between items-start mb-2",children:[(0,a.jsx)("div",{className:"h-4 w-24 bg-gray-700 rounded"}),(0,a.jsx)("div",{className:"h-8 w-8 bg-gray-700 rounded-full"})]}),(0,a.jsx)("div",{className:"h-8 w-20 bg-gray-700 rounded mt-4"})]}):(0,a.jsxs)("div",{className:"bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]",children:[(0,a.jsxs)("div",{className:"flex justify-between items-start",children:[(0,a.jsx)("h3",{className:"text-sm font-medium text-gray-400",children:t}),(0,a.jsx)("div",{className:"p-2 rounded-full bg-gradient-to-br ".concat(c," bg-opacity-20 text-white"),children:l[n]||(0,a.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,a.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})})})]}),(0,a.jsxs)("div",{className:"mt-4 flex items-baseline",children:[(0,a.jsx)("span",{className:"text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ".concat(c),children:r}),s&&(0,a.jsx)("span",{className:"ml-1 text-sm text-gray-400",children:s})]})]})}function d(e){let{data:t,startDate:r,endDate:s,isLoading:n}=e,l=((e,t)=>{let r=[],a=new Date(e);for(;a<=t;)r.push(new Date(a)),a.setDate(a.getDate()+1);return r})(r,s).reduce((e,t)=>{let r=t.toLocaleDateString("en-US",{month:"long",year:"numeric"});return e[r]||(e[r]=[]),e[r].push(t),e},{}),i=e=>{let r=t[e.toISOString().split("T")[0]];return r&&r.total>0?Math.round(r.completed/r.total*100):0},o=e=>0===e?"bg-gray-800":e<25?"bg-red-900":e<50?"bg-red-700":e<75?"bg-amber-600":e<100?"bg-green-600":"bg-green-500";return n?(0,a.jsxs)("div",{className:"animate-pulse space-y-6",children:[(0,a.jsx)("div",{className:"h-6 w-48 bg-gray-700 rounded"}),(0,a.jsx)("div",{className:"grid grid-cols-7 gap-1",children:Array(35).fill(0).map((e,t)=>(0,a.jsx)("div",{className:"h-10 w-full bg-gray-700 rounded"},t))})]}):(0,a.jsxs)("div",{className:"space-y-8",children:[(0,a.jsxs)("div",{className:"flex flex-wrap items-center justify-center gap-4 pb-4",children:[(0,a.jsxs)("div",{className:"flex items-center",children:[(0,a.jsx)("div",{className:"w-4 h-4 bg-gray-800 rounded-sm mr-2"}),(0,a.jsx)("span",{className:"text-sm text-gray-400",children:"Not tracked"})]}),(0,a.jsxs)("div",{className:"flex items-center",children:[(0,a.jsx)("div",{className:"w-4 h-4 bg-red-900 rounded-sm mr-2"}),(0,a.jsx)("span",{className:"text-sm text-gray-400",children:"0-25%"})]}),(0,a.jsxs)("div",{className:"flex items-center",children:[(0,a.jsx)("div",{className:"w-4 h-4 bg-red-700 rounded-sm mr-2"}),(0,a.jsx)("span",{className:"text-sm text-gray-400",children:"25-50%"})]}),(0,a.jsxs)("div",{className:"flex items-center",children:[(0,a.jsx)("div",{className:"w-4 h-4 bg-amber-600 rounded-sm mr-2"}),(0,a.jsx)("span",{className:"text-sm text-gray-400",children:"50-75%"})]}),(0,a.jsxs)("div",{className:"flex items-center",children:[(0,a.jsx)("div",{className:"w-4 h-4 bg-green-600 rounded-sm mr-2"}),(0,a.jsx)("span",{className:"text-sm text-gray-400",children:"75-99%"})]}),(0,a.jsxs)("div",{className:"flex items-center",children:[(0,a.jsx)("div",{className:"w-4 h-4 bg-green-500 rounded-sm mr-2"}),(0,a.jsx)("span",{className:"text-sm text-gray-400",children:"100%"})]})]}),Object.entries(l).map(e=>{let[r,s]=e,n=Array(s[0].getDay()).fill(null);return(0,a.jsxs)("div",{className:"mb-6",children:[(0,a.jsx)("h4",{className:"text-lg font-medium text-white mb-2",children:r}),(0,a.jsx)("div",{className:"grid grid-cols-7 gap-1 text-center mb-1",children:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(e=>(0,a.jsx)("div",{className:"text-xs text-gray-500",children:e},e))}),(0,a.jsxs)("div",{className:"grid grid-cols-7 gap-1",children:[n.map((e,t)=>(0,a.jsx)("div",{className:"aspect-square"},"padding-".concat(t))),s.map(e=>{let r=e.toISOString().split("T")[0],s=t[r],n=i(e),l=o(n);return(0,a.jsxs)("div",{className:"aspect-square relative group ".concat(l," rounded-md transition-all duration-300 hover:scale-105 cursor-default"),children:[(0,a.jsxs)("div",{className:"absolute inset-0 flex flex-col items-center justify-center",children:[(0,a.jsx)("span",{className:"text-white font-medium",children:e.getDate()}),s&&(0,a.jsxs)("span",{className:"text-xs text-white/70",children:[s.completed,"/",s.total]})]}),s&&(0,a.jsxs)("div",{className:"opacity-0 group-hover:opacity-100 absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap transition-opacity duration-200",children:[(0,a.jsx)("div",{className:"text-center font-medium mb-1",children:new Date(r).toLocaleDateString("en-US",{month:"short",day:"numeric"})}),(0,a.jsxs)("div",{children:["Completed: ",s.completed,"/",s.total]}),(0,a.jsxs)("div",{children:["Rate: ",n,"%"]})]})]},r)})]})]},r)})]})}function c(e){let{supabase:t,dateRange:r}=e,[l,i]=(0,s.useState)([]),[c,u]=(0,s.useState)([]),[m,g]=(0,s.useState)(!0),[h,x]=(0,s.useState)({totalTracked:0,completionRate:0,currentStreak:0,longestStreak:0});(0,s.useEffect)(()=>{!async function(){g(!0);try{let e=r.startDate.toISOString().split("T")[0],a=r.endDate.toISOString().split("T")[0],{data:s}=await t.from("habit_tracking").select("*").gte("habit_date",e).lte("habit_date",a).order("habit_date",{ascending:!0}),{data:n}=await t.from("habit_analytics").select("*").gte("date",e).lte("date",a).order("date",{ascending:!0});if(s){i(s);let e=s.length,t=s.filter(e=>e.completed).length,r=e>0?(t/e*100).toFixed(1):0,a=[...s].sort((e,t)=>new Date(t.habit_date)-new Date(e.habit_date)),n=0;for(let e of a)if(e.completed)n++;else break;let l=0,o=0;for(let e of s)e.completed?++o>l&&(l=o):o=0;x({totalTracked:e,completionRate:r,currentStreak:n,longestStreak:l})}n&&u(n)}catch(e){console.error("Error fetching habit data:",e)}finally{g(!1)}}()},[t,r]);let b={labels:c.map(e=>e.date),datasets:[{label:"Consistency Score",data:c.map(e=>e.consistency_score),fill:!0,backgroundColor:"rgba(245, 158, 11, 0.2)",borderColor:"rgba(245, 158, 11, 0.8)",tension:.3}]},p=Object.entries(l.reduce((e,t)=>{let r=t.habit_name||"Unnamed";return e[r]||(e[r]=[]),e[r].push(t),e},{})).map(e=>{let[t,r]=e,a=r.length,s=r.filter(e=>e.completed).length;return{name:t,rate:a>0?(s/a*100).toFixed(1):0,total:a,completed:s}}).sort((e,t)=>t.rate-e.rate),f={labels:p.map(e=>e.name),datasets:[{label:"Completion Rate (%)",data:p.map(e=>e.rate),backgroundColor:"rgba(245, 158, 11, 0.8)",borderWidth:0,borderRadius:4}]},v=l.reduce((e,t)=>{let r=t.habit_date;return e[r]||(e[r]={total:0,completed:0}),e[r].total++,t.completed&&e[r].completed++,e},{});return(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsx)("h2",{className:"text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500",children:"Habit Tracker"}),(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[(0,a.jsx)(o,{title:"Habits Tracked",value:h.totalTracked,icon:"list-check",color:"amber",isLoading:m}),(0,a.jsx)(o,{title:"Completion Rate",value:"".concat(h.completionRate,"%"),icon:"percent",color:"green",isLoading:m}),(0,a.jsx)(o,{title:"Current Streak",value:h.currentStreak,unit:"days",icon:"flame",color:"red",isLoading:m}),(0,a.jsx)(o,{title:"Longest Streak",value:h.longestStreak,unit:"days",icon:"trophy",color:"blue",isLoading:m})]}),(0,a.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[(0,a.jsxs)("div",{className:"bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm",children:[(0,a.jsx)("h3",{className:"text-lg font-medium text-blue-300 mb-4",children:"Consistency Score"}),(0,a.jsx)(n.Z,{data:b,type:"line",height:300,isLoading:m||0===c.length,options:{scales:{y:{suggestedMin:0,suggestedMax:100,title:{display:!0,text:"Score (%)"}}}}})]}),(0,a.jsxs)("div",{className:"bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm",children:[(0,a.jsx)("h3",{className:"text-lg font-medium text-blue-300 mb-4",children:"Habits by Completion Rate"}),(0,a.jsx)(n.Z,{data:f,type:"bar",height:300,isLoading:m||0===p.length,options:{indexAxis:"y",scales:{x:{suggestedMin:0,suggestedMax:100,title:{display:!0,text:"Completion Rate (%)"}}}}})]})]}),(0,a.jsxs)("div",{className:"bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm",children:[(0,a.jsx)("h3",{className:"text-lg font-medium text-blue-300 mb-4",children:"Habit Calendar"}),(0,a.jsx)(d,{data:v,startDate:r.startDate,endDate:r.endDate,isLoading:m})]})]})}},9558:function(e,t,r){r.d(t,{Z:function(){return o}});var a=r(5893),s=r(7294),n=r(3148),l=r(6495);n.kL.register(n.uw,n.f$,n.od,n.jn,n.ZL,n.qi,n.Dx,n.u,n.De,n.Gu);let i={responsive:!0,maintainAspectRatio:!0,plugins:{legend:{position:"top",labels:{color:"#D1D5DB",boxWidth:12,padding:10,font:{size:11}}},tooltip:{backgroundColor:"rgba(17, 24, 39, 0.8)",titleColor:"#F9FAFB",bodyColor:"#F3F4F6",borderColor:"rgba(59, 130, 246, 0.5)",borderWidth:1,padding:10,cornerRadius:6,displayColors:!0,usePointStyle:!0,boxPadding:3}},scales:{x:{grid:{color:"rgba(31, 41, 55, 0.2)",borderColor:"rgba(31, 41, 55, 0.5)"},ticks:{color:"#9CA3AF",maxRotation:45,minRotation:0,font:{size:10}}},y:{grid:{color:"rgba(31, 41, 55, 0.2)",borderColor:"rgba(31, 41, 55, 0.5)"},ticks:{color:"#9CA3AF",font:{size:10}}}},elements:{line:{tension:.3,borderWidth:2},point:{radius:3,hoverRadius:5,borderWidth:2,backgroundColor:"#1F2937"},bar:{borderRadius:4},arc:{borderWidth:1,borderColor:"#1F2937"}}};function o(e){let{data:t,type:r="line",height:n=300,isLoading:o=!1,options:d={}}=e,[c,u]=(0,s.useState)({}),[m,g]=(0,s.useState)(2);return(0,s.useEffect)(()=>{let e=()=>{var e,t,a,s,n;let l;let o=window.innerWidth;g(l=o<640?1.25:o<1024?1.75:2),u({...i,...d,responsive:!0,maintainAspectRatio:!0,aspectRatio:l,plugins:{...i.plugins,...d.plugins,legend:{...null===(e=i.plugins)||void 0===e?void 0:e.legend,...null===(t=d.plugins)||void 0===t?void 0:t.legend,display:"pie"===r||"doughnut"===r||o>640}},scales:{...i.scales,...d.scales,x:{...i.scales.x,...null===(a=d.scales)||void 0===a?void 0:a.x,ticks:{...i.scales.x.ticks,...null===(n=d.scales)||void 0===n?void 0:null===(s=n.x)||void 0===s?void 0:s.ticks,maxRotation:o<640?90:45,autoSkip:!0,maxTicksLimit:o<640?6:12}}}})};return e(),window.addEventListener("resize",e),()=>window.removeEventListener("resize",e)},[d,r]),(0,a.jsx)("div",{className:"relative w-full",style:{height:"".concat(n,"px")},children:o?(0,a.jsx)("div",{className:"h-full w-full flex items-center justify-center",children:(0,a.jsx)("div",{className:"h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"})}):t.labels&&t.labels.length>0?(()=>{switch(r){case"line":default:return(0,a.jsx)(l.Line,{data:t,options:c});case"bar":return(0,a.jsx)(l.Bar,{data:t,options:c});case"pie":return(0,a.jsx)(l.Pie,{data:t,options:c});case"doughnut":return(0,a.jsx)(l.Doughnut,{data:t,options:c})}})():(0,a.jsx)("div",{className:"h-full w-full flex items-center justify-center text-gray-400 text-center p-4",children:"No data available for the selected period"})})}},6495:function(e,t,r){r.r(t),r.d(t,{Bar:function(){return h},Bubble:function(){return f},Chart:function(){return u},Doughnut:function(){return b},Line:function(){return g},Pie:function(){return v},PolarArea:function(){return p},Radar:function(){return x},Scatter:function(){return j},getDatasetAtEvent:function(){return o},getElementAtEvent:function(){return d},getElementsAtEvent:function(){return c}});var a=r(7294),s=r(3148);let n="label";function l(e,t){"function"==typeof e?e(t):e&&(e.current=t)}function i(e,t){let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:n,a=[];e.datasets=t.map(t=>{let s=e.datasets.find(e=>e[r]===t[r]);return!s||!t.data||a.includes(s)?{...t}:(a.push(s),Object.assign(s,t),s)})}function o(e,t){return e.getElementsAtEventForMode(t.nativeEvent,"dataset",{intersect:!0},!1)}function d(e,t){return e.getElementsAtEventForMode(t.nativeEvent,"nearest",{intersect:!0},!1)}function c(e,t){return e.getElementsAtEventForMode(t.nativeEvent,"index",{intersect:!0},!1)}let u=(0,a.forwardRef)(function(e,t){let{height:r=150,width:o=300,redraw:d=!1,datasetIdKey:c,type:u,data:m,options:g,plugins:h=[],fallbackContent:x,updateMode:b,...p}=e,f=(0,a.useRef)(null),v=(0,a.useRef)(null),j=()=>{f.current&&(v.current=new s.kL(f.current,{type:u,data:function(e){var t;let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:n,a={labels:[],datasets:[]};return t=e.labels,a.labels=t,i(a,e.datasets,r),a}(m,c),options:g&&{...g},plugins:h}),l(t,v.current))},w=()=>{l(t,null),v.current&&(v.current.destroy(),v.current=null)};return(0,a.useEffect)(()=>{!d&&v.current&&g&&function(e,t){let r=e.options;r&&t&&Object.assign(r,t)}(v.current,g)},[d,g]),(0,a.useEffect)(()=>{if(!d&&v.current){var e,t;e=v.current.config.data,t=m.labels,e.labels=t}},[d,m.labels]),(0,a.useEffect)(()=>{!d&&v.current&&m.datasets&&i(v.current.config.data,m.datasets,c)},[d,m.datasets]),(0,a.useEffect)(()=>{v.current&&(d?(w(),setTimeout(j)):v.current.update(b))},[d,g,m.labels,m.datasets,b]),(0,a.useEffect)(()=>{v.current&&(w(),setTimeout(j))},[u]),(0,a.useEffect)(()=>(j(),()=>w()),[]),a.createElement("canvas",{ref:f,role:"img",height:r,width:o,...p},x)});function m(e,t){return s.kL.register(t),(0,a.forwardRef)((t,r)=>a.createElement(u,{...t,ref:r,type:e}))}let g=m("line",s.ST),h=m("bar",s.vn),x=m("radar",s.Xi),b=m("doughnut",s.jI),p=m("polarArea",s.CV),f=m("bubble",s.N0),v=m("pie",s.tt),j=m("scatter",s.ho)}}]);