/*! 
 * LocaProto
 * 
 * Copyright 2018, Jesse Daniel Mitchell
 * Released under the MIT license.
 *
 * Date: 2018-01-30T23:26:54.214Z
 */

var LocaProto = {}
LocaProto.listened = [] 
LocaProto._channels = {}
LocaProto._windowListened = false
LocaProto.forceLocalStorage = false
LocaProto.broadcast = (typeof BroadcastChannel !== "undefined")

// It is not advised to call this.
LocaProto._random = function()
{
    return (Math.random()*1e9).toString(36).replace(/\./g, "")
}

/**
 * This is a utility function to make it easier to acquire the slave id from the query string.
 * @param {string} name - The value in the query string to pull from. If unspecified, it'll just use the entire query string.
 */
LocaProto.fromQueryString = function(name)
{
    function getUrlParameter(name) 
    {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    if (name)
    {
        return () => getUrlParameter(name) 
    }
    else
    {
        // Defaults to just giving you the entire query string.
        return location.search.substring(1)
    }
}

/**
 * Cancels all channels being listened to.
 */
LocaProto.cancel = LocaProto.clear = function()
{
    LocaProto.listened.forEach(i => clearInterval(i))
    LocaProto.listened.splice(0)
}

// Do not call this.
LocaProto._init = function(callback)
{
    if(typeof callback !== "undefined")
    {
        if(Array.isArray(callback))
        {
            callback.forEach(i=>i(LocaProto.id))
        } 
        else
        {
            callback(LocaProto.id)
        }
    }
}

/**
 * Randomly generates an id to use for channels. 
 * @param {function} callback - executed with the id param. Can be used to modify page references with the id.  
 */
LocaProto.master = function(callback)
{
    LocaProto.id = LocaProto._random()
    LocaProto._init(callback)
}

/**
 * Parses the uri to determine what channels to talk to. 
 * @param {function} func - executed to get the id param. Defaults to getting it from the fragment identifier.
 * @param {function} callback - executed with the id param. Can be used to modify page references with the id.  
 */
LocaProto.slave = function(func, callback)
{
    if (func && typeof func === "function")
    {
        LocaProto.id = func()
    }
    else
    {
        LocaProto.id = window.location.hash.substring(1)
    }

    LocaProto._init(callback)
}

/**
 * Registers a channel to receive data on.
 * @param {string} name - The name of the channel
 * @param {string} func - The function to be executed when you receive data. The first parameter is the data.
 */
LocaProto.on = function(name, func)
{
    /**
     * Listens to the channel using Local Storage
     * @param {*} name 
     * @param {*} func 
     */
    function localStorageListen(name, func)
    {
        LocaProto.listened.push(setInterval(function()
        {
            if(localStorage[name]) 
            {
                func(JSON.parse(localStorage[name]))
                localStorage.removeItem(name)
            }
        }, 250))
    }

    /**
     * Listens to the channel using "Broadcast Channel"
     * @param {*} name 
     * @param {*} func 
     */
    function broadcastListen(name, func)
    {
        let bc = new BroadcastChannel(name)
        LocaProto._channels[name] = bc
        bc.onmessage = i => func(JSON.parse(i.data))
    }

    /**
     * Listens to window.postMessage events
     */
    function listenerSetup()
    {
        let eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
        let eventer = window[eventMethod];
        let messageEvent = eventMethod == 'attachEvent' ? 'onmessage' : 'message';
        
        LocaProto._windowListened = true

        // Listen to message from child window
        eventer(messageEvent, function(e) 
        {
            let key = e.message ? 'message' : 'data';
            let data = e[key];

            // Security purposes
            if(document.location.origin !== e.origin) return
            
            try 
            {
                data = JSON.parse(data)
                if(data.channel && LocaProto._channels[data.channel])
                {
                    LocaProto._channels[data.channel](data.data)
                }
            } catch(ex) 
            {

            }
        }, false)
    }

    /**
     * Allows the library to respond to window.postMessage events with channels.
     * @param {*} name 
     * @param {*} func 
     */
    function windowListen(name, func)
    {
        if(!LocaProto._windowListened) listenerSetup()
        LocaProto._channels[name] = func
    }


    name = LocaProto.id + '-' + name

    if(LocaProto.forceLocalStorage)
    {
        // Uses the localStorage (if user requests it)
        localStorageListen(name, func)
    }
    if(LocaProto.broadcast)
    {
        // uses Broadcast Channel
        broadcastListen(name, func)
    }
    else
    {
        // Falls back onto window post message listener
        windowListen(name, func)
    }
}

/**
 * Sends data to a channel.
 * @param {string} name - The channel you are sending to.
 * @param data - Any data you'd like to send to a channel. 
 */
LocaProto.send = function(name, data)
{
    name = LocaProto.id + '-' + name
    
    if(LocaProto.forceLocalStorage)
    {
        // uses local storage
        localStorage[name] = JSON.stringify(data)
    }
    else if(LocaProto.broadcast)
    {
        if(!LocaProto._channels[name]) LocaProto._channels[name] = new BroadcastChannel(name)
        LocaProto._channels[name].postMessage(JSON.stringify(data))
    }
    else
    {
        // falls back on window post message
        window.opener.postMessage(JSON.stringify({ data: data, channel: name }), '*')
    }
}