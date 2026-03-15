import { ASTNode, NodeType } from 'bhai-lang-parser';

import SemanticError from './SemanticError';
import SymbolTable from './SymbolTable';

export default class SemanticAnalyzer {
  private symbolTable = new SymbolTable();
  private loopDepth = 0;

  analyze(node: ASTNode) {
    this.visitNode(node);
  }

  private visitNode(node: ASTNode) {
    switch (node.type) {
      case NodeType.Program:
        return this.visitProgram(node);
      case NodeType.InitStatement:
        return this.visitInitStatement(node);
      case NodeType.VariableStatement:
        return this.visitVariableStatement(node);
      case NodeType.VariableDeclaration:
        return this.visitVariableDeclaration(node);
      case NodeType.AssignmentExpression:
        return this.visitAssignmentExpression(node);
      case NodeType.IdentifierExpression:
        return this.visitIdentifierExpression(node);
      case NodeType.BlockStatement:
        return this.visitBlockStatement(node);
      case NodeType.IfStatement:
        return this.visitIfStatement(node);
      case NodeType.WhileStatement:
        return this.visitWhileStatement(node);
      case NodeType.BreakStatement:
        return this.visitBreakStatement(node);
      case NodeType.ContinueStatement:
        return this.visitContinueStatement(node);
      case NodeType.PrintStatement:
        return this.visitPrintStatement(node);
      case NodeType.ExpressionStatement:
        return this.visitExpressionStatement(node);
      case NodeType.BinaryExpression:
      case NodeType.LogicalExpression:
        return this.visitBinaryExpression(node);
      case NodeType.NumericLiteral:
      case NodeType.StringLiteral:
      case NodeType.BooleanLiteral:
      case NodeType.NullLiteral:
        return; // literals need no validation
      default:
        return; // unknown nodes are skipped safely
    }
  }

  private visitProgram(node: ASTNode) {
    if (node.body && !Array.isArray(node.body)) {
      this.visitNode(node.body);
    }
  }

  private visitInitStatement(node: ASTNode) {
    this.symbolTable.enterScope();
    if (Array.isArray(node.body)) {
      node.body.forEach((stmt: ASTNode) => this.visitNode(stmt));
    }
    this.symbolTable.exitScope();
  }

  private visitVariableStatement(node: ASTNode) {
    if (node.declarations) {
      node.declarations.forEach((decl: ASTNode) => this.visitNode(decl));
    }
  }

  private visitVariableDeclaration(node: ASTNode) {
    if (!node.id || !node.id.name) {
      throw new SemanticError('Variable declaration missing identifier.');
    }
    this.symbolTable.declare(node.id.name);
    if (node.init) {
      this.visitNode(node.init);
    }
  }

  private visitAssignmentExpression(node: ASTNode) {
    // left side must be a declared variable
    if (node.left && node.left.name) {
      this.symbolTable.resolve(node.left.name);
    }
    if (node.right) {
      this.visitNode(node.right);
    }
  }

  private visitIdentifierExpression(node: ASTNode) {
    if (!node.name) {
      throw new SemanticError('Identifier missing name.');
    }
    this.symbolTable.resolve(node.name);
  }

  private visitBlockStatement(node: ASTNode) {
    this.symbolTable.enterScope();
    if (Array.isArray(node.body)) {
      node.body.forEach((stmt: ASTNode) => this.visitNode(stmt));
    }
    this.symbolTable.exitScope();
  }

  private visitIfStatement(node: ASTNode) {
    if (node.test) this.visitNode(node.test);
    if (node.consequent) this.visitNode(node.consequent);
    if (node.alternates) {
      node.alternates.forEach((alt: ASTNode) => {
        if (alt.test) this.visitNode(alt.test);
        if (alt.consequent) this.visitNode(alt.consequent);
        // warna bhai (else) has no test — visit body directly
        if (!alt.test && alt.body) this.visitNode(alt);
      });
    }
  }

  private visitWhileStatement(node: ASTNode) {
    if (node.test) this.visitNode(node.test);
    this.loopDepth++;
    if (node.body && !Array.isArray(node.body)) {
      this.visitNode(node.body);
    }
    this.loopDepth--;
  }

  private visitBreakStatement(_node: ASTNode) {
    if (this.loopDepth === 0) {
      throw new SemanticError(`Kya "bas kar bhai"?? Loop kahan hai bhai?`);
    }
  }

  private visitContinueStatement(_node: ASTNode) {
    if (this.loopDepth === 0) {
      throw new SemanticError(`Kya "agla dekh bhai"?? Loop kahan hai bhai?`);
    }
  }

  private visitPrintStatement(node: ASTNode) {
    if (node.expressions) {
      node.expressions.forEach((expr: ASTNode) => this.visitNode(expr));
    }
  }

  private visitExpressionStatement(node: ASTNode) {
    if (node.expression) this.visitNode(node.expression);
  }

  private visitBinaryExpression(node: ASTNode) {
    if (node.left) this.visitNode(node.left);
    if (node.right) this.visitNode(node.right);
  }
}
