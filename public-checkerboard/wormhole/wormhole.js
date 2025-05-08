// wormhole
// circumventing CORS polciies on client-side
// do requests like it's 2000
function WormholeServer(e){
    var request = e.data;
    console.log("received request", e.data)
    switch(request.method){
    case 'fetch':
        var options = request.params;
        var xhr = new XMLHttpRequest();
        xhr.open(options.method, options.url);
        xhr.onerror = function(e){
            top.postMessage({
                method: options.failed,
                params: { result: e.toString() }
            }, '*');
        };
        xhr.onreadystatechange = function(){
            if(xhr.readyState == XMLHttpRequest.DONE){
                top.postMessage({
                    method: options.done,
                    params: { response: xhr.responseText, status: xhr.status }
                }, '*')
            }
        };
        xhr.send(options.data || null);
    }
}

function WormholeClient(url){
    this.responseHandlers = {};
    this.connectionFrame = null;
    this.handlerCounter = 100;
    this.buffer = [];
    this.ready = false;
    this.open = function(){
        var self = this;
        var frame = document.createElement('iframe');
        frame.src = url;
        frame.style.display = 'none';
        frame.onload = function(e){
            self.ready = true;
            self.buffer.forEach(function(message){
                e.target.contentWindow.postMessage(message, '*');
            });
            self.buffer = [];
        };
        window.addEventListener('message', this.receive.bind(this));
        this.connectionFrame = frame;
        document.body.appendChild(frame);
    };
    this.registerHandler = function(func){
        var self = this;
        this.handlerCounter++;
        var id = this.handlerCounter.toString();
        this.responseHandlers[id] = function(data){
            delete self.responseHandlers[id];
            func(data);
        };
        return id;
    };
    this.send = function(method, params){
        for(var k in params){
            if(typeof params[k] == 'function'){
                params[k] = this.registerHandler(params[k]);
            }
        }
        if(!this.ready){
            this.buffer.push({ method: method, params: params });
        }
        this.connectionFrame.contentWindow.postMessage({ method: method, params: params }, '*');
    };
    this.receive = function(e){
        if(!(e.data.method in this.responseHandlers)){
            throw Error('Unknown handler called: ' + e.data.method);
        }
        this.responseHandlers[e.data.method](e.data.params);
    };
    this.close = function(){
        this.connectionFrame.parentNode.removeChild(this.connectionFrame);
        this.connectionFrame = null;
        this.ready = false;
        this.responseHandlers = {};
    };
}