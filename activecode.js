/**
 * Created by bmiller on 3/19/15.
 */

var edList = [];

var ActiveCode = function(orig, div, initialCode, lang) {
    var _this = this;
    var suffStart = -1;
    this.origElem = orig;
    this.divid = orig.id;
    this.code = $(orig).text();
    this.language = $(orig).data('lang');
    this.outerDiv = '';

    suffStart = this.code.indexOf('====');
    if (suffStart > -1) {
        this.suffix = this.code.substring(suffStart+5);
        this.code = this.code.substring(0,suffStart);
    }

    this.output = '' // create pre for output
    this.graphics = '' // create div for turtle graphics

    this.builtinRead = function (x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
    }

    this.ouputfun = function(text) {
        // bnm python 3
        var x = text;
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
    };

    this.runProg = function() {
        // In this function use _this because this will be the button
        var prog = _this.editor.getValue();
        // if includes
        if(_this.suffix) {
            prog = prog + _this.suffix;
        }

        Sk.configure({output : _this.ouputfun,
              read   : _this.builtinRead,
              python3: true,
              imageProxy : 'http://image.runestone.academy:8080/320x'
             });

        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = _this.graphics;
        $(_this.runButton).attr('disabled', 'disabled');
        $(_this.codeDiv).switchClass("col-md-12","col-md-6",{duration:500,queue:false})
        $(_this.outDiv).show({duration:700,queue:false});
        if(_this.language === 'python') {
            var myPromise = Sk.misceval.asyncToPromise(function() {
                return Sk.importMainWithBody("<stdin>", false, prog, true);
            });
            myPromise.then(function(mod) {
                $(_this.runButton).removeAttr('disabled');
                logRunEvent({'div_id': myDiv, 'code': prog, 'errinfo': 'success'}); // Log the run event
            },
                function(err) {
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

    }

    this.createEditor();
    this.createOutput();
    this.createControls();


}

ActiveCode.prototype.createEditor = function (index) {
    var newdiv = document.createElement('div');
    $(newdiv).addClass("ac_section alert alert-warning");
    var codeDiv = document.createElement("div");
    $(codeDiv).addClass("ac_code_div col-md-12");
    this.codeDiv = codeDiv;
    newdiv.id = this.divid;
    newdiv.lang = this.language;
    this.outerDiv = newdiv;

    $(this.origElem).replaceWith(newdiv);
    newdiv.appendChild(codeDiv);
    var editor = CodeMirror(codeDiv, {value: this.code, lineNumbers: true, mode: newdiv.lang});

    // Make the editor resizable
    $(editor.getWrapperElement()).resizable({
        resize: function() {
            editor.setSize($(this).width(), $(this).height());
            editor.refresh();
        }
    })
    this.editor = editor;
    }

ActiveCode.prototype.createControls = function () {
    var ctrlDiv = document.createElement("div");
    $(ctrlDiv).addClass("ac_actions");

    // Run
    var butt = document.createElement("button");
    $(butt).text("Run");
    $(butt).addClass("btn btn-success")
    ctrlDiv.appendChild(butt);
    this.runButton = butt;
    $(butt).click(this.runProg);
    
    // Save
    butt = document.createElement("button");
    $(butt).addClass("ac_opt btn btn-default");
    $(butt).text("Save");
    $(butt).css("margin-left","10px");
    ctrlDiv.appendChild(butt);

    // Load
    butt = document.createElement("button");
    $(butt).addClass("ac_opt btn btn-default");
    $(butt).text("Load");
    $(butt).css("margin-left","10px");
    ctrlDiv.appendChild(butt);

    $(this.outerDiv).prepend(ctrlDiv);

}

ActiveCode.prototype.createOutput = function () {
    var outDiv = document.createElement("div")
    $(outDiv).addClass("ac_output col-md-6");
    this.outDiv = outDiv;
    this.output = document.createElement('pre');
    this.graphics = document.createElement('div');
    $(this.graphics).addClass("ac-canvas");
    outDiv.appendChild(this.output)
    outDiv.appendChild(this.graphics);
    this.outerDiv.appendChild(outDiv);
    clearDiv = document.createElement("div");
    $(clearDiv).css("clear","both");
    this.outerDiv.appendChild(clearDiv);

}

ActiveCode.prototype.saveEditor = function () {

}

ActiveCode.prototype.loadEditor = function () {

}

ActiveCode.prototype.showCodeCoach = function () {

}

ActiveCode.prototype.showCodeLens = function () {

}

ActiveCode.prototype.toggleEditorVisibility = function () {

}


oldrunit = function(myDiv, theButton, includes, suffix) {
    //var prog = document.getElementById(myDiv + "_code").value;

    Sk.divid = myDiv;


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
    $('[data-component=activecode]').each( function(index ) {
        edList.push(new ActiveCode(this));
    });
});