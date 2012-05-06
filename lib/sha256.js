define(function(require, exports, module) {
	/**
	 * CryptoJS v3.0 beta 1
	 * code.google.com/p/crypto-js
	 * (c) 2009-2012 by Jeff Mott. All rights reserved.
	 * code.google.com/p/crypto-js/wiki/License
	 */
	var CryptoJS=CryptoJS||function(i,p){var g={},q=g.lib={},j=q.Base=function(){function a(){}return{extend:function(f){a.prototype=this;var d=new a;f&&d.mixIn(f);d.$super=this;return d},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var d in a)a.hasOwnProperty(d)&&(this[d]=a[d]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.$super.extend(this)}}}(),k=q.WordArray=j.extend({init:function(a,f){a=
	this.words=a||[];this.sigBytes=f!=p?f:4*a.length},toString:function(a){return(a||m).stringify(this)},concat:function(a){var f=this.words,d=a.words,c=this.sigBytes,a=a.sigBytes;this.clamp();if(c%4)for(var b=0;b<a;b++)f[c+b>>>2]|=(d[b>>>2]>>>24-8*(b%4)&255)<<24-8*((c+b)%4);else f.push.apply(f,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,f=this.sigBytes;a[f>>>2]&=4294967295<<32-8*(f%4);a.length=i.ceil(f/4)},clone:function(){var a=j.clone.call(this);a.words=this.words.slice(0);return a},
	random:function(a){for(var f=[],d=0;d<a;d+=4)f.push(4294967296*i.random()|0);return k.create(f,a)}}),r=g.enc={},m=r.Hex={stringify:function(a){for(var f=a.words,a=a.sigBytes,d=[],c=0;c<a;c++){var b=f[c>>>2]>>>24-8*(c%4)&255;d.push((b>>>4).toString(16));d.push((b&15).toString(16))}return d.join("")},parse:function(a){for(var b=a.length,d=[],c=0;c<b;c+=2)d[c>>>3]|=parseInt(a.substr(c,2),16)<<24-4*(c%8);return k.create(d,b/2)}},s=r.Latin1={stringify:function(a){for(var b=a.words,a=a.sigBytes,d=[],c=
	0;c<a;c++)d.push(String.fromCharCode(b[c>>>2]>>>24-8*(c%4)&255));return d.join("")},parse:function(a){for(var b=a.length,d=[],c=0;c<b;c++)d[c>>>2]|=(a.charCodeAt(c)&255)<<24-8*(c%4);return k.create(d,b)}},h=r.Utf8={stringify:function(a){try{return decodeURIComponent(escape(s.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return s.parse(unescape(encodeURIComponent(a)))}},b=q.BufferedBlockAlgorithm=j.extend({reset:function(){this._data=k.create();this._nDataBytes=0},
	_append:function(a){"string"==typeof a&&(a=h.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,d=b.words,c=b.sigBytes,e=this.blockSize,g=c/(4*e),g=a?i.ceil(g):i.max((g|0)-this._minBufferSize,0),a=g*e,c=i.min(4*a,c);if(a){for(var h=0;h<a;h+=e)this._doProcessBlock(d,h);h=d.splice(0,a);b.sigBytes-=c}return k.create(h,c)},clone:function(){var a=j.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});q.Hasher=b.extend({init:function(){this.reset()},
	reset:function(){b.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);this._doFinalize();return this._hash},clone:function(){var a=b.clone.call(this);a._hash=this._hash.clone();return a},blockSize:16,_createHelper:function(a){return function(b,d){return a.create(d).finalize(b)}},_createHmacHelper:function(a){return function(b,d){return e.HMAC.create(a,d).finalize(b)}}});var e=g.algo={};return g}(Math);
	(function(i){var p=CryptoJS,g=p.lib,q=g.WordArray,g=g.Hasher,j=p.algo,k=[],r=[];(function(){function g(a){for(var b=i.sqrt(a),d=2;d<=b;d++)if(!(a%d))return!1;return!0}function h(a){return 4294967296*(a-(a|0))|0}for(var b=2,e=0;64>e;)g(b)&&(8>e&&(k[e]=h(i.pow(b,0.5))),r[e]=h(i.pow(b,1/3)),e++),b++})();var m=[],j=j.SHA256=g.extend({_doReset:function(){this._hash=q.create(k.slice(0))},_doProcessBlock:function(g,h){for(var b=this._hash.words,e=b[0],a=b[1],f=b[2],d=b[3],c=b[4],i=b[5],j=b[6],k=b[7],l=0;64>
	l;l++){if(16>l)m[l]=g[h+l]|0;else{var n=m[l-15],o=m[l-2];m[l]=((n<<25|n>>>7)^(n<<14|n>>>18)^n>>>3)+m[l-7]+((o<<15|o>>>17)^(o<<13|o>>>19)^o>>>10)+m[l-16]}n=k+((c<<26|c>>>6)^(c<<21|c>>>11)^(c<<7|c>>>25))+(c&i^~c&j)+r[l]+m[l];o=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&a^e&f^a&f);k=j;j=i;i=c;c=d+n|0;d=f;f=a;a=e;e=n+o|0}b[0]=b[0]+e|0;b[1]=b[1]+a|0;b[2]=b[2]+f|0;b[3]=b[3]+d|0;b[4]=b[4]+c|0;b[5]=b[5]+i|0;b[6]=b[6]+j|0;b[7]=b[7]+k|0},_doFinalize:function(){var g=this._data,h=g.words,b=8*this._nDataBytes,
	e=8*g.sigBytes;h[e>>>5]|=128<<24-e%32;h[(e+64>>>9<<4)+15]=b;g.sigBytes=4*h.length;this._process()}});p.SHA256=g._createHelper(j);p.HmacSHA256=g._createHmacHelper(j)})(Math);
	
	module.exports = CryptoJS;
});