(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[574],{7104:function(e,t,a){(window.__NEXT_P=window.__NEXT_P||[]).push(["/habits",function(){return a(3209)}])},3209:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return r}});var s=a(5893),l=a(7294),d=a(6490);function r(){let[e,t]=(0,l.useState)([]),[a,r]=(0,l.useState)(0),[i,n]=(0,l.useState)(!0),[c,o]=(0,l.useState)(null);return(0,l.useEffect)(()=>{(async function(){try{n(!0),o(null);let e="https://oxhtyvhbjowtybdhdxfa.supabase.co",a="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aHR5dmhiam93dHliZGhkeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2NzIwMTAsImV4cCI6MjA1NTI0ODAxMH0.hbKqzjs1UWVfdiKUBdRBASNwyR9EGElJqGXzxojJ-u0";if(!e||!a)throw Error("Supabase environment variables are not set");let s=(0,d.eI)(e,a),{data:l,error:i}=await s.from("habit_tracking").select("habit_date, habit_name, completed").order("habit_date",{ascending:!1}).limit(50);if(i)throw i;if(l&&l.length>0){t(l);let e={};l.forEach(t=>{e[t.habit_date]||(e[t.habit_date]={total:0,completed:0}),e[t.habit_date].total++,t.completed&&e[t.habit_date].completed++});let a=Object.keys(e).filter(t=>{let a=e[t];return a.completed/a.total>=.8}).length;r(a)}else o("No habit data found")}catch(e){console.error("Error fetching habit data:",e),o(e.message)}finally{n(!1)}})()},[]),(0,s.jsxs)("div",{className:"min-h-screen bg-gray-900 text-white p-6",children:[(0,s.jsx)("h1",{className:"text-2xl font-bold mb-6",children:"Habits Dashboard"}),i?(0,s.jsx)("div",{className:"flex justify-center items-center h-64",children:(0,s.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"})}):c?(0,s.jsxs)("div",{className:"text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500",children:[(0,s.jsx)("p",{className:"font-bold",children:"Error loading data:"}),(0,s.jsx)("p",{children:c})]}):(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsxs)("div",{className:"bg-gray-800 rounded-lg p-4 shadow glass-panel",children:[(0,s.jsx)("h2",{className:"text-lg font-medium text-blue-300 mb-4",children:"Your Habit Stats"}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[(0,s.jsxs)("div",{className:"bg-blue-900 bg-opacity-30 border border-blue-700 p-4 rounded-lg",children:[(0,s.jsx)("p",{className:"text-gray-400 text-sm",children:"Habit Streak"}),(0,s.jsxs)("p",{className:"text-2xl font-bold",children:[a," ",(0,s.jsx)("span",{className:"text-sm",children:"days"})]})]}),(0,s.jsxs)("div",{className:"bg-gray-700 p-4 rounded-lg",children:[(0,s.jsx)("p",{className:"text-gray-400 text-sm",children:"Total Habits"}),(0,s.jsx)("p",{className:"text-2xl font-bold",children:e.length})]}),(0,s.jsxs)("div",{className:"bg-gray-700 p-4 rounded-lg",children:[(0,s.jsx)("p",{className:"text-gray-400 text-sm",children:"Completion Rate"}),(0,s.jsxs)("p",{className:"text-2xl font-bold",children:[(e.filter(e=>e.completed).length/e.length*100).toFixed(1),"%"]})]})]})]}),(0,s.jsxs)("div",{className:"bg-gray-800 rounded-lg p-4 shadow glass-panel",children:[(0,s.jsx)("h2",{className:"text-lg font-medium text-blue-300 mb-4",children:"Recent Habits"}),0===e.length?(0,s.jsx)("div",{className:"text-center py-8 text-gray-400",children:(0,s.jsx)("p",{children:"No habit data available"})}):(0,s.jsx)("div",{className:"space-y-3",children:e.map((e,t)=>(0,s.jsxs)("div",{className:"bg-gray-700 p-4 rounded-lg flex justify-between items-center",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("h3",{className:"font-medium",children:e.habit_name}),(0,s.jsx)("p",{className:"text-gray-400 text-sm",children:new Date(e.habit_date).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})})]}),(0,s.jsx)("span",{className:"px-2 py-1 rounded text-sm ".concat(e.completed?"bg-green-900 text-green-300":"bg-red-900 text-red-300"),children:e.completed?"Completed":"Missed"})]},t))})]})]})]})}}},function(e){e.O(0,[490,888,774,179],function(){return e(e.s=7104)}),_N_E=e.O()}]);