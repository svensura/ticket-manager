const request = require('request');

var geocodeAddress = (address, callback) => {
    console.log(address)
    request({
        //url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyBAi5ZfCgmWyr31KbH9XVFkExw5KP8NOCk`,
        //url: `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=434e6e07bdc04dc28e0b1fe641f10657`,
        url: 'https://api.opencagedata.com/geocode/v1/json?q=' + encodeURIComponent(address) + '&key=99e656b273e342d8ab64d47ac60718d1' ,
        json: true
    }, (error, response, body) => {
        console.log('REQUEST', body)
        console.log('STATUS', body.status)
        if (error) {
            console.log('E', body)
            callback('Unable to connect to Geocode servers!');
        } else if (body.status === "ZERO_RESULTS") {
            console.log('A', body)
            callback('Unable to find address!');
        } else if (body.status.message === "OK"){
            console.log('F', body)
            console.log('address: ',body.results[0].formatted,
            'latitude: ',body.results[0].geometry.lat,
            'longitude: ',body.results[0].geometry.lng)
            callback(undefined, {
                //address: body.results[0].formatted_address,
                latitude: body.results[0].geometry.lat,
                longitude: body.results[0].geometry.lng
            });
        }
    })
};

module.exports = {
    geocodeAddress
};