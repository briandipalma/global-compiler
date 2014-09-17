var Reference = require("other/some/Reference");
var ClassWithConstants = require("my/constant/ClassWithConstants");
var SomeController = require("other/spaced/class/SomeController");
var SuperClass = require("my/long/name/space/SuperClass");
var my = require("my");
var ClassName = require("other/name/space/ClassName");
var Factory = require("my/other/name/space/Factory");
var Field = require("my/long/name/space/Field");
var Utility = require("my/simple/Utility");
var Utility;

function SimpleClass() {
	Utility = Utility;
	var test = new Field();
	this.aValue = Factory.callExpression('A Literal Value');
	ClassName.callExpression(42);
}

my.extend(SimpleClass, SuperClass);

SimpleClass.prototype._initMethod = function() {
	var SomeController = SomeController;
	var SomeConstants = ClassWithConstants.CONSTANTS_REFERENCE;

	this.controller = new SomeController(SomeConstants.A_CONSTANT, Reference.SOME_CONSTANT);

	this.controller.someCall(Reference.ANOTHER_CONSTANT);
}

SimpleClass.prototype.callToSuper = function() {
	SuperClass.prototype.callToSuper.call(this);
}
module.exports = SimpleClass;
