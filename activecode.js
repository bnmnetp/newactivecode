/**
 * Created by bmiller on 3/19/15.
 */

var edList = [];

var ActiveCode = function(orig, div, initialCode, lang) {
    var _this = this;
    this.origElem = orig;
    this.divid = div;
    this.code = initialCode;
    this.language = lang;
    this.outerDiv = '';

    this.output = '' // create pre for output
    this.graphics = '' // create div for turtle graphics

    this.builtinRead = function (x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
    }

    this.ouputfun = function(text) {
        // bnm python 3
        x = text;
        if (x.charAt(0) == '(') {
            x = x.slice(1, -1);
            x = '[' + x + ']';
            try {
                var xl = eval(x);
                xl = xl.map(pyStr);
                x = xl.join(' ');
            } catch (err) {
            }
        }
        text = x;
        text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
        $(_this.output).append(text);
    }

    this.runit = function() {
        // In this function use _this because this will be the button
        console.log("running " + _this.divid);

        Sk.configure({output : _this.ouputfun,
              read   : _this.builtinRead,
              python3: true,
              imageProxy : 'http://image.runestone.academy:8080/320x'
             });

        if(_this.language === 'python') {
            var myPromise = Sk.misceval.asyncToPromise(function() {
                return Sk.importMainWithBody("<stdin>", false, _this.editor.getValue(), true);
            });
            myPromise.then(function(mod) {}, function(err) {
                //logRunEvent({'div_id': _this.divid, 'code': _this.prog, 'errinfo': err.toString()}); // Log the run event
                console.log(err.toString());
                addErrorMessage(err, myDiv)
            });
        } else if (_this.language === 'javascript') {
            eval(prog);
        } else {
            // html
            //$('#'+myDiv+'_iframe').remove();
            //$('#'+myDiv+'_htmlout').show();
            //$('#'+myDiv+'_htmlout').append('<iframe class="activehtml" id="' + myDiv + '_iframe" srcdoc="' +
            //prog.replace(/"/g,"'") + '">' + '</iframe>');
        }
        //logRunEvent({'div_id': myDiv, 'code': prog, 'errinfo': 'success'}); // Log the run event

    }

    this.editor = this.createEditor();
    this.createControls();
    this.createOutput();

}

ActiveCode.prototype.createEditor = function (index) {
        var newdiv = document.createElement('div')
        newdiv.id = this.divid;
        newdiv.lang = this.language;
        this.outerDiv = newdiv;

        $(this.origElem).replaceWith(newdiv);

        return CodeMirror(newdiv, {value: this.code, lineNumbers: true, mode: newdiv.lang});

    }

ActiveCode.prototype.createControls = function () {
    var butt = document.createElement('button');
    $(butt).text('Run')
    this.outerDiv.appendChild(butt)
    $(butt).click(this.runit);
}

ActiveCode.prototype.createOutput = function () {
    this.output = document.createElement('pre');
    $(this.output).append("Hello World");
    this.outerDiv.appendChild(this.output)

}



oldRunit = function(myDiv, theButton, includes, suffix) {
    //var prog = document.getElementById(myDiv + "_code").value;

    Sk.divid = myDiv;
    $(theButton).attr('disabled', 'disabled');
    Sk.isTurtleProgram = false;
    if (theButton !== undefined) {
        Sk.runButton = theButton;
    }
    $("#" + myDiv + "_errinfo").remove();
    $("#" + myDiv + "_coach_div").hide();

    var editor = cm_editors[myDiv + "_code"];
    if (editor.acEditEvent) {
        logBookEvent({'event': 'activecode', 'act': 'edit', 'div_id': myDiv}); // Log the edit event
        editor.acEditEvent = false;
    }
    var prog = "";
    var text = "";
    if (includes !== undefined) {
        // iterate over the includes, in-order prepending to prog
        for (var x in includes) {
            text = cm_editors[includes[x] + "_code"].getValue();
            prog = prog + text + "\n"
        }
    }
    prog = prog + editor.getValue();

    var suffix;
    suffix = $('#'+myDiv+'_suffix').text() || '';

    prog = prog + '\n' + suffix;

    var mypre = document.getElementById(myDiv + "_pre");
    if (mypre) mypre.innerHTML = '';
    Sk.canvas = myDiv + "_canvas";
    Sk.pre = myDiv + "_pre";
    var can = document.getElementById(Sk.canvas);
    (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = Sk.canvas;

    // The following lines reset the canvas so that each time the run button
    // is pressed the turtle(s) get a clean canvas.
    if (can) {
        can.width = can.width;
        if (Sk.tg) {
            Sk.tg.canvasInit = false;
            Sk.tg.turtleList = [];
        }
    }
    var timelimit = $("#"+myDiv).attr("time")
    // set execLimit in milliseconds  -- for student projects set this to
    // 25 seconds -- just less than Chrome's own timer.
    if (prog.indexOf('ontimer') > -1 ||
        prog.indexOf('onclick') > -1 ||
        prog.indexOf('onkey') > -1  ||
        prog.indexOf('setDelay') > -1 ) {
        Sk.execLimit = null;
    } else {
        if (timelimit === "off") {
            Sk.execLimit = null;
        } else if (timelimit) {
            Sk.execLimit = timelimit;
        } else {
            Sk.execLimit = 25000;
        }
    }
    // configure Skulpt output function, and module reader
    if (!Sk.isTurtleProgram) {
        $(theButton).removeAttr('disabled');
    }
    if (typeof(allVisualizers) != "undefined") {
        $.each(allVisualizers, function (i, e) {
            e.redrawConnectors();
        });
    }
}



$(document).ready(function() {
    $('.activecode').each( function(index ) {
        var a = new ActiveCode(this, this.id, $(this).text(), this.lang);
        edList.push(a);
    });
})