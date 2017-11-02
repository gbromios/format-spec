format-spec
===========

python-like format strings. Have a contrived example:

```javascript
 > var Fruit = function(name, count) {
     this.name = name; this.count = count;
   };

 > Fruit.prototype.display = function() {
     return this.name + (this.count === 1 ? '' : 's');
   };

 > "{0} is {1.mood} and has {1.snack.count} {1.snack.display}.".format(
     "Tony",
     {
       snack: new Fruit('Orange', 4),
       mood: "hungry"
     }
   );

 < "Tony is hungry and has 4 Oranges."
```

or, using the module itself (imported as `format_spec`):

```javascript
 > format_spec('{} and {}', 'cats', 'dogs');
 < "cats and dogs"
```

since js lacks keyword arguments, names without a position will look at the
first argument. so `{val}` and `{.val}` are both equivalent to `{0.val}`.

if a given arg is a function, it'll be called with no arguments, and, if it's
part of a nested name, with the assumption that its parent is the context. I
sorta want to add some way to specify arguments, but that seems like more
trouble that its worth. just make the call and pass the result into the format.

currently, only does basic interpolation, which is the part that's most useful
to me, but I will add actual formatting at some point.

modifies the global `String.prototype`, adding a function called `.format`.
at some point, I'll make it so that this can be configued via `requirejs`,
but for now, calling `format_spec.unbindGlobal([name])` will replace
`String.prototype.[name]` with whatever was there when the module was
loaded. `name` defaults to `format`. You can also bind whatever name you
want with `bindGlobal([name])`, again, defaults to `format`.
