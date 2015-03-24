/**
 * Created by bmiller on 3/19/15.
 */

function RunestoneBase() {

}

RunestoneBase.prototype.logBookEvent = function(info) {
    console.log("logging event " + this.divid);
};

RunestoneBase.prototype.logRunEvent = function(info) {
    console.log("running " + this.divid);
};

var edList = {};

ActiveCode.prototype = new RunestoneBase();

function ActiveCode(orig) {
    RunestoneBase.apply( this, arguments );  // call parent constructor
    var _this = this;
    var suffStart = -1;
    this.origElem = orig;
    this.divid = orig.id;
    this.code = $(orig).text();
    this.language = $(orig).data('lang');
    this.timelimit = $(orig).data('timelimit');
    this.includes = $(orig).data('include');
    this.runButton = null;
    this.saveButton = null;
    this.loadButton = null;
    this.outerDiv = null;
    this.output = null; // create pre for output
    this.graphics = null; // create div for turtle graphics

    if(this.includes !== undefined) {
        this.includes = this.includes.split(/\s+/);
    }

    suffStart = this.code.indexOf('====');
    if (suffStart > -1) {
        this.suffix = this.code.substring(suffStart+5);
        this.code = this.code.substring(0,suffStart);
    }


    this.builtinRead = function (x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
    };

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
        var pretext;
        var prog = _this.editor.getValue();
        // if includes
        $(_this.output).text('');

        if (_this.includes !== undefined) {
            // iterate over the includes, in-order prepending to prog
            pretext = "";
            for (var x=0; x < _this.includes.length; x++) {
                pretext = pretext + edList[_this.includes[x]].editor.getValue();
            }
            prog = pretext + prog
        }

        if(_this.suffix) {
            prog = prog + _this.suffix;
        }

        Sk.configure({output : _this.ouputfun,
              read   : _this.builtinRead,
              python3: true,
              imageProxy : 'http://image.runestone.academy:8080/320x'
             });
        _this.setTimeLimit();
        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = _this.graphics;
        $(_this.runButton).attr('disabled', 'disabled');
        $(_this.codeDiv).switchClass("col-md-12","col-md-6",{duration:500,queue:false});
        $(_this.outDiv).show({duration:700,queue:false});
        if(_this.language === 'python') {
            var myPromise = Sk.misceval.asyncToPromise(function() {
                return Sk.importMainWithBody("<stdin>", false, prog, true);
            });
            myPromise.then(function(mod) {
                $(_this.runButton).removeAttr('disabled');
                _this.logRunEvent({'div_id': _this.id, 'code': prog, 'errinfo': 'success'}); // Log the run event
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

        if (typeof(allVisualizers) != "undefined") {
            $.each(allVisualizers, function (i, e) {
                e.redrawConnectors();
            });
        }

    };

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
    });

    // give the user a visual cue that they have changed but not saved
    editor.on('change', (function () {
        if (editor.acEditEvent == false || editor.acEditEvent === undefined) {
            $(editor.getWrapperElement()).css('border-top', '2px solid #b43232');
            $(editor.getWrapperElement()).css('border-bottom', '2px solid #b43232');
            this.logBookEvent({'event': 'activecode', 'act': 'edit', 'div_id': this.divid});
        }
        editor.acEditEvent = true;
        }).bind(this));  // use bind to preserve *this* inside the on handler.

    this.editor = editor;
    };

ActiveCode.prototype.createControls = function () {
    var ctrlDiv = document.createElement("div");
    $(ctrlDiv).addClass("ac_actions");

    // Run
    var butt = document.createElement("button");
    $(butt).text("Run");
    $(butt).addClass("btn btn-success");
    ctrlDiv.appendChild(butt);
    this.runButton = butt;
    $(butt).click(this.runProg);

    // Save
    butt = document.createElement("button");
    $(butt).addClass("ac_opt btn btn-default");
    $(butt).text("Save");
    $(butt).css("margin-left","10px");
    this.saveButton = butt;
    ctrlDiv.appendChild(butt);

    // Load
    butt = document.createElement("button");
    $(butt).addClass("ac_opt btn btn-default");
    $(butt).text("Load");
    $(butt).css("margin-left","10px");
    this.loadButton = butt;
    ctrlDiv.appendChild(butt);

    $(this.outerDiv).prepend(ctrlDiv);

};

ActiveCode.prototype.createOutput = function () {
    var outDiv = document.createElement("div");
    $(outDiv).addClass("ac_output col-md-6");
    this.outDiv = outDiv;
    this.output = document.createElement('pre');
    this.graphics = document.createElement('div');
    $(this.graphics).addClass("ac-canvas");
    outDiv.appendChild(this.output);
    outDiv.appendChild(this.graphics);
    this.outerDiv.appendChild(outDiv);
    clearDiv = document.createElement("div");
    $(clearDiv).css("clear","both");
    this.outerDiv.appendChild(clearDiv);

};

ActiveCode.prototype.saveEditor = function () {

};

ActiveCode.prototype.loadEditor = function () {

};

ActiveCode.prototype.showCodeCoach = function () {

};

ActiveCode.prototype.showCodeLens = function () {

};

ActiveCode.prototype.toggleEditorVisibility = function () {

};

ActiveCode.prototype.setTimeLimit = function (timer) {
    var timelimit = this.timeLimit;
    if (timer !== undefined ) {
        timelimit = timer
    }
    // set execLimit in milliseconds  -- for student projects set this to
    // 25 seconds -- just less than Chrome's own timer.
    if (this.code.indexOf('ontimer') > -1 ||
        this.code.indexOf('onclick') > -1 ||
        this.code.indexOf('onkey') > -1  ||
        this.code.indexOf('setDelay') > -1 ) {
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

};


$(document).ready(function() {
    $('[data-component=activecode]').each( function(index ) {
        edList[this.id] = new ActiveCode(this);
    });
});