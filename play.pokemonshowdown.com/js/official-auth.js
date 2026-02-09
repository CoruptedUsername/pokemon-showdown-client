"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _wrapNativeSuper(t){var r="function"==typeof Map?new Map():void 0;return _wrapNativeSuper=function(t){if(null===t||!_isNativeFunction(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(t))return r.get(t);r.set(t,Wrapper);}function Wrapper(){return _construct(t,arguments,_getPrototypeOf(this).constructor);}return Wrapper.prototype=Object.create(t.prototype,{constructor:{value:Wrapper,enumerable:!1,writable:!0,configurable:!0}}),_setPrototypeOf(Wrapper,t);},_wrapNativeSuper(t);}function _construct(t,e,r){if(_isNativeReflectConstruct())return Reflect.construct.apply(null,arguments);var o=[null];o.push.apply(o,e);var p=new(t.bind.apply(t,o))();return r&&_setPrototypeOf(p,r.prototype),p;}function _isNativeReflectConstruct(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));}catch(t){}return(_isNativeReflectConstruct=function(){return!!t;})();}function _isNativeFunction(t){try{return-1!==Function.toString.call(t).indexOf("[native code]");}catch(n){return"function"==typeof t;}}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}function _getPrototypeOf(t){return _getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t);},_getPrototypeOf(t);}var

OfficialAuthError=function(_Error){
function OfficialAuthError(operation){var _this;var statusCode=arguments.length>1&&arguments[1]!==undefined?arguments[1]:null;
_this=_Error.call(this,"Official auth error in operation '"+operation+"'."+statusCode!==null?" Status code: "+statusCode.toString():"")||this;
_this.name='OfficialAuthError';
Object.setPrototypeOf(_this,OfficialAuthError.prototype);return _this;
}_inheritsLoose(OfficialAuthError,_Error);return OfficialAuthError;}(_wrapNativeSuper(Error));






var OfficialAuth=new(function(){function _class(){this.
apiUrl="https://play.pokemonshowdown.com/api/oauth/";this.
clientId="5310ac68ea191701f786";this.
redirectURI=Config.routes.client;}var _proto=_class.prototype;_proto.







requestUrl=function requestUrl(endpoint){
console.assert(endpoint.length>=0,"No endpoint given");
console.assert(!endpoint.startsWith("/"),"Endpoint starts with /");
return new URL(this.apiUrl+endpoint);
};_proto.






refreshToken=async function refreshToken(){
var token=localStorage.getItem("ps-token");
if(!token){
return false;
}
var tokenExpiry=Number(localStorage.getItem("ps-token-expiry"));
if(!tokenExpiry){
return false;
}
var now=Date.now();
if(tokenExpiry<=now){
return false;
}
if(now>tokenExpiry-259200000){
return true;
}

var response=await fetch(this.requestUrl("api/refreshtoken"),{
method:"POST",
headers:{
'Content-Type':'application/x-www-form-urlencoded'
},
body:new URLSearchParams({
client_id:encodeURIComponent(this.clientId),
token:encodeURIComponent(token)
})
});

var responseText=await response.text();

var jsonData=responseText.startsWith(']')?responseText.slice(1):responseText;
var data=JSON.parse(jsonData);

if(!data.success){
throw new OfficialAuthError("refreshToken",data.status);
}

localStorage.setItem("ps-token",data.success);

console.assert(data.expires!==undefined,"No token expiry given.");
console.assert(typeof data.expires==="number","Token expiry is not a number:"+data.expires);

localStorage.setItem("ps-token-expiry",data.expires);

return true;
};_proto.






authorize=function authorize(user){var _this2=this;
this.clearTokenStorage();

var authorizeUrl=this.requestUrl("authorize");
authorizeUrl.searchParams.append('redirect_uri',encodeURIComponent(this.redirectURI));
authorizeUrl.searchParams.append('client_id',encodeURIComponent(this.clientId));
authorizeUrl.searchParams.append('challenge',encodeURIComponent(user.challstr));

var popup=window.open(authorizeUrl,undefined,'popup=1');
var checkIfUpdated=function(){
try{var _popup$location;
if(popup!=null&&popup.closed){return null;}else
if(popup!=null&&(_popup$location=popup.location)!=null&&(_popup$location=_popup$location.href)!=null&&_popup$location.startsWith(_this2.redirectURI)){
var url=new URL(popup.location.href);
var token=decodeURIComponent(url.searchParams.get('token'));
if(!token){
console.error('Received no token');
return;
}
localStorage.setItem('ps-token',token);

var tokenExpiry=decodeURIComponent(url.searchParams.get('expires'));
if(!tokenExpiry){
console.error('Received no token expiry');
return;
}

localStorage.setItem('ps-token-expiry',Number(tokenExpiry));

var assertion=decodeURIComponent(url.searchParams.get('assertion'));
if(!assertion){
console.error('Received no assertion');
return;
}
var username=decodeURIComponent(url.searchParams.get('user'));
if(!username){
console.error('Received no username');
return;
}
localStorage.setItem('ps-token-username',username);

popup.close();
PS.leave('login');
user.handleAssertion(username,assertion);
}else{
setTimeout(checkIfUpdated,500);
}
}catch(DOMException){
setTimeout(checkIfUpdated,500);
}
};
checkIfUpdated();
};_proto.





getAssertion=async function getAssertion(user){
if(!(await this.authorized())){
return null;
}
var token=localStorage.getItem("ps-token");
console.assert(token!==null,"Token was null during getAssertion call.");


var response=await fetch(this.requestUrl("api/getassertion"),{
method:"POST",
headers:{
'Content-Type':'application/x-www-form-urlencoded'
},
body:new URLSearchParams({
client_id:encodeURIComponent(this.clientId),
challenge:encodeURIComponent(user.challstr),
token:encodeURIComponent(token)
})
});

var responseText=await response.text();

var jsonData=responseText.startsWith(']')?responseText.slice(1):responseText;
var data=JSON.parse(jsonData);

if(typeof data!=="string"){
throw new OfficialAuthError("getAssertion",data.status);
}
return data;
};_proto.

revoke=async function revoke(){


var response=await fetch(this.requestUrl("api/revoke"),{
method:"POST",
headers:{
'Content-Type':'application/x-www-form-urlencoded'
},
body:new URLSearchParams({
uri:encodeURIComponent(this.redirectURI)
})
});

var responseText=await response.text();

var jsonData=responseText.startsWith(']')?responseText.slice(1):responseText;
var data=JSON.parse(jsonData);
if(!data.success){
throw new OfficialAuthError("revoke",response.status);
}

this.clearTokenStorage();
};_proto.

clearTokenStorage=function clearTokenStorage(){
localStorage.removeItem("ps-token");
localStorage.removeItem("ps-token-expiry");
localStorage.removeItem("ps-token-username");
};_proto.




authorized=async function authorized(){
var token=localStorage.getItem("ps-token");
var tokenExpiry_string=localStorage.getItem("ps-token-expiry");
var tokenName=localStorage.getItem("ps-token-username");
var refresh=false;
var reauth=false;
if(!token){
reauth=true;
}else if(!tokenExpiry_string){
refresh=true;
}else if(!tokenName){
reauth=true;
}

try{
var tokenExpiry=Number(tokenExpiry_string);
if(tokenExpiry<=Date.now()){
refresh=true;
}
}catch(e){reauth=true;}

if(refresh&&!reauth){
var success=await this.refreshToken();
if(!success){
reauth=true;
}
}

if(reauth){
this.clearTokenStorage();
return false;
}

return true;
};return _class;}())(
);
//# sourceMappingURL=official-auth.js.map