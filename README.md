# newactivecode


See:  https://github.com/bnmnetp/runestone/wiki/RSE-0001

To try this out quickly do

    bower install codemirror
    bower install skulpt
    bower install jquery
    bower install jquery-ui

Then load the actest.html file into your browser.  It should look a lot like this:

Now HTML like this:

```html
<body>
<pre data-component="activecode" data-lang="python" id="test1">
def foo():
    print 'hello world'

foo()
</pre>

<pre data-component="activecode" data-lang="python" id="test2" data-include="test1 test2">
def main():
    print 'goodbye girl'

main()
====
print "This is hidden suffix code you don't see it in the editor"
</pre>

</body>
```

Can create a page that looks like this:

![screenshot](https://www.dropbox.com/s/fqvakeftnfa75gp/Screenshot%202015-03-23%2018.45.58.png?raw=1)
