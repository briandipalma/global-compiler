var SuperClass = require("my.long.name.space.SuperClass");
var Field = require("my.long.name.space.Field");

function SimpleClass() {
	var test = new Field();
}

my.extend(SimpleClass, SuperClass);