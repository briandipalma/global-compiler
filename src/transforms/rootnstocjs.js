import {Visitor} from 'recast';
import {builders} from 'ast-types';

/**
 * SpiderMonkey AST node.
 * https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
 *
 * @typedef {Object} AstNode
 * @property {string} type - A string representing the AST variant type.
 */

/**
 * Converts all Expressions with a provided root namespace.
 * They will be mutated to flat Identifiers along with newly inserted CJS require statements.
 */
export class RootNamespaceVisitor extends Visitor {
	/**
	 * @param {string} rootNamespace - The root namespace.
	 */
	constructor(rootNamespace) {
		this._rootNamespace = rootNamespace;
	}

	/**
	 */
	visitNewExpression(node, ...args) {
		console.log('visit NewExpression', node, args);

		//A NewExpression `callee` value going from a MemberExpression to an Identifier.
		node.callee = builders.identifier('Field');

		this.genericVisit(node);
	}
}

/**
 */
function createIdentifier() {
}
