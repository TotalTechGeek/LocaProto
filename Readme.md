# LocaProto
---
This is a small JavaScript utility for allowing different browser tabs to communicate, specifically in a slave-master configuration. 

## Usage
---
In order to use this utility, you must be able to pass an ID from the master page to the slave page. By default, you can pass it by using the fragment identifier.

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

If you would like to modify how it is received by the slave page, you simply need to pass a function into the "LocaProto.slave" call. There is a built in query string utility (over the '?' in the url), if you'd prefer to parse it over that.

```js
// Uses the entire query string as id. 
LocaProto.slave(LocaProto.fromQueryString)
```

or 

```js 
// This would parse the query string and get whatever "loca=<var>" is inside the string.
// So example.com/?loca=blah&thing=7 will parse 'blah' correctly. 
LocaProto.slave(LocaProto.fromQueryString('loca'))
```

## Example 

[Example Here](http://jessemitchell.me/LocaProto/html_test/)


## Build 

If you want to easily minify this project, and you have Node.js installed, you can type "npm init" in the same directory as package.json, and type "npm run build".

This will produce a minified and license-compliant script.

## Implementation Notes

The project currently has two modes of transport, depending on browser support. 

The first uses [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API), which is supported in newer versions of Firefox, Chrome and Opera.  

If BroadcastChannel is not supported, the library will attempt to use the HTML5 postMessage event handling API that is supported in most browsers. All events will be restricted to the same domain, in order to mitigate any potential XSS attacks.

If the following line is executed 

```js
LocaProto.forceLocalStorage = true
```

The library will attempt to use localStorage to pipe communications between the tabs. While this is a slight hack, it is a much cleaner solution than trying to pipe the data through a server using AJAX queries.  

This additional modes of transport should guarantee that the library will work across all HTML5-compliant web browsers.

I might end up adding new fallback mechanisms in the future.