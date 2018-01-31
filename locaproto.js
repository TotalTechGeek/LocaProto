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

// Do not call this.
LocaProto._random = function()
{
    return (Math.random()*1e9).toString(36).replace(/\./g, "")
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
 * @param {function} callback - executed with the id param. Can be used to modify page references with the id.  
 */
LocaProto.slave = function(callback)
{
    LocaProto.id = window.location.hash.substring(1) 
    LocaProto._init(callback)
}

/**
 * Registers a channel to receive data on.
 * @param {string} name - The name of the channel
 * @param {string} func - The function to be executed when you receive data. The first parameter is the data.
 */
LocaProto.on = function(name, func)
{
    LocaProto.listened.push(setInterval(function()
    {
        if(localStorage[LocaProto.id + "-" + name]) 
        {
            func(JSON.parse(localStorage[LocaProto.id + "-" + name]))
            localStorage.removeItem(LocaProto.id + "-" + name)
        }
    }, 250))
}


/**
 * Sends data to a channel.
 * @param {string} name - The channel you are sending to.
 * @param data - Any data you'd like to send to a channel. 
 */
LocaProto.send = function(name, data)
{
    localStorage[LocaProto.id + "-" + name] = JSON.stringify(data)
}