var Tarantula = require('tarantula'),
    fs = require('fs');

/* helper */

RegExp.quote = function(str) {
    str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    return str;
};

var Motion = function() {
    return {
        id: undefined,
        title: undefined,
        summary: undefined,
        text: undefined,
        topic: undefined,
        type: undefined,
        tags: undefined,
        url: undefined,
        remarks: undefined,
        author: undefined
    };
};


// read config
//var configFile = "examples/gvtk131_config.json";
var configFile = "examples/lpts132_config.json";
fs.readFile(configFile, 'utf8', function (err, data) {
    if (err) {
        console.log('Error: ' + err);
        return;
    }
 
    var config = JSON.parse(data),
        motions = [],
        motionsIDs = [],
    	brain = {

        politeness: 200,

        shouldVisit: function(uri) {
        	var re = new RegExp(config.detail, "");
            return uri.match(re);
        },

        visit : function(request, response, body, $) {
            console.log(request.uri);
            if(request.uri != config.start_page) {
                var motion = new Motion(),
                    idRegEx = new RegExp(config.regexIdUrl, "");
            
                motion.url = request.uri;
                match = request.uri.match(idRegEx);
                motion.id = match ? match[1] : undefined;

                match = body.match(new RegExp(config.regexID, 'm'));
                motion.id = match ? match[1] : undefined;

                match = body.match(new RegExp(config.regexTitle, 'm'));
                motion.title = match ? match[1] : undefined;

                match = body.match(new RegExp(config.regexAuthor, 'm'));
                motion.author = match ? match[1] : undefined;
                
                match = body.match(new RegExp(config.regexType, 'm'));
                motion.type = match ? match[1] : undefined;

                match = body.match(new RegExp(config.regexTopic, 'm'));
                motion.topic = match ? match[1] : undefined;
                
                match = body.match(new RegExp(config.regexText, 'm'));
                motion.text = match ? match[1] : undefined;
                
                match = body.match(new RegExp(config.regexRemarks, 'm'));
                motion.remarks = match ? match[1] : undefined;

                if(motionsIDs.indexOf(motion.id) == -1) {
                    motions.push(motion);
                    motionsIDs.push(motion.id);
                    console.log(motion);
                }

            }

        },

        debug: false
    };

    var tarantula = new Tarantula(brain);

    tarantula.on('done', function() {
        console.log('done, found '+ motions.length + ' motions for #'+config.event);

        // export as json
        var json = JSON.stringify(motions);
        fs.writeFile('out/'+config.event+'-'+Math.floor(Date.now() / 1000)+'.json', json, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        }); 

    });

    tarantula.start([config.start_page]);

});


