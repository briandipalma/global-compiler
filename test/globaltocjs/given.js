function SimpleClass() {
	var test = new my.long.name.space.Field();
	this.aValue = my.other.name.space.Factory.callExpression('A Literal Value');
	other.name.space.ClassName.callExpression(42);
}

my.extend(SimpleClass, my.long.name.space.SuperClass);

SimpleClass.prototype._initMethod = function() {
	var SomeController = other.spaced.class.SomeController;
	var SomeConstants = my.constant.ClassWithConstants.CONSTANTS;

	this.controller = new SomeController(SomeConstants.A_CONSTANT);
}
