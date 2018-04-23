// Array.map polyfill
if (Array.prototype.map === undefined) {
  console.log('define map')
  Array.prototype.map = function(fn) {
    var rv = [];
    
    for(var i=0, l=this.length; i<l; i++)
      rv.push(fn(this[i]));

    return rv;
  };
};

// Array.filter polyfill
if (Array.prototype.filter === undefined) {
  Array.prototype.filter = function(fn) {
    var rv = [];
    
    for(var i=0, l=this.length; i<l; i++)
      if (fn(this[i])) rv.push(this[i]);

    return rv;
  };
};
