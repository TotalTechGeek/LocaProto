# LocaProto
---
This is a small JavaScript utility for allowing different browser tabs to communicate, specifically in a slave-master configuration. 

## Usage
---
```js 
// Sets up the master id, and pages.
// Slave pages must have the fragment identifier set to the id. 
LocaProto.master(id =>
{
    document.getElementById("but").onclick = () => window.open("form.html#" + id);
})

LocaProto.on('data', x => console.log(x));
```


And on the slave

```js
LocaProto.slave()
LocaProto.send('data', 'Hello World')
```

## Example 

[Example Here](http://jessemitchell.me/LocaProto/html_test/)


## Build 

If you want to easily minify this project, and you have Node.js installed, you can type "npm init" in the same directory as package.json, and type "npm run build".

This will produce a minified and license-compliant script.

## Caveat

The project currently uses HTML5 localStorage briefly to pipe the communications, and while this is not an ideal mode of transport, it is far better than the weird back-end hacks I've seen involving temporary database records and incessant AJAX queries. 

Additionally, Using this mode of transport guarantees it will work across all HTML5-compliant web browsers, while other methods (like window.postMessage) aren't necessarily completely standardized.